"""Structured logging subsystem for Mirza Live Server.

Provides centralized configuration for console outputs (with optional colorization)
and daily rotating file logs. Also supports isolated per-channel log files so each
concurrent YouTube stream's FFmpeg stderr metrics can be tracked independently.
"""

import logging
from logging.handlers import RotatingFileHandler
from pathlib import Path
from typing import Optional

# Attempt to import colorlog for colored terminal output; fallback cleanly if absent
try:
    import colorlog

    _HAS_COLORLOG = True
except ImportError:
    _HAS_COLORLOG = False


# Default log formatting patterns
_CONSOLE_FORMAT = "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s"
_FILE_FORMAT = "%(asctime)s | %(levelname)-8s | %(name)s | %(funcName)s:%(lineno)d | %(message)s"
_COLOR_FORMAT = "%(log_color)s%(asctime)s | %(levelname)-8s | %(name)s | %(message)s"


def _create_console_handler(level: int) -> logging.Handler:
    """Creates and formats the standard stream console handler.

    Args:
        level: The integer logging level.

    Returns:
        logging.Handler: Configured console stream handler.
    """
    console_handler = logging.StreamHandler()
    console_handler.setLevel(level)

    if _HAS_COLORLOG:
        formatter = colorlog.ColoredFormatter(
            _COLOR_FORMAT,
            datefmt="%Y-%m-%d %H:%M:%S",
            log_colors={
                "DEBUG": "cyan",
                "INFO": "green",
                "WARNING": "yellow",
                "ERROR": "red",
                "CRITICAL": "bold_red",
            },
        )
    else:
        formatter = logging.Formatter(_CONSOLE_FORMAT, datefmt="%Y-%m-%d %H:%M:%S")

    console_handler.setFormatter(formatter)
    return console_handler


def _create_rotating_file_handler(
    file_path: Path,
    level: int,
    max_bytes: int = 10 * 1024 * 1024,
    backup_count: int = 10,
) -> logging.Handler:
    """Creates a rotating file handler with automatic directory creation.

    Args:
        file_path: Absolute or relative Path where log file is stored.
        level: The integer logging level.
        max_bytes: Maximum log file size in bytes before rotating (default 10MB).
        backup_count: Number of rotated backup files to preserve (default 10).

    Returns:
        logging.Handler: Configured rotating file handler.
    """
    file_path.parent.mkdir(parents=True, exist_ok=True)
    file_handler = RotatingFileHandler(
        filename=file_path,
        mode="a",
        maxBytes=max_bytes,
        backupCount=backup_count,
        encoding="utf-8",
    )
    file_handler.setLevel(level)
    formatter = logging.Formatter(_FILE_FORMAT, datefmt="%Y-%m-%d %H:%M:%S")
    file_handler.setFormatter(formatter)
    return file_handler


def setup_logging(
    log_level: str = "INFO",
    log_dir: Path = Path("logs"),
    server_log_name: str = "server.log",
) -> logging.Logger:
    """Initializes global system logging with console and rotating file output.

    Args:
        log_level: String representation of log level (e.g., 'INFO', 'DEBUG').
        log_dir: Directory where log files are generated and rotated.
        server_log_name: Filename for the master system log.

    Returns:
        logging.Logger: The configured root 'mirza' logger.
    """
    numeric_level = getattr(logging, log_level.upper(), logging.INFO)
    root_logger = logging.getLogger("mirza")
    root_logger.setLevel(numeric_level)

    # Avoid duplicating handlers if setup_logging is invoked multiple times
    if root_logger.handlers:
        return root_logger

    # Attach console handler
    root_logger.addHandler(_create_console_handler(numeric_level))

    # Attach master rotating file handler
    server_log_path = log_dir / server_log_name
    root_logger.addHandler(_create_rotating_file_handler(server_log_path, numeric_level))

    root_logger.debug(f"Logging initialized successfully at level: {log_level.upper()}")
    return root_logger


def get_channel_logger(
    channel_id: str,
    log_dir: Path = Path("logs"),
    log_level: Optional[str] = None,
) -> logging.Logger:
    """Retrieves or creates a dedicated logger instance for a specific livestream channel.

    This ensures that high-volume FFmpeg encoding telemetry from multiple concurrent
    channels does not interleave in unreadable chaos inside the master server log.

    Args:
        channel_id: Unique string identifier for the channel (e.g., 'channel_main').
        log_dir: Directory where the channel log file should be stored.
        log_level: Optional override for the logging level of this specific channel.

    Returns:
        logging.Logger: Specialized logger for the channel (`mirza.channel.<id>`).
    """
    channel_logger = logging.getLogger(f"mirza.channel.{channel_id}")

    if log_level is not None:
        numeric_level = getattr(logging, log_level.upper(), logging.INFO)
        channel_logger.setLevel(numeric_level)
    else:
        # Inherit level from parent logger if not overridden
        numeric_level = channel_logger.getEffectiveLevel()

    # Check if a file handler specifically targeting this channel log already exists
    channel_log_filename = f"{channel_id}.log"
    has_file_handler = any(
        isinstance(h, RotatingFileHandler) and h.baseFilename.endswith(channel_log_filename)
        for h in channel_logger.handlers
    )

    if not has_file_handler:
        channel_log_path = log_dir / channel_log_filename
        channel_logger.addHandler(
            _create_rotating_file_handler(channel_log_path, numeric_level)
        )
        channel_logger.debug(f"Channel logger initialized: {channel_log_path}")

    return channel_logger
