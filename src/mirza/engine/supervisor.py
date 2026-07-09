"""Asynchronous process supervisor and auto-recovery loop.

Spawns and monitors individual FFmpeg child processes (`asyncio`), isolates raw
stderr telemetry into `_ffmpeg.log`, detects freeze timeouts and network drops,
generates structured JSON crash reports, and executes exponential backoff restarts.
"""

import asyncio
import json
import logging
import time
from datetime import datetime, timezone
from enum import Enum
from pathlib import Path
from typing import Optional

from mirza.config.models import ChannelConfig, MonitoringConfig, ServerConfig
from mirza.engine.crash_report import CrashReport, save_crash_report
from mirza.engine.ffmpeg_cmd import build_ffmpeg_command, get_windows_creation_flags, mask_command_secrets
from mirza.logger import get_channel_logger, get_ffmpeg_logger
from mirza.monitor.health import StreamHealthMonitor
from mirza.monitor.system import SystemHealthMonitor
from mirza.playlist.detector import MediaDetector
from mirza.playlist.manager import PlaylistEmptyError, PlaylistManager


class SupervisorState(str, Enum):
    """Lifecycle state enumerations for an active channel supervisor."""

    STOPPED = "STOPPED"
    STARTING = "STARTING"
    RUNNING = "RUNNING"
    RESTARTING = "RESTARTING"
    FAILED = "FAILED"


