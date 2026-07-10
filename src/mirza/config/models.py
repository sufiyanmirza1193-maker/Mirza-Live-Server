"""Pydantic configuration models for Mirza Live Server.

Enforces strict type checks, value validation, and sensible defaults across
global server settings, monitoring parameters, and multi-channel definitions.
"""

from pathlib import Path
from typing import List
from pydantic import BaseModel, Field, field_validator, model_validator


class VideoEncodingConfig(BaseModel):
    """Configuration schema for FFmpeg video stream encoding.

    Attributes:
        resolution: Target resolution string (e.g., '1920x1080' or '1280x720').
        fps: Target frames per second (e.g., 30 or 60).
        bitrate_kbps: Constant video encoding bitrate in kbits/s.
        preset: x264 encoding preset (e.g., 'veryfast', 'superfast').
        pix_fmt: Pixel format (YouTube requires 'yuv420p').
    """

    resolution: str = Field(default="1920x1080", min_length=5)
    fps: int = Field(default=30, gt=0, le=120)
    bitrate_kbps: int = Field(default=4500, gt=100, le=50000)
    preset: str = Field(default="veryfast", min_length=2)
    pix_fmt: str = Field(default="yuv420p", min_length=4)

    @field_validator("resolution")
    @classmethod
    def validate_resolution(cls, value: str) -> str:
        """Validates that resolution string matches WidthxHeight format."""
        if "x" not in value:
            raise ValueError("Resolution must be formatted as WIDTHxHEIGHT (e.g., '1920x1080').")
        parts = value.split("x")
        if len(parts) != 2 or not all(part.isdigit() and int(part) > 0 for part in parts):
            raise ValueError("Resolution dimensions must be positive integers.")
        return value

    @field_validator("preset")
    @classmethod
    def validate_preset(cls, value: str) -> str:
        """Validates that preset string matches standard x264 profile names."""
        valid_presets = {"ultrafast", "superfast", "veryfast", "faster", "fast", "medium", "slow", "slower", "veryslow"}
        if value.lower() not in valid_presets:
            raise ValueError(f"Invalid x264 preset '{value}'. Must be one of: {', '.join(sorted(valid_presets))}")
        return value.lower()

    @property
    def gop_size(self) -> int:
        """Calculates exact Group of Pictures (GOP) interval mandated by YouTube.

        YouTube Live ingestion requires a strict 2-second keyframe interval.

        Returns:
            int: Keyframe interval in frames (`2 * fps`).
        """
        return self.fps * 2


class AudioEncodingConfig(BaseModel):
    """Configuration schema for FFmpeg audio stream encoding.

    Attributes:
        bitrate_kbps: Audio encoding bitrate in kbits/s.
        sample_rate_hz: Audio sample frequency (e.g., 44100 or 48000).
        channels: Number of audio channels (2 for stereo).
    """

    bitrate_kbps: int = Field(default=128, gt=32, le=512)
    sample_rate_hz: int = Field(default=44100, gt=8000, le=192000)
    channels: int = Field(default=2, gt=0, le=8)


class PlaylistSettings(BaseModel):
    """Configuration schema governing media folder playback order and looping.

    Attributes:
        shuffle: Whether to randomize playlist ordering upon directory rescan.
        loop: Whether to loop the playlist infinitely when all items complete.
        transition: Name of transition mode ('none' in v1).
    """

    shuffle: bool = Field(default=True)
    loop: bool = Field(default=True)
    transition: str = Field(default="none")


class RestartPolicy(BaseModel):
    """Supervision and backoff policy for recovering from FFmpeg crashes.

    Attributes:
        max_retries: Maximum consecutive restart attempts (0 = infinite retries).
        retry_delay_seconds: Base initial delay in seconds before first restart attempt.
        backoff_multiplier: Multiplier applied to retry delay on repeated failures.
        max_retry_delay_seconds: Maximum upper limit for backoff delay.
    """

    max_retries: int = Field(default=0, ge=0)
    retry_delay_seconds: int = Field(default=5, gt=0)
    backoff_multiplier: float = Field(default=2.0, ge=1.0)
    max_retry_delay_seconds: int = Field(default=60, gt=0)

    @model_validator(mode="after")
    def validate_retry_bounds(self) -> "RestartPolicy":
        """Ensures base retry delay does not exceed the maximum backoff delay limit."""
        if self.retry_delay_seconds > self.max_retry_delay_seconds:
            raise ValueError("retry_delay_seconds cannot be greater than max_retry_delay_seconds.")
        return self


