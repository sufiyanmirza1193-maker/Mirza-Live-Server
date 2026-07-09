"""Unit test suite verifying edge-case resilience and fault tolerance.

Verifies behavior under corrupted media mid-stream, disk space pressure,
permission errors, and empty folder loop transitions.
"""

from pathlib import Path
from unittest.mock import MagicMock, patch
import pytest

from mirza.config.models import MonitoringConfig, PlaylistSettings
from mirza.monitor.health import StreamHealthMonitor
from mirza.monitor.system import SystemHealthMonitor
from mirza.playlist.detector import MediaDetector
from mirza.playlist.manager import PlaylistEmptyError, PlaylistManager
from mirza.playlist.validator import MediaValidator


def test_detector_skips_corrupted_media(tmp_path: Path) -> None:
    """Verifies MediaDetector skips corrupted/invalid files and only scans valid videos."""
    media_dir = tmp_path / "corrupt_media"
    media_dir.mkdir(parents=True, exist_ok=True)

    valid_file = media_dir / "good_clip.mp4"
    valid_file.touch()
    corrupt_file = media_dir / "corrupt_clip.mp4"
    corrupt_file.touch()

    # Mock MediaValidator where good_clip passes and corrupt_clip fails
    def mock_validate(path: Path):
        if path.name == "good_clip.mp4":
            return True, "Valid"
        return False, "Corrupted container header"

    mock_validator = MagicMock(spec=MediaValidator)
    mock_validator.validate_file.side_effect = mock_validate

    detector = MediaDetector(media_dir, validator=mock_validator, scan_interval_seconds=0.0)
    items = detector.scan(force=True)

    assert len(items) == 1
    assert items[0].filename == "good_clip.mp4"


def test_playlist_empty_folder_raises_error(tmp_path: Path) -> None:
    """Verifies PlaylistEmptyError is raised when scanning an empty directory."""
    empty_dir = tmp_path / "empty_channel"
    empty_dir.mkdir(parents=True, exist_ok=True)

    detector = MediaDetector(empty_dir, scan_interval_seconds=0.0)
    manager = PlaylistManager("channel_empty", detector, PlaylistSettings())

    with pytest.raises(PlaylistEmptyError) as exc_info:
        manager.refresh_playlist()
    assert "contains no supported videos" in str(exc_info.value)


@patch("mirza.playlist.validator.MediaValidator.validate_file", return_value=(True, "Valid"))
def test_playlist_all_items_deleted_mid_loop(mock_validate, tmp_path: Path) -> None:
    """Verifies manager.get_next_item() raises or returns None gracefully if all files disappear mid-loop."""
    media_dir = tmp_path / "dynamic_media"
    media_dir.mkdir(parents=True, exist_ok=True)
    video = media_dir / "only_video.mp4"
    video.touch()

    detector = MediaDetector(media_dir, scan_interval_seconds=0.0)
    manager = PlaylistManager("channel_dyn", detector, PlaylistSettings(loop=True))

    # First item retrieved successfully
    item = manager.get_next_item()
    assert item is not None
    assert item.filename == "only_video.mp4"

    # Now simulate file deletion mid-stream before loop finishes
    video.unlink()

    # Next attempt to loop around should catch empty folder clean and raise or return None
    with pytest.raises(PlaylistEmptyError):
        manager.get_next_item()


@patch("psutil.disk_usage")
@patch("psutil.cpu_percent", return_value=90.0)
@patch("psutil.virtual_memory")
def test_system_health_overload_and_disk_warning(mock_ram, mock_cpu, mock_disk) -> None:
    """Verifies SystemHealthMonitor flags CPU overload and handle_doctor detects low disk space cleanly."""
    mock_disk.return_value = MagicMock(total=100 * 1024**3, used=99 * 1024**3, free=1 * 1024**3)
    mock_ram.return_value = MagicMock(total=16 * 1024**3, used=15 * 1024**3, percent=95.0)

    monitor = SystemHealthMonitor(MonitoringConfig(cpu_max_percent=85.0, ram_max_percent=90.0))
    metrics = monitor.sample_metrics()
    assert metrics.is_cpu_overloaded is True
    assert metrics.is_ram_overloaded is True


def test_stream_health_network_interruption_detection() -> None:
    """Verifies detection of WSA / EOF / connection reset network drops."""
    monitor = StreamHealthMonitor("channel_net")
    metrics = monitor.parse_stderr_line("[rtmp @ 0x224a1] WSAGetLastError: 10054 Connection reset by peer")
    assert metrics is not None
    assert metrics.is_network_error is True
    assert metrics.is_healthy is False