class ChannelSupervisor:
    """Orchestrates an individual channel's FFmpeg process, playlist loop, and auto-restart backoff.

    Attributes:
        channel_config: Channel parameters and restart policies (`ChannelConfig`).
        server_config: Global server paths (`ServerConfig`).
        monitoring_config: Hardware alert limits (`MonitoringConfig`).
        logger: Specialized rotating file logger (`logs/<channel_id>.log`).
        ffmpeg_logger: Isolated raw FFmpeg telemetry logger (`logs/<channel_id>_ffmpeg.log`).
    """

    def __init__(
        self,
        channel_config: ChannelConfig,
        server_config: ServerConfig,
        monitoring_config: MonitoringConfig,
        logger: Optional[logging.Logger] = None,
    ) -> None:
        """Initializes the channel supervisor.

        Args:
            channel_config: Configuration definition for this specific channel.
            server_config: Global server parameters (`ffmpeg_path`).
            monitoring_config: Hardware thresholds (`psutil`).
            logger: Optional channel logger override.
        """
        self.channel_config = channel_config
        self.server_config = server_config
        self.monitoring_config = monitoring_config
        self.logger = logger or get_channel_logger(channel_config.channel_id)
        self.ffmpeg_logger = get_ffmpeg_logger(channel_config.channel_id)

        # Initialize internal domain subsystems
        self.detector = MediaDetector(
            media_folder=channel_config.media_folder,
            logger=self.logger,
        )
        self.playlist_manager = PlaylistManager(
            channel_id=channel_config.channel_id,
            detector=self.detector,
            settings=channel_config.playlist_settings,
            logger=self.logger,
        )
        self.stream_monitor = StreamHealthMonitor(
            channel_id=channel_config.channel_id,
            target_fps=channel_config.video_encoding.fps,
            logger=self.logger,
        )
        self.system_monitor = SystemHealthMonitor(
            config=monitoring_config,
            logger=self.logger,
        )

        # Runtime state tracking
        self._state: SupervisorState = SupervisorState.STOPPED
        self._process: Optional[asyncio.subprocess.Process] = None
        self._consecutive_failures: int = 0
        self._total_restarts: int = 0
        self._is_running: bool = False
        self._supervision_task: Optional[asyncio.Task] = None
        self._last_stderr_lines: list[str] = []

    @property
    def state(self) -> SupervisorState:
        """Returns the current operational state of the supervisor."""
        return self._state

    @property
    def consecutive_failures(self) -> int:
        """Returns the consecutive failure count used for exponential backoff."""
        return self._consecutive_failures

    @property
    def total_restarts(self) -> int:
        """Returns the total number of auto-restarts performed since startup."""
        return self._total_restarts

    async def start(self) -> None:
        """Initiates the background asynchronous supervision loop."""
        if self._is_running:
            self.logger.warning(f"Supervisor for '{self.channel_config.channel_id}' is already running.")
            return

        self._is_running = True
        self._state = SupervisorState.STARTING
        self.logger.info(f"Starting ChannelSupervisor for '{self.channel_config.name}'...")
        self._supervision_task = asyncio.create_task(self._supervision_loop())

    async def stop(self) -> None:
        """Gracefully halts the supervision loop and terminates the child FFmpeg process."""
        self.logger.info(f"Stopping ChannelSupervisor for '{self.channel_config.channel_id}'...")
        self._is_running = False
        self._state = SupervisorState.STOPPED

        if self._supervision_task and not self._supervision_task.done():
            self._supervision_task.cancel()
            try:
                await self._supervision_task
            except asyncio.CancelledError:
                pass

        await self._terminate_process()
        self._cleanup_temp_files_and_save_state()
        self.logger.info(f"ChannelSupervisor '{self.channel_config.channel_id}' stopped cleanly.")

    def _cleanup_temp_files_and_save_state(self) -> None:
        """Cleans up temporary concat files and persists state snapshot upon shutdown."""
        try:
            concat_path = self.playlist_manager.playlists_dir / f"concat_{self.channel_config.channel_id}.txt"
            concat_path.unlink(missing_ok=True)
            self.logger.debug(f"Cleaned up temporary concat file: {concat_path}")
        except Exception as exc:
            self.logger.debug(f"Error while deleting concat file: {exc}")

        try:
            logs_dir = Path("logs")
            logs_dir.mkdir(parents=True, exist_ok=True)
            state_path = logs_dir / f"{self.channel_config.channel_id}_state.json"
            state_data = {
                "channel_id": self.channel_config.channel_id,
                "name": self.channel_config.name,
                "state": self._state.value,
                "total_restarts": self._total_restarts,
                "last_updated": datetime.now(timezone.utc).isoformat(),
            }
            state_path.write_text(json.dumps(state_data, indent=2), encoding="utf-8")
        except Exception as exc:
            self.logger.debug(f"Could not save state summary JSON: {exc}")

    async def _terminate_process(self) -> None:
        """Terminates the active child process, allowing up to 5 seconds before force kill."""
        if not self._process or self._process.returncode is not None:
            return

        try:
            self.logger.debug(f"Sending termination signal to FFmpeg (PID: {self._process.pid})...")
            self._process.terminate()
            try:
                await asyncio.wait_for(self._process.wait(), timeout=5.0)
            except asyncio.TimeoutError:
                self.logger.warning(f"FFmpeg (PID: {self._process.pid}) hung during terminate. Force killing...")
                self._process.kill()
                await self._process.wait()
        except ProcessLookupError:
            pass
        finally:
            self._process = None

    async def _consume_stderr(self, stderr_pipe: asyncio.StreamReader) -> None:
        """Asynchronously reads FFmpeg stderr line-by-line, isolating output and checking telemetry."""
        try:
            while not stderr_pipe.at_eof():
                line_bytes = await stderr_pipe.readline()
                if not line_bytes:
                    break
                line_str = line_bytes.decode("utf-8", errors="replace").strip()
                if line_str:
                    # Isolate raw FFmpeg output into logs/<channel_id>_ffmpeg.log
                    self.ffmpeg_logger.info(line_str)

                    # Maintain a small buffer of the last 15 lines for diagnostic crash reporting
                    self._last_stderr_lines.append(line_str)
                    if len(self._last_stderr_lines) > 15:
                        self._last_stderr_lines.pop(0)

                    health_metrics = self.stream_monitor.parse_stderr_line(line_str)
                    if health_metrics:
                        if health_metrics.is_network_error:
                            self.logger.error(
                                f"[Supervisor] Network disconnect confirmed on '{self.channel_config.channel_id}'. Triggering restart."
                            )
                            await self._terminate_process()
                            break
                        if health_metrics.is_frozen:
                            self.logger.error(
                                f"[Supervisor] Stream freeze confirmed on '{self.channel_config.channel_id}'."
                            )
                            await self._terminate_process()
                            break
        except asyncio.CancelledError:
            pass
        except Exception as exc:
            self.logger.error(f"Error reading FFmpeg stderr pipe: {exc}")

    async def _monitor_health_loop(self) -> None:
        """Periodically samples hardware metrics and checks freeze timeout bounds while running."""
        try:
            while self._is_running and self._process and self._process.returncode is None:
                await asyncio.sleep(self.monitoring_config.check_interval_seconds)
                self.system_monitor.sample_metrics()
                health = self.stream_monitor.check_health()
                if health.is_frozen or health.is_network_error:
                    self.logger.error(f"Issue detected via periodic health check on '{self.channel_config.channel_id}'. Restarting...")
                    await self._terminate_process()
                    break
        except asyncio.CancelledError:
            pass

    def _calculate_backoff_delay(self) -> float:
        """Computes exponential backoff delay based on consecutive failure count."""
        policy = self.channel_config.restart_policy
        if self._consecutive_failures <= 1:
            return float(policy.retry_delay_seconds)

        delay = policy.retry_delay_seconds * (policy.backoff_multiplier ** (self._consecutive_failures - 1))
        return min(float(delay), float(policy.max_retry_delay_seconds))

    async def _supervision_loop(self) -> None:
        """Main supervision lifecycle loop: generates playlist, runs FFmpeg, captures crashes, and auto-restarts."""
        while self._is_running:
            try:
                self._state = SupervisorState.STARTING
                self._last_stderr_lines.clear()

                # Step 1: Generate Windows-safe concat playlist (`concat.txt`)
                try:
                    concat_file = self.playlist_manager.generate_concat_file()
                except PlaylistEmptyError as empty_err:
                    self.logger.error(f"Cannot start stream: {empty_err}")
                    self.logger.info("Retrying playlist scan in 10 seconds...")
                    await asyncio.sleep(10.0)
                    continue

                # Step 2: Assemble strict YouTube CBR/GOP command arguments
                cmd = build_ffmpeg_command(
                    ffmpeg_path=self.server_config.ffmpeg_path,
                    concat_file=concat_file,
                    channel_config=self.channel_config,
                )

                safe_cmd_log = " ".join(mask_command_secrets(cmd))
                self.logger.info(f"Launching FFmpeg subprocess: {safe_cmd_log}")

                # Step 3: Spawn child subprocess cleanly on Windows without cmd popups
                self._process = await asyncio.create_subprocess_exec(
                    *cmd,
                    stdout=asyncio.subprocess.DEVNULL,
                    stderr=asyncio.subprocess.PIPE,
                    creationflags=get_windows_creation_flags(),
                )

                self._state = SupervisorState.RUNNING
                self.logger.info(f"Stream running for '{self.channel_config.channel_id}' (PID: {self._process.pid}).")

                # Step 4: Run concurrent telemetry tasks
                stderr_task = asyncio.create_task(self._consume_stderr(self._process.stderr))  # type: ignore
                health_loop_task = asyncio.create_task(self._monitor_health_loop())

                # Wait for child process to terminate naturally or via freeze/network trigger
                await self._process.wait()

                # Cleanup background tasks
                stderr_task.cancel()
                health_loop_task.cancel()

                if not self._is_running:
                    break

                # Step 5: Process exited or crashed unexpectedly while supervisor is active
                exit_code = self._process.returncode
                self.logger.warning(
                    f"FFmpeg process for '{self.channel_config.channel_id}' exited unexpectedly (Return Code: {exit_code})."
                )

                # Determine restart reason and capture crash telemetry
                health = self.stream_monitor.metrics
                if health.is_network_error:
                    reason = "NETWORK_INTERRUPTION"
                elif health.is_frozen:
                    reason = "STREAM_FREEZE"
                elif not health.is_healthy:
                    reason = "ENCODER_SLOWDOWN"
                else:
                    reason = "UNEXPECTED_EXIT"

                # Sample hardware snapshot for diagnostic report
                sys_metrics = self.system_monitor.sample_metrics()

                current_item = None
                if self.playlist_manager.items and self.playlist_manager.current_index > 0:
                    try:
                        current_item = self.playlist_manager.items[self.playlist_manager.current_index - 1].filename
                    except IndexError:
                        pass

                crash_report = CrashReport(
                    channel_id=self.channel_config.channel_id,
                    exit_code=exit_code,
                    current_media_file=current_item,
                    cpu_percent=sys_metrics.cpu_percent,
                    ram_percent=sys_metrics.ram_percent,
                    ram_used_mb=sys_metrics.ram_used_mb,
                    restart_reason=reason,
                    last_stderr_lines=list(self._last_stderr_lines),
                )
                report_path = save_crash_report(crash_report)
                self.logger.info(f"Saved crash diagnostic report to: {report_path}")

                self._consecutive_failures += 1
                self._total_restarts += 1
                self._state = SupervisorState.RESTARTING

                # Check max retries policy (`0` = infinite retries for 24/7 loops)
                policy = self.channel_config.restart_policy
                if policy.max_retries > 0 and self._consecutive_failures > policy.max_retries:
                    self.logger.critical(
                        f"Max restart attempts ({policy.max_retries}) exceeded for '{self.channel_config.channel_id}'. Halting channel."
                    )
                    self._state = SupervisorState.FAILED
                    self._is_running = False
                    self._cleanup_temp_files_and_save_state()
                    break

                # Step 6: Apply exponential backoff delay before restarting
                delay = self._calculate_backoff_delay()
                self.logger.info(
                    f"Auto-restart attempt #{self._consecutive_failures} in {delay:.1f} seconds (Backoff applied)..."
                )
                await asyncio.sleep(delay)

            except asyncio.CancelledError:
                break
            except Exception as fatal_error:
                self.logger.error(f"Fatal exception inside supervision loop for '{self.channel_config.channel_id}': {fatal_error}", exc_info=True)
                await asyncio.sleep(5.0)
