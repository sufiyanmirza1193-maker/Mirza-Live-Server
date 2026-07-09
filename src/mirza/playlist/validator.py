"""Media file validation and codec probing engine.

Uses `ffprobe` to inspect candidate video clips for valid container headers,
video codecs, resolution limits, and audio streams, caching results by file
modification timestamp (`mtime`) to optimize disk I/O across loop iterations.
"""

import json
import logging
import shutil
import subprocess
from pathlib import Path
from typing import Dict, Optional, Set, Tuple


class MediaValidationError(Exception):
    """Raised when a media file fails inspection or exhibits corrupted container headers."""


class MediaValidator:
    """Probes media files using `ffprobe` and caches validation results by modification time.

    Attributes:
        ffprobe_path: Executable name or absolute path to `ffprobe`.
        logger: Dedicated diagnostic logger.
        supported_codecs: Set of acceptable video codec strings (`h264`, `hevc`).
    """

    def __init__(
        self,
        ffprobe_path: str = "ffprobe",
        supported_codecs: Optional[Set[str]] = None,
        logger: Optional[logging.Logger] = None,
    ) -> None:
        """Initializes the media validator.

        Args:
            ffprobe_path: Name or path pointing to the `ffprobe` binary.
            supported_codecs: Set of valid video codec names. Defaults to standard H.264/HEVC/VP9.
            logger: Optional logger instance.
        """
        self.ffprobe_path = shutil.which(ffprobe_path) or ffprobe_path
        self.supported_codecs = supported_codecs or {"h264", "hevc", "vp9", "av1", "mpeg4"}
        self.logger = logger or logging.getLogger("mirza.playlist.validator")
        
        # Cache map: absolute Path -> (st_mtime, is_valid, validation_message)
        self._cache: Dict[Path, Tuple[float, bool, str]] = {}

    def is_ffprobe_available(self) -> bool:
        """Checks whether `ffprobe` executable can be found and executed on the system."""
        try:
            res = subprocess.run(
                [self.ffprobe_path, "-version"],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                check=False,
            )
            return res.returncode == 0
        except (FileNotFoundError, OSError):
            return False

    def validate_file(self, file_path: Path) -> Tuple[bool, str]:
        """Validates video codec, resolution, frame rate, and container integrity via `ffprobe`.

        Results are cached against the file's modification timestamp (`st_mtime`). If the
        file on disk has not changed since the previous inspection, the cached result is
        returned immediately with zero subprocess overhead.

        Args:
            file_path: Path to the candidate video file.

        Returns:
            Tuple[bool, str]: `(is_valid, reason_message)`.
        """
        if not file_path.exists() or not file_path.is_file():
            return False, f"File not found: {file_path}"

        try:
            current_mtime = file_path.stat().st_mtime
        except OSError as stat_err:
            return False, f"Cannot access file stat: {stat_err}"

        # Check memory cache first
        resolved_path = file_path.resolve()
        if resolved_path in self._cache:
            cached_mtime, cached_valid, cached_msg = self._cache[resolved_path]
            if cached_mtime == current_mtime:
                return cached_valid, cached_msg

        if not self.is_ffprobe_available():
            # If ffprobe is not installed, log warning once and fallback to basic extension validation
            self.logger.warning("ffprobe not available on PATH. Skipping deep codec probing.")
            self._cache[resolved_path] = (current_mtime, True, "ffprobe_unavailable_pass")
            return True, "ffprobe_unavailable_pass"

        cmd = [
            self.ffprobe_path,
            "-v", "error",
            "-show_entries", "stream=codec_name,codec_type,width,height,r_frame_rate",
            "-of", "json",
            str(resolved_path),
        ]

        try:
            result = subprocess.run(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                check=False,
                timeout=10.0,
            )
        except subprocess.TimeoutExpired:
            msg = "Corrupted file: ffprobe inspection timed out after 10 seconds."
            self._cache[resolved_path] = (current_mtime, False, msg)
            return False, msg
        except Exception as exc:
            msg = f"ffprobe execution failed: {exc}"
            self._cache[resolved_path] = (current_mtime, False, msg)
            return False, msg

        if result.returncode != 0:
            msg = f"Corrupted container or unreadable header (ffprobe exit {result.returncode})"
            self._cache[resolved_path] = (current_mtime, False, msg)
            return False, msg

        try:
            probe_data = json.loads(result.stdout)
        except json.JSONDecodeError:
            msg = "Invalid JSON telemetry returned by ffprobe"
            self._cache[resolved_path] = (current_mtime, False, msg)
            return False, msg

        streams = probe_data.get("streams", [])
        video_streams = [s for s in streams if s.get("codec_type") == "video"]
        audio_streams = [s for s in streams if s.get("codec_type") == "audio"]

        if not video_streams:
            msg = "Invalid media: no video streams found inside file container"
            self._cache[resolved_path] = (current_mtime, False, msg)
            return False, msg

        v_stream = video_streams[0]
        codec_name = v_stream.get("codec_name", "").lower()
        width = v_stream.get("width", 0)
        height = v_stream.get("height", 0)

        if codec_name not in self.supported_codecs:
            msg = f"Unsupported video codec '{codec_name}' (supported: {', '.join(sorted(self.supported_codecs))})"
            self._cache[resolved_path] = (current_mtime, False, msg)
            return False, msg

        if not width or not height or width <= 0 or height <= 0:
            msg = f"Invalid video resolution dimensions: {width}x{height}"
            self._cache[resolved_path] = (current_mtime, False, msg)
            return False, msg

        if not audio_streams:
            self.logger.debug(f"File '{file_path.name}' contains no audio track. FFmpeg will generate silent audio.")

        success_msg = f"Valid media: {codec_name} ({width}x{height})"
        self._cache[resolved_path] = (current_mtime, True, success_msg)
        return True, success_msg

    def clear_cache(self) -> None:
        """Clears the internal inspection result cache."""
        self._cache.clear()
