"""Cross-platform single-instance file locking mechanism for Mirza Live Server.

Prevents multiple simultaneous instances from binding to the same media files,
corrupting configuration backups, or attempting to stream to identical YouTube
stream keys concurrently (`flock` on POSIX / `msvcrt` on Windows).
"""

import logging
import os
import sys
from pathlib import Path
from typing import Optional


class InstanceAlreadyRunningError(Exception):
    """Raised when another instance of Mirza Live Server holds the active system lock."""


class InstanceLock:
    """Cross-platform single-instance file lock using native OS file locking primitives.

    Attributes:
        lock_path: Path to the lockfile (`logs/mirza.lock`).
        logger: Logger instance for emitting diagnostic lock events.
    """

    def __init__(self, lock_path: Path = Path("logs/mirza.lock"), logger: Optional[logging.Logger] = None) -> None:
        """Initializes the instance lock object.

        Args:
            lock_path: File system location for the lock file.
            logger: Optional logger override.
        """
        self.lock_path = lock_path
        self.logger = logger or logging.getLogger("mirza.engine.lock")
        self._file_handle: Optional[int] = None

    def acquire(self) -> bool:
        """Acquires an exclusive OS-level lock on `lock_path`.

        Returns:
            bool: True if lock acquired successfully.

        Raises:
            InstanceAlreadyRunningError: If the lockfile is currently held by another running instance.
        """
        self.lock_path.parent.mkdir(parents=True, exist_ok=True)

        try:
            # Open file descriptor with read/write access without truncating immediately
            self._file_handle = os.open(
                str(self.lock_path),
                os.O_CREAT | os.O_RDWR,
                0o666,
            )
        except OSError as exc:
            self.logger.error(f"Failed to open lockfile descriptor at '{self.lock_path}': {exc}")
            raise InstanceAlreadyRunningError(f"Cannot access lockfile '{self.lock_path}': {exc}") from exc

        try:
            if sys.platform == "win32":
                import msvcrt
                # Lock the first byte of the file on Windows without blocking
                msvcrt.locking(self._file_handle, msvcrt.LK_NBLCK, 1)
            else:
                import fcntl
                # Acquire exclusive non-blocking advisory lock on POSIX
                fcntl.flock(self._file_handle, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except (OSError, IOError) as lock_err:
            if self._file_handle is not None:
                os.close(self._file_handle)
                self._file_handle = None
            self.logger.critical(f"Another instance of Mirza Live Server is already running (`{self.lock_path}` locked).")
            raise InstanceAlreadyRunningError(
                f"Active instance detected. Lockfile '{self.lock_path.resolve()}' is held by another process."
            ) from lock_err

        try:
            # Write current PID into lockfile for easy inspection and debugging
            os.ftruncate(self._file_handle, 0)
            os.write(self._file_handle, f"{os.getpid()}\n".encode("utf-8"))
        except OSError as write_err:
            self.logger.warning(f"Could not write PID to lockfile: {write_err}")

        self.logger.debug(f"Successfully acquired single-instance lock (`{self.lock_path.resolve()}`, PID: {os.getpid()}).")
        return True

    def release(self) -> None:
        """Releases the OS file lock and cleans up the lockfile descriptor."""
        if self._file_handle is None:
            return

        try:
            if sys.platform == "win32":
                import msvcrt
                msvcrt.locking(self._file_handle, msvcrt.LK_UNLCK, 1)
            else:
                import fcntl
                fcntl.flock(self._file_handle, fcntl.LOCK_UN)
        except (OSError, IOError) as unlock_err:
            self.logger.debug(f"Error releasing OS lock: {unlock_err}")
        finally:
            try:
                os.close(self._file_handle)
            except OSError:
                pass
            self._file_handle = None

            try:
                self.lock_path.unlink(missing_ok=True)
            except OSError:
                pass
            self.logger.debug(f"Released single-instance lock ('{self.lock_path}').")

    def __enter__(self) -> "InstanceLock":
        """Context manager entry point."""
        self.acquire()
        return self

    def __exit__(self, exc_type: object, exc_val: object, exc_tb: object) -> None:
        """Context manager exit point."""
        self.release()
