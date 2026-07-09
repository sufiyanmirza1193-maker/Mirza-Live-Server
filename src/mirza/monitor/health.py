"""Real-time FFmpeg stderr telemetry parser and stream freeze monitor.

Consumes standard error outputs from child `ffmpeg` encoding subprocesses,
extracting frame rate (`fps`), bitrate, and encoding speed (`speed`). Detects
stream stalls, buffer underruns, and freeze events to trigger automated restarts.
"""

import logging
import re
import time
from typing import Optional
from pydantic import BaseModel, Field


class StreamHealthMetrics(BaseModel):
    """Real-time encoding metrics extracted from FFmpeg progress output.

    Attributes:
        channel_id: Unique string identifier of the channel (`channel_main`).
        frame: Current frame number processed by the video encoder.
        fps: Current encoding speed in frames per second.
        bitrate_kbps: Current output stream bitrate in kbits/s.
        speed_multiplier: Encoding speed ratio (`1.0x` means native real-time).
        is_healthy: Whether encoding speed and update recency are within normal bounds.
        is_frozen: True if no telemetry arrived within `freeze_timeout_seconds` or speed < 0.5x.
        is_network_error: True if a connection reset or network disconnect signature is caught.
        last_update_time: Unix epoch timestamp (`time.time()`) when metrics were last updated.
    """

    channel_id: str
    frame: int = Field(default=0, ge=0)
    fps: float = Field(default=0.0, ge=0.0)
    bitrate_kbps: float = Field(default=0.0, ge=0.0)
    speed_multiplier: float = Field(default=1.0, ge=0.0)
    is_healthy: bool = Field(default=True)
    is_frozen: bool = Field(default=False)
    is_network_error: bool = Field(default=False)
    last_update_time: float = Field(default_factory=time.time)


# Compiled regular expressions for parsing standard FFmpeg stderr progress strings
_FRAME_REGEX = re.compile(r"frame=\s*(\d+)")
_FPS_REGEX = re.compile(r"fps=\s*([\d\.]+)")
_BITRATE_REGEX = re.compile(r"bitrate=\s*([\d\.]+)kbits/s")
_SPEED_REGEX = re.compile(r"speed=\s*([\d\.]+)x")

# Known network interruption substrings emitted by FFmpeg RTMP/TCP layers across POSIX and Windows
_NETWORK_ERROR_SIGNATURES = (
    "Connection reset by peer",
    "RTMP_Connect0, failed to connect",
    "Server returned 4",
    "Server returned 5",
    "Broken pipe",
    "Error writing trailer",
    "Connection timed out",
    "Network is unreachable",
    "Input/output error",
    "WSAGetLastError",
    "WSAECONNRESET",
    "10054",
    "No route to host",
    "Host is down",
    "Error in the pull function",
    "rtmp server sent error",
    "EOF on socket",
)


