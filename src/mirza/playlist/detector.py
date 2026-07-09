"""Automatic media folder detection and file scanning engine.

Monitors designated channel directories (`media/channel_main`), recursively discovers
supported video files, validates codecs and container headers via `MediaValidator`,
and detects runtime additions/removals across loop cycles with `mtime` throttling.
"""

import logging
import time
from pathlib import Path
from typing import List, Optional, Set, Tuple

from mirza.playlist.item import SUPPORTED_VIDEO_EXTENSIONS, MediaItem
from mirza.playlist.validator import MediaValidator


class MediaDetector:
    """Recursively scans media directories and tracks dynamic changes to video lists.

    Attributes:
        media_folder: Target directory `Path` to scan.
        extensions: Set of lowercased string extensions (`{'.mp4', '.mkv'}`) to include.
        validator: `MediaValidator` instance used to probe container headers and codecs.
        scan_interval_seconds: Minimum seconds between disk scans unless folder `st_mtime` changes.
        logger: Dedicated logger instance for reporting detection events.
    """

    def __init__(
        self,
        media_folder: Path,
        extensions: Optional[Set[str]] = None,
        validator: Optional[MediaValidator] = None,
        scan_interval_seconds: float = 30.0,
        logger: Optional[logging.Logger] = None,
    ) -> None:
        """Initializes the media folder detector.

        Args:
            media_folder: Path pointing to the target folder containing video files.
            extensions: Optional override set of valid extensions. Defaults to standard videos.
            validator: Optional `MediaValidator` instance. Created automatically if omitted.
            scan_interval_seconds: Minimum throttle window between repeated scans.
            logger: Optional logger for emitting diagnostic alerts.
        """
        self.media_folder = media_folder
        self.extensions = extensions or SUPPORTED_VIDEO_EXTENSIONS
        self.validator = validator or MediaValidator()
        self.scan_interval_seconds = scan_interval_seconds
        self.logger = logger or logging.getLogger("mirza.playlist.detector")

        # In-memory caching variables to eliminate redundant disk I/O
        self._last_scan_time: float = 0.0
        self._last_folder_mtime: float = 0.0
        self._last_items: List[MediaItem] = []

    def ensure_folder_exists(self) -> None:
        """Creates the media folder hierarchy if it does not already exist on disk."""
        if not self.media_folder.exists():
            self.logger.warning(
                f"Media folder '{self.media_folder}' not found. Creating directory automatically."
            )
            self.media_folder.mkdir(parents=True, exist_ok=True)

    def scan(self, force: bool = False) -> List[MediaItem]:
        """Scans the directory and returns a deterministic, sorted list of valid `MediaItem`s.

        Uses folder modification timestamp (`st_mtime`) and throttle interval check (`scan_interval_seconds`)
        to skip redundant filesystem traversals and `ffprobe` probes if nothing has changed.

        Args:
            force: If `True`, bypasses `mtime` throttling and forces a fresh inspection.

        Returns:
            List[MediaItem]: Validated video items sorted alphabetically by filename.
        """
        self.ensure_folder_exists()
        now = time.monotonic()

        # Check if directory timestamp or throttle window permits returning cached items
        if not force and self._last_items and (now - self._last_scan_time < self.scan_interval_seconds):
            try:
                current_folder_mtime = self.media_folder.stat().st_mtime
                if current_folder_mtime == self._last_folder_mtime:
                    return list(self._last_items)
            except OSError:
                pass

        discovered_items: List[MediaItem] = []

        try:
            try:
                current_folder_mtime = self.media_folder.stat().st_mtime
            except OSError:
                current_folder_mtime = 0.0

            for item_path in self.media_folder.rglob("*"):
                if item_path.is_file() and item_path.suffix.lower() in self.extensions:
                    try:
                        # Probe container header, codec, and resolution with MediaValidator
                        is_valid, reason = self.validator.validate_file(item_path)
                        if not is_valid:
                            self.logger.warning(
                                f"Skipping corrupted or invalid media '{item_path.name}': {reason}"
                            )
                            continue

                        media_item = MediaItem(path=item_path)
                        discovered_items.append(media_item)
                    except ValueError as validation_error:
                        self.logger.debug(f"Skipping file '{item_path}': {validation_error}")
        except OSError as os_error:
            self.logger.error(f"Error while scanning directory '{self.media_folder}': {os_error}")
            return list(self._last_items)

        # Sort alphabetically by path to ensure consistent deterministic sequencing across scans
        discovered_items.sort(key=lambda item: item.path.as_posix().lower())

        # Update cache values
        self._last_scan_time = now
        self._last_folder_mtime = current_folder_mtime
        self._last_items = list(discovered_items)

        return discovered_items

    def detect_changes(
        self, previous_items: List[MediaItem]
    ) -> Tuple[List[MediaItem], bool]:
        """Scans folder and determines if any video files were added or removed since last check.

        This enables the livestream server to automatically pick up new video drops during
        continuous 24/7 loops without restarting the background FFmpeg process.

        Args:
            previous_items: The list of `MediaItem`s active during the previous playlist cycle.

        Returns:
            Tuple[List[MediaItem], bool]: A tuple containing `(current_items, has_changed)`.
                `has_changed` is True if new files were added or old files deleted.
        """
        current_items = self.scan(force=True)

        prev_set = set(previous_items)
        curr_set = set(current_items)

        added = curr_set - prev_set
        removed = prev_set - curr_set

        has_changed = bool(added or removed)

        if has_changed:
            if added:
                added_names = ", ".join([item.filename for item in sorted(added, key=lambda x: x.filename)])
                self.logger.info(f"[MediaDetector] Newly added video(s) detected ({len(added)}): {added_names}")
            if removed:
                removed_names = ", ".join([item.filename for item in sorted(removed, key=lambda x: x.filename)])
                self.logger.info(f"[MediaDetector] Removed video(s) detected ({len(removed)}): {removed_names}")
        else:
            self.logger.debug(f"[MediaDetector] No changes detected in '{self.media_folder}'.")

        return current_items, has_changed
