"""Automatic media folder detection and file scanning engine.

Monitors designated channel directories (`media/channel_main`), recursively discovers
supported video files, and detects runtime additions/removals across loop cycles.
"""

import logging
from pathlib import Path
from typing import List, Optional, Set, Tuple

from mirza.playlist.item import SUPPORTED_VIDEO_EXTENSIONS, MediaItem


class MediaDetector:
    """Recursively scans media directories and tracks dynamic changes to video lists.

    Attributes:
        media_folder: Target directory `Path` to scan.
        extensions: Set of lowercased string extensions (`{'.mp4', '.mkv'}`) to include.
        logger: Dedicated logger instance for reporting detection events.
    """

    def __init__(
        self,
        media_folder: Path,
        extensions: Optional[Set[str]] = None,
        logger: Optional[logging.Logger] = None,
    ) -> None:
        """Initializes the media folder detector.

        Args:
            media_folder: Path pointing to the target folder containing video files.
            extensions: Optional override set of valid extensions. Defaults to standard videos.
            logger: Optional logger for emitting diagnostic alerts.
        """
        self.media_folder = media_folder
        self.extensions = extensions or SUPPORTED_VIDEO_EXTENSIONS
        self.logger = logger or logging.getLogger("mirza.playlist.detector")

    def ensure_folder_exists(self) -> None:
        """Creates the media folder hierarchy if it does not already exist on disk."""
        if not self.media_folder.exists():
            self.logger.warning(
                f"Media folder '{self.media_folder}' not found. Creating directory automatically."
            )
            self.media_folder.mkdir(parents=True, exist_ok=True)

    def scan(self) -> List[MediaItem]:
        """Scans the directory and returns a deterministic, sorted list of valid `MediaItem`s.

        Returns:
            List[MediaItem]: Validated video items sorted alphabetically by filename.
        """
        self.ensure_folder_exists()
        discovered_items: List[MediaItem] = []

        try:
            for item_path in self.media_folder.rglob("*"):
                if item_path.is_file() and item_path.suffix.lower() in self.extensions:
                    try:
                        media_item = MediaItem(path=item_path)
                        discovered_items.append(media_item)
                    except ValueError as validation_error:
                        self.logger.debug(f"Skipping file '{item_path}': {validation_error}")
        except OSError as os_error:
            self.logger.error(f"Error while scanning directory '{self.media_folder}': {os_error}")
            return []

        # Sort alphabetically by path to ensure consistent deterministic sequencing across scans
        discovered_items.sort(key=lambda item: item.path.as_posix().lower())
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
        current_items = self.scan()

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