class ChannelConfig(BaseModel):
    """Complete specification for a single YouTube livestream channel.

    Attributes:
        channel_id: Unique identifier used in logs and CLI filters (`channel_main`).
        name: Human-readable descriptive name for the channel.
        enabled: Whether this channel should start automatically with the server.
        rtmp_url: RTMP ingestion endpoint (e.g., `rtmp://a.rtmp.youtube.com/live2`).
        stream_key: Secret YouTube stream key (must be loaded via .env).
        media_folder: Path where video files are monitored and ingested.
        video_encoding: Video encoding parameters (`VideoEncodingConfig`).
        audio_encoding: Audio encoding parameters (`AudioEncodingConfig`).
        playlist_settings: Playlist behavior parameters (`PlaylistSettings`).
        restart_policy: Process supervision policy (`RestartPolicy`).
    """

    channel_id: str = Field(..., min_length=1)
    name: str = Field(default="Unnamed Channel")
    enabled: bool = Field(default=True)
    rtmp_url: str = Field(default="rtmp://a.rtmp.youtube.com/live2", min_length=10)
    stream_key: str = Field(..., min_length=4)
    media_folder: Path = Field(default=Path("media/channel_main"))
    video_encoding: VideoEncodingConfig = Field(default_factory=VideoEncodingConfig)
    audio_encoding: AudioEncodingConfig = Field(default_factory=AudioEncodingConfig)
    playlist_settings: PlaylistSettings = Field(default_factory=PlaylistSettings)
    restart_policy: RestartPolicy = Field(default_factory=RestartPolicy)

    @field_validator("stream_key")
    @classmethod
    def validate_stream_key(cls, value: str) -> str:
        """Prevents blank stream keys or unresolved placeholder strings."""
        if not value or value.strip() == "":
            raise ValueError("stream_key cannot be empty.")
        if value.startswith("${") and value.endswith("}"):
            raise ValueError(f"Unresolved environment variable placeholder in stream_key: {value}")
        return value.strip().strip("/")


class ServerConfig(BaseModel):
    """Global system-level server configuration.

    Attributes:
        log_level: Master logging level ('INFO', 'DEBUG', 'WARNING', 'ERROR').
        ffmpeg_path: Command name or absolute path pointing to FFmpeg binary.
    """

    log_level: str = Field(default="INFO")
    ffmpeg_path: str = Field(default="ffmpeg")


class MonitoringConfig(BaseModel):
    """Hardware telemetry threshold configuration (`psutil`).

    Attributes:
        cpu_max_percent: Alert threshold percentage for host CPU utilization.
        ram_max_percent: Alert threshold percentage for host RAM consumption.
        check_interval_seconds: Polling interval in seconds to sample system metrics.
    """

    cpu_max_percent: float = Field(default=85.0, gt=0.0, le=100.0)
    ram_max_percent: float = Field(default=90.0, gt=0.0, le=100.0)
    check_interval_seconds: int = Field(default=10, gt=0)


class AppConfig(BaseModel):
    """Root master configuration model encapsulating all server definitions.

    Attributes:
        server: Global server and logging settings (`ServerConfig`).
        monitoring: Hardware monitoring thresholds (`MonitoringConfig`).
        channels: List of channel specifications (`ChannelConfig`).
    """

    server: ServerConfig = Field(default_factory=ServerConfig)
    monitoring: MonitoringConfig = Field(default_factory=MonitoringConfig)
    channels: List[ChannelConfig] = Field(default_factory=list)

    def get_enabled_channels(self) -> List[ChannelConfig]:
        """Filters and returns only the channels configured as `enabled: true`.

        Returns:
            List[ChannelConfig]: Active channel configurations.
        """
        return [ch for ch in self.channels if ch.enabled]
