"""Unit test suite for Mirza Live Server system hardware and stream health monitors.

Tests `psutil`-based CPU/RAM threshold alerting, regex parsing of FFmpeg stderr
encoding telemetry strings, and stream freeze timeout detection.
"""

import time
from collections import namedtuple
import pytest

from mirza.config.models import MonitoringConfig
from mirza.monitor.health import StreamHealthMonitor
from mirza.monitor.system import SystemHealthMonitor


def test_system_health_monitor_normal(monkeypatch: pytest.MonkeyPatch) -> None:
    """Verifies SystemHealthMonitor metrics collection when below threshold limits."""
    monkeypatch.setattr("psutil.cpu_percent", lambda interval=None: 45.0)

    VMem = namedtuple("VMem", ["percent", "used", "total"])
    monkeypatch.setattr(
        "psutil.virtual_memory",
        lambda: VMem(percent=60.0, used=4 * 1024 * 1024 * 1024, total=16 * 1024 * 1024 * 1024),
    )

    config = MonitoringConfig(cpu_max_percent=85.0, ram_max_percent=90.0)
    monitor = SystemHealthMonitor(config=config)
    metrics = monitor.sample_metrics()

    assert metrics.cpu_percent == 45.0
    assert metrics.ram_percent == 60.0
    assert metrics.is_cpu_overloaded is False
    assert metrics.is_ram_overloaded is False


def test_system_health_monitor_overloaded(monkeypatch: pytest.MonkeyPatch) -> None:
    """Ensure overload flags are True when CPU/RAM exceed configured percentages."""
    monkeypatch.setattr("psutil.cpu_percent", lambda interval=None: 92.5)

    VMem = namedtuple("VMem", ["percent", "used", "total"])
    monkeypatch.setattr(
        "psutil.virtual_memory",
        lambda: VMem(percent=95.0, used=15 * 1024 * 1024 * 1024, total=16 * 1024 * 1024 * 1024),
    )

    config = MonitoringConfig(cpu_max_percent=85.0, ram_max_percent=90.0)
    monitor = SystemHealthMonitor(config=config)
    metrics = monitor.sample_metrics()

    assert metrics.is_cpu_overloaded is True
    assert metrics.is_ram_overloaded is True


def test_stream_health_monitor_parse_valid_stderr() -> None:
    """Verifies accurate regex extraction of frame, fps, bitrate, and speed multiplier."""
    monitor = StreamHealthMonitor(channel_id="ch_test", freeze_timeout_seconds=15.0)
    stderr_line = (
        "frame= 1234 fps= 30.0 q=28.0 size= 12345kB time=00:01:23.45 "
        "bitrate=4500.0kbits/s speed=1.00x"
    )

    metrics = monitor.parse_stderr_line(stderr_line)
    assert metrics is not None
    assert metrics.frame == 1234
    assert metrics.fps == 30.0
    assert metrics.bitrate_kbps == 4500.0
    assert metrics.speed_multiplier == 1.00
    assert metrics.is_healthy is True
    assert metrics.is_frozen is False


def test_stream_health_monitor_non_progress_line() -> None:
    """Ensure non-progress FFmpeg logs (e.g. startup info) return None cleanly."""
    monitor = StreamHealthMonitor(channel_id="ch_test")
    assert monitor.parse_stderr_line("Input #0, concat, from 'concat.txt':") is None
    assert monitor.parse_stderr_line("Stream #0:0: Video: h264, yuv420p") is None


def test_stream_health_monitor_freeze_detection() -> None:
    """Verifies that check_health flags is_frozen = True if no updates arrive within timeout."""
    monitor = StreamHealthMonitor(channel_id="ch_freeze", freeze_timeout_seconds=2.0)

    # First simulate a valid update
    monitor.parse_stderr_line("frame= 100 fps= 30.0 bitrate=4500.0kbits/s speed=1.0x")
    assert monitor.metrics.is_frozen is False

    # Artificially age the last update time by 3 seconds (> 2s timeout)
    monitor._metrics.last_update_time = time.time() - 3.5

    health = monitor.check_health()
    assert health.is_frozen is True
    assert health.is_healthy is False
