"""Playlist management engine and safe FFmpeg concat file generator.

Orchestrates video queue ordering (random shuffle vs sequential), handles infinite
continuous looping, and writes forward-slash escaped `concat.txt` demuxer files
for clean Windows FFmpeg ingestion.
"""

import logging
import random
from pathlib import Path
from typing import List, Optional

from mirza.config.models import PlaylistSettings
from mirza.playlist.detector import MediaDetector
from mirza.playlist.item import MediaItem


class PlaylistEmptyError(Exception):
    """Raised when no valid video files are found inside the target channel directory."""


class PlaylistManager:
    """Manages playback sequence, looping, and FFmpeg concat file generation.

    Attributes:
        channel_id: Unique string ID of the channel (`channel_main`).
        detector: `MediaDetector` responsible for scanning the folder.
        settings: `PlaylistSettings` specifying shuffle and loop options.
        playlists_dir: Directory where runtime `concat_*.txt` files are written.
        logger: Dedicated logger for playlist events.
    """

    def __init__(
        self,
        channel_id: str,
        detector: MediaDetector,
        settings: PlaylistSettings,
        playlists_dir: Path = Path("playlists"),
        logger: Optional[logging.Logger] = None,
    ) -> None:
        """Initializes the playlist manager.

        Args:
            channel_id: Unique ID identifying the channel queue.
            detector: Instance of `MediaDetector` tied to the channel's media folder.
            settings: Playlist configuration (`shuffle`, `loop`).
            playlists_dir: Directory where temporary FFmpeg concat files are stored.
            logger: Optional logger instance.
        """
        self.channel_id = channel_id
        self.detector = detector
        self.settings = settings
        self.playlists_dir = playlists_dir
        self.logger = logger or logging.getLogger(f"mirza.playlist.{channel_id}")

        self._items: List[MediaItem] = []
        self._current_index: int = 0
        self._loop_count: int = 0

    @property
    def items(self) -> List[MediaItem]:
        """Returns a copy of the current playlist item sequence."""
        return list(self._items)

    @property
    def current_index(self) -> int:
        """Returns the 0-indexed position of the currently playing video."""
        return self._current_index

    @property
    def loop_count(self) -> int:
        """Returns total number of completed playlist rotations."""
        return self._loop_count

    def refresh_playlist(self, force: bool = False) -> bool:
        """Scans the media folder, detects changes, and orders the playlist queue.

        If `shuffle: true` is configured, randomizes order using `random.shuffle`.
        Otherwise, orders sequentially by file path. If no folder changes are detected
        and `force` is False, preserves existing sequence to minimize redundant I/O.

        Args:
            force: If True, forces re-scanning and re-shuffling even if folder is unchanged.

        Returns:
            bool: True if new items were detected or order refreshed.

        Raises:
            PlaylistEmptyError: If no valid video files exist in the target folder.
        """
        self.logger.info(
            f"Refreshing playlist for channel '{self.channel_id}' (Shuffle: {self.settings.shuffle})..."
        )
        scanned_items, has_changed = self.detector.detect_changes(self._items)

        if not scanned_items:
            self.logger.error(
                f"No supported video files found in folder '{self.detector.media_folder}'!"
            )
            raise PlaylistEmptyError(
                f"Media folder '{self.detector.media_folder}' contains no supported videos (.mp4, .mkv, .mov, etc.)."
            )

        if not force and self._items and not has_changed:
            self.logger.debug(f"Playlist unchanged (`{len(self._items)}` items). Reusing cached sequence.")
            return False

        self._items = list(scanned_items)

        if self.settings.shuffle:
            random.shuffle(self._items)
            self.logger.debug(f"Playlist randomized ({len(self._items)} items).")
        else:
            # Sequential ordering is already sorted alphabetically by the detector
            self.logger.debug(f"Playlist sorted sequentially ({len(self._items)} items).")

        return True

    def get_next_item(self) -> Optional[MediaItem]:
        """Advances the queue and returns the next video item to play.

        When the end of the playlist is reached:
        - If `loop: true`, increments `loop_count`, re-scans the directory to pick up
          any newly dropped videos, re-shuffles if configured, and starts from index 0.
        - If `loop: false`, returns None.

        Returns:
            Optional[MediaItem]: Next video item, or None if playlist finished and loop is disabled.
        """
        if not self._items:
            try:
                self.refresh_playlist()
            except PlaylistEmptyError:
                return None

        if self._current_index >= len(self._items):
            if not self.settings.loop:
                self.logger.info(f"Playlist completed for '{self.channel_id}'. Looping disabled.")
                return None

            self._loop_count += 1
            self.logger.info(
                f"End of playlist reached for '{self.channel_id}'. Loop cycle #{self._loop_count} initiating."
            )
            self.refresh_playlist()
            self._current_index = 0

        item = self._items[self._current_index]
        self._current_index += 1
        return item

    def generate_concat_file(self) -> Path:
        """Generates an FFmpeg concat demuxer text file (`concat_<channel_id>.txt`).

        Every video in the active queue is written with `file '<safe_ffmpeg_path>'` syntax.
        Escaping all Windows backslashes (`\\`) to forward slashes (`/`) guarantees that
        FFmpeg on Windows processes the playlist without throwing escaping syntax errors.

        Returns:
            Path: Path pointing to the generated `concat.txt` file on disk.

        Raises:
            PlaylistEmptyError: If there are no video items to write.
        """
        if not self._items:
            self.refresh_playlist()

        self.playlists_dir.mkdir(parents=True, exist_ok=True)
        concat_path = self.playlists_dir / f"concat_{self.channel_id}.txt"

        lines: List[str] = [
            f"# Mirza Live Server Concat Demuxer Playlist — Channel: {self.channel_id}\n",
            f"# Loop Count: {self._loop_count} | Total Videos: {len(self._items)}\n",
        ]

        for item in self._items:
            # FFmpeg concat demuxer format requires: file 'absolute/forward/slash/path.mp4'
            lines.append(f"file '{item.safe_ffmpeg_path}'\n")

        with open(concat_path, "w", encoding="utf-8") as file:
            file.writelines(lines)

        self.logger.debug(
            f"Generated Windows-safe concat file '{concat_path}' ({len(self._items)} video entries)."
        )
        return concat_path
