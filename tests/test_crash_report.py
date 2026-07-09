"""Unit test suite for CrashReport generation and persistence.

Verifies JSON schema accuracy, stderr line truncation, telemetry capture, and filesystem writing.
"""

import json
from pathlib import Path
import pytest

from mirza.engine.crash_report import CrashReport


def test_crash_report_serialization_and_save(tmp_path: Path) -> None:
    """Verifies that saving a CrashReport creates a valid JSON artifact with correct schema."""
    report = CrashReport(
        channel_id="ch_crash_test",
        exit_code=137,
        restart_reason="FFmpeg Process Terminated Unexpectedly (Exit code: 137)",
        current_media_file="C:/media/channel_main/lofi.mp4",
        last_stderr_lines=[f"frame={i} fps=30.0 bitrate=4500k" for i in range(25)],
    )

    report_path = report.save(logs_dir=tmp_path)
    assert report_path.exists()
    assert report_path.name.startswith("ch_crash_test_")
    assert report_path.name.endswith(".json")

    data = json.loads(report_path.read_text(encoding="utf-8"))
    assert data["channel_id"] == "ch_crash_test"
    assert data["exit_code"] == 137
    assert data["restart_reason"] == "FFmpeg Process Terminated Unexpectedly (Exit code: 137)"
    assert data["current_media_file"] == "C:/media/channel_main/lofi.mp4"
    assert "cpu_percent" in data
    assert "ram_percent" in data
    
    # Ensure only the last 15 lines of stderr were retained by the field validator
    assert len(data["last_stderr_lines"]) == 15
    assert data["last_stderr_lines"][-1] == "frame=24 fps=30.0 bitrate=4500k"


def test_crash_report_directory_auto_creation(tmp_path: Path) -> None:
    """Ensure `save()` automatically creates parent directories if they don't exist."""
    nested_dir = tmp_path / "deep" / "nested" / "logs"
    report = CrashReport(
        channel_id="ch_auto",
        exit_code=-1,
        restart_reason="Network Drop: Connection reset by peer",
    )
    report_path = report.save(logs_dir=nested_dir)
    assert nested_dir.exists()
    assert report_path.exists()
