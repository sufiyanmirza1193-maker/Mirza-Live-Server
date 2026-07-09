"""Unit test suite for MediaValidator and ffprobe inspection caching.

Tests codec probing, resolution/fps extraction, corrupted header skipping, and st_mtime caching.
"""

from pathlib import Path
from unittest.mock import MagicMock, patch
import pytest

from mirza.playlist.validator import MediaValidator


def test_validator_ffprobe_availability_check() -> None:
    """Verifies is_ffprobe_available behavior."""
    with patch("subprocess.run") as mock_run:
        mock_run.return_value = MagicMock(returncode=0)
        validator = MediaValidator(ffprobe_path="mock_ffprobe")
        assert validator.is_ffprobe_available() is True

        mock_run.side_effect = FileNotFoundError()
        assert validator.is_ffprobe_available() is False


def test_validator_missing_file_returns_false(tmp_path: Path) -> None:
    """Ensure non-existent paths return False immediately."""
    validator = MediaValidator()
    valid, msg = validator.validate_file(tmp_path / "nonexistent.mp4")
    assert valid is False
    assert "File not found" in msg


def test_validator_ffprobe_unavailable_fallback(tmp_path: Path) -> None:
    """Ensure validation passes with fallback if ffprobe is not on PATH."""
    video_path = tmp_path / "video.mp4"
    video_path.touch()

    with patch.object(MediaValidator, "is_ffprobe_available", return_value=False):
        validator = MediaValidator()
        valid, msg = validator.validate_file(video_path)
        assert valid is True
        assert msg == "ffprobe_unavailable_pass"


def test_validator_corrupted_or_invalid_codec(tmp_path: Path) -> None:
    """Ensure ffprobe non-zero returncode or invalid json marks file as corrupted."""
    bad_video = tmp_path / "bad.mp4"
    bad_video.touch()

    with patch.object(MediaValidator, "is_ffprobe_available", return_value=True):
        with patch("subprocess.run") as mock_run:
            mock_run.return_value = MagicMock(returncode=1, stderr="Invalid data found when processing input")
            validator = MediaValidator()
            valid, msg = validator.validate_file(bad_video)
            assert valid is False
            assert "Corrupted container or unreadable header" in msg


def test_validator_st_mtime_caching(tmp_path: Path) -> None:
    """Ensure repeated validations of unchanged file hit the memory cache without re-running ffprobe."""
    video = tmp_path / "cached_clip.mp4"
    video.touch()

    with patch.object(MediaValidator, "is_ffprobe_available", return_value=True):
        with patch("subprocess.run") as mock_run:
            # Mock successful JSON output from ffprobe
            mock_run.return_value = MagicMock(
                returncode=0,
                stdout='{"streams": [{"codec_type": "video", "codec_name": "h264", "width": 1920, "height": 1080, "r_frame_rate": "30/1"}]}'
            )
            validator = MediaValidator()
            
            # First call executes ffprobe
            valid1, msg1 = validator.validate_file(video)
            assert valid1 is True
            assert mock_run.call_count == 1

            # Second call on exact same mtime hits memory cache
            valid2, msg2 = validator.validate_file(video)
            assert valid2 is True
            assert mock_run.call_count == 1  # Not called again!
