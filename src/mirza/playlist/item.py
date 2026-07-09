"""Media file abstraction and path sanitization models.

Encapsulates individual video files within the playlist, validating readability
and converting Windows backslashes (`C:\\...`) to forward slashes (`C:/...`)
required by the FFmpeg concat demuxer.
"""

from pathlib import Path
from typing import Set
from pydantic import BaseModel, Field, field_validator


# Supported video extensions for automatic folder detection
SUPPORTED_VIDEO_EXTENSIONS: Set[str] = {".mp4", ".mkv", ".mov", ".flv", ".ts"}


class MediaItem(BaseModel):
    """Represents a single validated video file within a livestream playlist.

    Attributes:
        path: Absolute or relative `Path` pointing to the video file on disk.
    """

    path: Path = Field(..., description="Path to the video file on the filesystem.")

    @field_validator("path")
    @classmethod
    def validate_file_extension(cls, value: Path) -> Path:
        """Validates that the file has a supported video extension."""
        ext = value.suffix.lower()
        if ext not in SUPPORTED_VIDEO_EXTENSIONS:
            raise ValueError(
                f"Unsupported video file extension '{ext}' for file {value}. "
                f"Supported formats: {', '.join(sorted(SUPPORTED_VIDEO_EXTENSIONS))}"
            )
        return value

    @property
    def filename(self) -> str:
        """Returns the base filename of the media item (`video.mp4`)."""
        return self.path.name

    @property
    def safe_ffmpeg_path(self) -> str:
        """Computes a forward-slash escaped absolute path string for FFmpeg concat files.

        FFmpeg running on Windows will throw syntax or parsing errors when reading
        `concat.txt` files containing Windows backslashes (`C:\\dir\\file.mp4`).
        Converting `\\` to `/` ensures 100% cross-platform FFmpeg ingestion reliability.

        Returns:
            str: Absolute path with all backslashes converted to forward slashes.
        """
        absolute_path = self.path.resolve()
        return absolute_path.as_posix()

    def exists(self) -> bool:
        """Checks if the video file exists and is a regular file on disk.

        Returns:
            bool: True if file exists and is readable, False otherwise.
        """
        return self.path.exists() and self.path.is_file()

    def __hash__(self) -> int:
        """Enables MediaItem objects to be hashed cleanly based on absolute path."""
        return hash(self.path.resolve())

    def __eq__(self, other: object) -> bool:
        """Compares MediaItems by absolute resolved path identity."""
        if not isinstance(other, MediaItem):
            return False
        return self.path.resolve() == other.path.resolve()
