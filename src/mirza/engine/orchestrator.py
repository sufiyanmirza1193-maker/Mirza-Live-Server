"""Multi-channel state registry and concurrent supervisor orchestrator.

Manages active `ChannelSupervisor` lifecycle instances across all configured
livestreams, handles concurrent start/stop operations (`asyncio`), and exposes
a unified status registry for CLI reporting and future v2 API integrations.
"""

import asyncio
import logging
from typing import Dict, List, Optional
from pydantic import BaseModel, Field

from mirza.config.models import AppConfig
from mirza.engine.supervisor import ChannelSupervisor, SupervisorState
from mirza.logger import get_channel_logger


class ChannelStateSummary(BaseModel):
    """Unified status snapshot of an active channel stream.

    Attributes:
        channel_id: Unique string ID of the channel.
        name: Human-readable channel display name.
        state: Current supervisor state (`RUNNING`, `RESTARTING`, `STOPPED`, `FAILED`).
        consecutive_failures: Consecutive restart failures tracked by supervisor.
        total_restarts: Total auto-restarts executed since server boot.
        fps: Latest encoding frames per second telemetry.
        bitrate_kbps: Latest encoding bitrate telemetry.
        speed_multiplier: Latest encoding speed multiplier (`1.0x`).
        is_healthy: Whether stream speed and progress are nominal.
        is_frozen: Whether stream freeze condition is active.
    """

    channel_id: str
    name: str
    state: SupervisorState
    consecutive_failures: int = Field(default=0)
    total_restarts: int = Field(default=0)
    fps: float = Field(default=0.0)
    bitrate_kbps: float = Field(default=0.0)
    speed_multiplier: float = Field(default=0.0)
    is_healthy: bool = Field(default=True)
    is_frozen: bool = Field(default=False)


class Orchestrator:
    """Master multi-channel controller maintaining the application's runtime state registry.

    Attributes:
        app_config: Validated master Pydantic configuration (`AppConfig`).
        logger: System-level logger for orchestrator events.
    """

    def __init__(
        self,
        app_config: AppConfig,
        logger: Optional[logging.Logger] = None,
    ) -> None:
        """Initializes the multi-channel orchestrator.

        Args:
            app_config: Master application configuration.
            logger: Optional system logger override.
        """
        self.app_config = app_config
        self.logger = logger or logging.getLogger("mirza.engine.orchestrator")
        self._supervisors: Dict[str, ChannelSupervisor] = {}

    @property
    def supervisors(self) -> Dict[str, ChannelSupervisor]:
        """Returns the dictionary mapping channel IDs to active supervisor instances."""
        return self._supervisors

    def has_active_channels(self) -> bool:
        """Returns True if at least one channel supervisor is registered and active."""
        return bool(self._supervisors)

    async def start_channels(self, target_channel_id: Optional[str] = None) -> None:
        """Spawns asynchronous supervisors for all enabled channels (or a filtered target).

        Args:
            target_channel_id: If provided, only starts the specific channel ID matching this string.
        """
        enabled_channels = self.app_config.get_enabled_channels()

        if target_channel_id:
            enabled_channels = [ch for ch in enabled_channels if ch.channel_id == target_channel_id]
            if not enabled_channels:
                self.logger.error(f"Target channel '{target_channel_id}' is either disabled or not configured in config.yaml!")
                return

        if not enabled_channels:
            self.logger.warning("No enabled channels found in configuration. No streams started.")
            return

        self.logger.info(f"Booting {len(enabled_channels)} livestream channel(s)...")

        for ch_config in enabled_channels:
            if ch_config.channel_id in self._supervisors:
                self.logger.warning(f"Channel '{ch_config.channel_id}' is already registered and running.")
                continue

            supervisor = ChannelSupervisor(
                channel_config=ch_config,
                server_config=self.app_config.server,
                monitoring_config=self.app_config.monitoring,
                logger=get_channel_logger(ch_config.channel_id),
            )
            self._supervisors[ch_config.channel_id] = supervisor
            await supervisor.start()

        self.logger.info("All targeted channel supervisors booted successfully.")

    async def stop_all(self) -> None:
        """Concurrently stops all active channel supervisors (`asyncio.gather`)."""
        if not self._supervisors:
            self.logger.info("No active supervisors to stop.")
            return

        self.logger.info(f"Initiating graceful shutdown for all {len(self._supervisors)} active channel(s)...")
        stop_tasks = [supervisor.stop() for supervisor in self._supervisors.values()]
        await asyncio.gather(*stop_tasks, return_exceptions=True)
        self._supervisors.clear()
        self.logger.info("All channel supervisors shut down cleanly.")

    def get_channel_summaries(self) -> List[ChannelStateSummary]:
        """Collects real-time state snapshots across all registered channel supervisors.

        Returns:
            List[ChannelStateSummary]: Unified status registry objects ready for CLI or API output.
        """
        summaries: List[ChannelStateSummary] = []
        for ch_id, supervisor in self._supervisors.items():
            metrics = supervisor.stream_monitor.metrics
            summary = ChannelStateSummary(
                channel_id=ch_id,
                name=supervisor.channel_config.name,
                state=supervisor.state,
                consecutive_failures=supervisor.consecutive_failures,
                total_restarts=supervisor.total_restarts,
                fps=metrics.fps,
                bitrate_kbps=metrics.bitrate_kbps,
                speed_multiplier=metrics.speed_multiplier,
                is_healthy=metrics.is_healthy,
                is_frozen=metrics.is_frozen,
            )
            summaries.append(summary)
        return summaries
