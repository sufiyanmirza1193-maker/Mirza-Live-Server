"""Unit test suite for Mirza Live Server playlist management and media detection.

Tests Windows path sanitization (`safe_ffmpeg_path`), folder scanning, dynamic
video drop detection, shuffling, looping, and FFmpeg concat file generation.
"""

from pathlib import Path
from unittest.mock import patch
import pytest

from mirza.config.models import PlaylistSettings
from mirza.playlist.detector import MediaDetector
from mirza.playlist.item import MediaItem
from mirza.playlist.manager import PlaylistEmptyError, PlaylistManager


def test_media_item_safe_ffmpeg_path(tmp_path: Path) -> None:
    """Verifies that MediaItem converts Windows paths to forward slashes cleanly."""
    video_path = tmp_path / "subfolder" / "test_video.mp4"
    video_path.parent.mkdir(parents=True, exist_ok=True)
    video_path.touch()

    item = MediaItem(path=video_path)
    safe_path = item.safe_ffmpeg_path

    # Ensure no backslashes exist in the safe path string
    assert "\\" not in safe_path
    assert safe_path.endswith("subfolder/test_video.mp4")
    assert item.filename == "test_video.mp4"


def test_unsupported_file_extension_raises(tmp_path: Path) -> None:
    """Ensure MediaItem rejects non-video extensions (.txt, .xyz)."""
    text_file = tmp_path / "notes.txt"
    text_file.touch()

    with pytest.raises(ValueError) as exc_info:
        MediaItem(path=text_file)
    assert "Unsupported video file extension '.txt'" in str(exc_info.value)


@patch("mirza.playlist.validator.MediaValidator.validate_file", return_value=(True, "Valid"))
def test_media_detector_scan_and_changes(mock_validate, tmp_path: Path) -> None:
    """Verifies scanning directory and detecting added/removed files across loops."""
    media_dir = tmp_path / "channel_test"
    detector = MediaDetector(media_folder=media_dir)

    # First scan on empty directory should return empty list
    items = detector.scan()
    assert len(items) == 0

    # Add two video files and an ignored text file
    (media_dir / "video_1.mp4").touch()
    (media_dir / "video_2.mkv").touch()
    (media_dir / "readme.txt").touch()

    current_items, has_changed = detector.detect_changes(items)
    assert len(current_items) == 2
    assert has_changed is True
    assert {item.filename for item in current_items} == {"video_1.mp4", "video_2.mkv"}

    # Running detect_changes again without adding/removing files should report has_changed = False
    next_items, next_changed = detector.detect_changes(current_items)
    assert next_changed is False
    assert len(next_items) == 2


def test_playlist_manager_empty_raises(tmp_path: Path) -> None:
    """Ensure PlaylistEmptyError is raised if folder has no valid videos."""
    empty_dir = tmp_path / "empty_media"
    detector = MediaDetector(media_folder=empty_dir)
    settings = PlaylistSettings(shuffle=False, loop=True)
    manager = PlaylistManager(
        channel_id="ch_empty", detector=detector, settings=settings, playlists_dir=tmp_path
    )

    with pytest.raises(PlaylistEmptyError):
        manager.refresh_playlist()


@patch("mirza.playlist.validator.MediaValidator.validate_file", return_value=(True, "Valid"))
def test_playlist_manager_sequential_and_looping(mock_validate, tmp_path: Path) -> None:
    """Verifies sequential playback advancing and loop cycle incrementing."""
    media_dir = tmp_path / "seq_media"
    media_dir.mkdir()
    (media_dir / "a_video.mp4").touch()
    (media_dir / "b_video.mp4").touch()

    detector = MediaDetector(media_folder=media_dir)
    settings = PlaylistSettings(shuffle=False, loop=True)
    manager = PlaylistManager(
        channel_id="ch_seq", detector=detector, settings=settings, playlists_dir=tmp_path
    )

    item1 = manager.get_next_item()
    assert item1 is not None and item1.filename == "a_video.mp4"
    assert manager.current_index == 1

    item2 = manager.get_next_item()
    assert item2 is not None and item2.filename == "b_video.mp4"
    assert manager.current_index == 2
    assert manager.loop_count == 0

    # Next call should trigger loop cycle #1 and return item index 0 again
    item3 = manager.get_next_item()
    assert item3 is not None and item3.filename == "a_video.mp4"
    assert manager.loop_count == 1
    assert manager.current_index == 1


@patch("mirza.playlist.validator.MediaValidator.validate_file", return_value=(True, "Valid"))
def test_generate_concat_file_windows_syntax(mock_validate, tmp_path: Path) -> None:
    """Verifies that generated concat.txt contains clean file 'C:/...' syntax."""
    media_dir = tmp_path / "concat_media"
    media_dir.mkdir()
    (media_dir / "clip1.mp4").touch()
    (media_dir / "clip2.mkv").touch()

    detector = MediaDetector(media_folder=media_dir)
    settings = PlaylistSettings(shuffle=False, loop=True)
    playlists_dir = tmp_path / "out_playlists"
    manager = PlaylistManager(
        channel_id="ch_concat", detector=detector, settings=settings, playlists_dir=playlists_dir
    )

    concat_file = manager.generate_concat_file()
    assert concat_file.exists()

    content = concat_file.read_text(encoding="utf-8")
    assert "file '" in content
    assert "\\" not in content  # No unescaped backslashes allowed
    assert "clip1.mp4" in content and "clip2.mkv" in content