class StreamHealthMonitor:
    """Parses real-time FFmpeg stderr lines and monitors stream health/freeze state.

    Attributes:
        channel_id: Target channel identifier.
        target_fps: Configured target video framerate (used for deviation checks).
        freeze_timeout_seconds: Seconds without frame progression before reporting frozen.
        logger: Dedicated channel logger instance.
    """

    def __init__(
        self,
        channel_id: str,
        target_fps: int = 30,
        freeze_timeout_seconds: float = 15.0,
        logger: Optional[logging.Logger] = None,
    ) -> None:
        """Initializes the stream health monitor.

        Args:
            channel_id: Unique channel identifier string.
            target_fps: Target encoding framerate.
            freeze_timeout_seconds: Max allowed seconds without frame updates before freeze trigger.
            logger: Optional logger for emitting stream health diagnostics.
        """
        self.channel_id = channel_id
        self.target_fps = target_fps
        self.freeze_timeout_seconds = freeze_timeout_seconds
        self.logger = logger or logging.getLogger(f"mirza.monitor.health.{channel_id}")

        self._metrics = StreamHealthMetrics(
            channel_id=channel_id,
            last_update_time=time.time(),
        )

    @property
    def metrics(self) -> StreamHealthMetrics:
        """Returns a snapshot of the latest computed stream health metrics."""
        return self._metrics

    def parse_stderr_line(self, line: str) -> Optional[StreamHealthMetrics]:
        """Parses a single line of FFmpeg stderr output and updates internal state.

        FFmpeg emits progress strings such as:
        `frame= 1234 fps= 30.0 q=28.0 size= 12345kB time=00:01:23.45 bitrate=4500.0kbits/s speed=1.00x`

        Args:
            line: Raw string read from the child FFmpeg process stderr stream.

        Returns:
            Optional[StreamHealthMetrics]: Updated `StreamHealthMetrics` if the line contained
                progress telemetry or network errors, or None if it was general startup text.
        """
        if not line:
            return None

        # Check for network disconnection signatures first
        for signature in _NETWORK_ERROR_SIGNATURES:
            if signature.lower() in line.lower():
                self.logger.error(
                    f"[StreamHealth] NETWORK INTERRUPTION DETECTED on '{self.channel_id}': {line.strip()}"
                )
                self._metrics.is_healthy = False
                self._metrics.is_network_error = True
                return self._metrics

        if "frame=" not in line:
            return None

        frame_match = _FRAME_REGEX.search(line)
        fps_match = _FPS_REGEX.search(line)
        bitrate_match = _BITRATE_REGEX.search(line)
        speed_match = _SPEED_REGEX.search(line)

        if not frame_match:
            return None

        try:
            frame_val = int(frame_match.group(1))
            fps_val = float(fps_match.group(1)) if fps_match else self._metrics.fps
            bitrate_val = float(bitrate_match.group(1)) if bitrate_match else self._metrics.bitrate_kbps
            speed_val = float(speed_match.group(1)) if speed_match else self._metrics.speed_multiplier
        except ValueError:
            return None

        now = time.time()
        self._metrics = StreamHealthMetrics(
            channel_id=self.channel_id,
            frame=frame_val,
            fps=fps_val,
            bitrate_kbps=bitrate_val,
            speed_multiplier=speed_val,
            is_healthy=True,
            is_frozen=False,
            last_update_time=now,
        )

        return self.check_health()

    def check_health(self) -> StreamHealthMetrics:
        """Evaluates current encoding status against freeze timeouts and speed limits.

        If no frame progress has occurred within `freeze_timeout_seconds` or if the
        encoding speed multiplier has fallen dangerously low (`<= 0.5x`), flags the stream
        as unhealthy and frozen so that `ChannelSupervisor` can restart the process.

        Returns:
            StreamHealthMetrics: Evaluated stream status metrics.
        """
        now = time.time()
        elapsed_since_update = now - self._metrics.last_update_time

        # Check for stream freeze (no stderr telemetry progression within timeout window)
        if elapsed_since_update > self.freeze_timeout_seconds:
            if self._metrics.is_healthy or not self._metrics.is_frozen:
                self.logger.error(
                    f"[StreamHealth] FREEZE DETECTED on '{self.channel_id}': "
                    f"No frame updates received for {elapsed_since_update:.1f} seconds!"
                )
            self._metrics.is_healthy = False
            self._metrics.is_frozen = True
            return self._metrics

        # Check for severe encoder slowdown / buffer underrun condition
        if self._metrics.speed_multiplier < 0.5 and self._metrics.frame > 30:
            if self._metrics.is_healthy:
                self.logger.warning(
                    f"[StreamHealth] ENCODER SLOWDOWN on '{self.channel_id}': "
                    f"Speed={self._metrics.speed_multiplier:.2f}x (FPS={self._metrics.fps:.1f}). "
                    "Risk of RTMP buffer underrun!"
                )
            self._metrics.is_healthy = False
            return self._metrics

        self._metrics.is_healthy = True
        self._metrics.is_frozen = False
        return self._metrics
