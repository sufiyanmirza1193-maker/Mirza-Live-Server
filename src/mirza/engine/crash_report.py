"""Structured crash reporting engine for stream failures and unexpected shutdowns.

Captures timestamped diagnostic snapshots upon child FFmpeg process crashes,
freezes, or network disconnects, storing detailed telemetry as JSON artifacts
inside `logs/crash_reports/` for root-cause analysis.
"""

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Optional
from pydantic import BaseModel, Field, field_validator


class CrashReport(BaseModel):
    """Detailed diagnostic telemetry captured during an unexpected stream restart or crash.

    Attributes:
        timestamp: ISO 8601 UTC timestamp of the failure event.
        channel_id: Unique string identifier of the livestream channel (`channel_main`).
        exit_code: Process return code (`0` for clean, non-zero for error, `None` if force-killed).
        current_media_file: Filename or path of the video clip currently being streamed.
        cpu_percent: Host CPU utilization percentage at time of crash (`psutil`).
        ram_percent: Host RAM utilization percentage (`psutil`).
        ram_used_mb: Total active system RAM consumption in MB.
        restart_reason: Categorized classification (`UNEXPECTED_EXIT`, `STREAM_FREEZE`, `ENCODER_SLOWDOWN`, `NETWORK_INTERRUPTION`).
        last_stderr_lines: Recent lines captured from the child FFmpeg stderr pipe prior to crash.
    """

    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    channel_id: str
    exit_code: Optional[int] = None
    current_media_file: Optional[str] = None
    cpu_percent: float = Field(default=0.0)
    ram_percent: float = Field(default=0.0)
    ram_used_mb: float = Field(default=0.0)
    restart_reason: str
    last_stderr_lines: List[str] = Field(default_factory=list)

    @field_validator("last_stderr_lines", mode="before")
    @classmethod
    def truncate_stderr_lines(cls, v: List[str]) -> List[str]:
        if not isinstance(v, list):
            return []
        return v[-15:] if len(v) > 15 else v

    def save(self, logs_dir: Path = Path("logs")) -> Path:
        """Serializes and saves this `CrashReport` to a JSON artifact under `logs_dir/crash_reports/`."""
        return save_crash_report(self, logs_dir=logs_dir)


def save_crash_report(report: CrashReport, logs_dir: Path = Path("logs")) -> Path:
    """Serializes and saves a `CrashReport` model to a structured JSON file on disk.

    Args:
        report: Populated `CrashReport` data instance.
        logs_dir: Root logs directory (`logs/crash_reports/` will be created automatically).

    Returns:
        Path: Absolute path to the generated crash report JSON file.
    """
    reports_dir = logs_dir / "crash_reports"
    reports_dir.mkdir(parents=True, exist_ok=True)

    # Format filename safely: channel_main_2026-07-09T192737Z.json
    safe_timestamp = report.timestamp.replace(":", "").replace(".", "_")
    report_filename = f"{report.channel_id}_{safe_timestamp}.json"
    report_path = reports_dir / report_filename

    # Serialize with nice formatting for easy human reading
    json_content = report.model_dump_json(indent=2)
    report_path.write_text(json_content, encoding="utf-8")

    return report_path
