"""Unit test suite for Mirza Live Server streaming engine and process supervision.

Tests YouTube-mandated CBR/GOP command argument assembly, stream key redacting,
Windows subprocess flag determination, supervisor exponential backoff logic, and
multi-channel orchestrator state registries.
"""

import sys
from pathlib import Path
import pytest

from mirza.config.models import (
    AppConfig,
    AudioEncodingConfig,
    ChannelConfig,
    MonitoringConfig,
    PlaylistSettings,
    RestartPolicy,
    ServerConfig,
    VideoEncodingConfig,
)
from mirza.engine.ffmpeg_cmd import build_ffmpeg_command, get_windows_creation_flags, mask_command_secrets
from mirza.engine.orchestrator import Orchestrator
from mirza.engine.supervisor import ChannelSupervisor, SupervisorState


@pytest.fixture
def sample_channel_config() -> ChannelConfig:
    """Returns a sample ChannelConfig with known YouTube encoding parameters."""
    return ChannelConfig(
        channel_id="ch_test_stream",
        name="Test YouTube Channel",
        enabled=True,
        rtmp_url="rtmp://a.rtmp.youtube.com/live2",
        stream_key="live_secret_key_xxxx-yyyy-zzzz",
        media_folder=Path("media/test_folder"),
        video_encoding=VideoEncodingConfig(
            fps=30,
            bitrate_kbps=4500,
            preset="veryfast",
            pix_fmt="yuv420p",
        ),
        audio_encoding=AudioEncodingConfig(
            bitrate_kbps=128,
            sample_rate_hz=44100,
            channels=2,
        ),
        playlist_settings=PlaylistSettings(shuffle=False, loop=True),
        restart_policy=RestartPolicy(
            max_retries=5,
            retry_delay_seconds=5,
            backoff_multiplier=2.0,
            max_retry_delay_seconds=60,
        ),
    )


def test_build_ffmpeg_command_cbr_gop(sample_channel_config: ChannelConfig, tmp_path: Path) -> None:
    """Verifies that the generated argument list meets all YouTube Live requirements."""
    concat_file = tmp_path / "concat_ch_test_stream.txt"
    concat_file.touch()

    cmd = build_ffmpeg_command(
        ffmpeg_path="ffmpeg",
        concat_file=concat_file,
        channel_config=sample_channel_config,
    )

    # Check input flags
    assert "-re" in cmd
    assert "-f" in cmd and "concat" in cmd
    assert "-safe" in cmd and "0" in cmd

    # Check CBR video encoding flags
    assert "-b:v" in cmd and "4500k" in cmd
    assert "-maxrate" in cmd and "4500k" in cmd
    assert "-bufsize" in cmd and "9000k" in cmd
    assert "-preset" in cmd and "veryfast" in cmd
    assert "-pix_fmt" in cmd and "yuv420p" in cmd

    # Check exact 2-second GOP (60 frames at 30 fps)
    assert "-g" in cmd and "60" in cmd
    assert "-keyint_min" in cmd and "30" in cmd

    # Check audio flags
    assert "-c:a" in cmd and "aac" in cmd
    assert "-b:a" in cmd and "128k" in cmd

    # Check target RTMP URL concatenation
    assert cmd[-1] == "rtmp://a.rtmp.youtube.com/live2/live_secret_key_xxxx-yyyy-zzzz"


def test_mask_command_secrets(sample_channel_config: ChannelConfig, tmp_path: Path) -> None:
    """Ensure sensitive stream keys are stripped from loggable command arguments."""
    concat_file = tmp_path / "concat.txt"
    cmd = build_ffmpeg_command("ffmpeg", concat_file, sample_channel_config)

    masked = mask_command_secrets(cmd)
    assert "<REDACTED_STREAM_KEY>" in masked[-1]
    assert "live_secret_key" not in masked[-1]
    # Verify original command list remains unmutated
    assert "live_secret_key" in cmd[-1]


def test_get_windows_creation_flags(monkeypatch: pytest.MonkeyPatch) -> None:
    """Verifies subprocess creation flags suppress cmd windows on win32."""
    monkeypatch.setattr("sys.platform", "win32")
    assert get_windows_creation_flags() == 0x08000000

    monkeypatch.setattr("sys.platform", "linux")
    assert get_windows_creation_flags() == 0


def test_supervisor_exponential_backoff_calculation(sample_channel_config: ChannelConfig) -> None:
    """Verifies backoff delays double on each failure up to max_retry_delay_seconds."""
    supervisor = ChannelSupervisor(
        channel_config=sample_channel_config,
        server_config=ServerConfig(),
        monitoring_config=MonitoringConfig(),
    )

    # First failure -> initial retry delay (5s)
    supervisor._consecutive_failures = 1
    assert supervisor._calculate_backoff_delay() == 5.0

    # Second failure -> 5 * (2 ** 1) = 10s
    supervisor._consecutive_failures = 2
    assert supervisor._calculate_backoff_delay() == 10.0

    # Third failure -> 5 * (2 ** 2) = 20s
    supervisor._consecutive_failures = 3
    assert supervisor._calculate_backoff_delay() == 20.0

    # Seventh failure -> 5 * (2 ** 6) = 320s -> capped at max_retry_delay (60s)
    supervisor._consecutive_failures = 7
    assert supervisor._calculate_backoff_delay() == 60.0


def test_orchestrator_get_channel_summaries(sample_channel_config: ChannelConfig) -> None:
    """Verifies state registry summaries across multiple supervisors."""
    app_config = AppConfig(channels=[sample_channel_config])
    orchestrator = Orchestrator(app_config=app_config)

    supervisor = ChannelSupervisor(
        channel_config=sample_channel_config,
        server_config=app_config.server,
        monitoring_config=app_config.monitoring,
    )
    supervisor._state = SupervisorState.RUNNING
    supervisor._total_restarts = 2
    orchestrator._supervisors[sample_channel_config.channel_id] = supervisor

    summaries = orchestrator.get_channel_summaries()
    assert len(summaries) == 1
    assert summaries[0].channel_id == "ch_test_stream"
    assert summaries[0].state == SupervisorState.RUNNING
    assert summaries[0].total_restarts == 2
