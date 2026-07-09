"""Structured logging subsystem for Mirza Live Server.

Provides centralized configuration for console outputs (with optional colorization),
daily rotating file logs (`TimedRotatingFileHandler`), and isolated per-channel
and FFmpeg raw telemetry log files.
"""

import logging
from logging.handlers import RotatingFileHandler, TimedRotatingFileHandler
from pathlib import Path
from typing import Optional
import uuid

# Attempt to import colorlog for colored terminal output; fallback cleanly if absent
try:
    import colorlog

    _HAS_COLORLOG = True
except ImportError:
    _HAS_COLORLOG = False


_GLOBAL_SESSION_ID = uuid.uuid4().hex[:8]


class MirzaContextFilter(logging.Filter):
    """Injects `[Session: <id>]` and `[Channel: <id>]` structured context headers into log records."""

    def filter(self, record: logging.LogRecord) -> bool:
        session_header = f"[Session: {_GLOBAL_SESSION_ID}]"
        
        channel_header = "[System]"
        parts = record.name.split(".")
        if len(parts) >= 3 and parts[1] in ("channel", "ffmpeg", "monitor"):
            channel_header = f"[Channel: {parts[2]}]"
        elif len(parts) >= 4 and parts[2] == "health":
            channel_header = f"[Channel: {parts[3]}]"
            
        record.session_id = _GLOBAL_SESSION_ID
        record.channel_header = channel_header
        record.context_prefix = f"{session_header} {channel_header}"
        return True


# Default log formatting patterns with precise millisecond timestamps and structured context headers
_CONSOLE_FORMAT = "%(asctime)s.%(msecs)03d | %(levelname)-8s | %(context_prefix)-28s | %(name)s | %(message)s"
_FILE_FORMAT = "%(asctime)s.%(msecs)03d | %(levelname)-8s | %(context_prefix)-28s | %(name)-24s | %(funcName)s:%(lineno)d | %(message)s"
_COLOR_FORMAT = "%(log_color)s%(asctime)s.%(msecs)03d | %(levelname)-8s | %(context_prefix)-28s | %(name)s | %(message)s"
_DATE_FORMAT = "%Y-%m-%d %H:%M:%S"


def _create_console_handler(level: int) -> logging.Handler:
    """Creates and formats the standard stream console handler.

    Args:
        level: The integer logging level.

    Returns:
        logging.Handler: Configured console stream handler.
    """
    console_handler = logging.StreamHandler()
    console_handler.setLevel(level)
    console_handler.addFilter(MirzaContextFilter())

    if _HAS_COLORLOG:
        formatter = colorlog.ColoredFormatter(
            _COLOR_FORMAT,
            datefmt=_DATE_FORMAT,
            log_colors={
                "DEBUG": "cyan",
                "INFO": "green",
                "WARNING": "yellow",
                "ERROR": "red",
                "CRITICAL": "bold_red",
            },
        )
    else:
        formatter = logging.Formatter(_CONSOLE_FORMAT, datefmt=_DATE_FORMAT)

    console_handler.setFormatter(formatter)
    return console_handler


def _create_timed_rotating_file_handler(
    file_path: Path,
    level: int,
    backup_count: int = 30,
) -> logging.Handler:
    """Creates a daily rotating file handler (`TimedRotatingFileHandler`) with automatic folder setup.

    Args:
        file_path: Absolute or relative Path where log file is stored.
        level: The integer logging level.
        backup_count: Number of daily rotated backup files to preserve (default 30 days).

    Returns:
        logging.Handler: Configured daily rotating file handler.
    """
    file_path.parent.mkdir(parents=True, exist_ok=True)
    file_handler = TimedRotatingFileHandler(
        filename=file_path,
        when="midnight",
        interval=1,
        backupCount=backup_count,
        encoding="utf-8",
    )
    file_handler.setLevel(level)
    file_handler.addFilter(MirzaContextFilter())
    formatter = logging.Formatter(_FILE_FORMAT, datefmt=_DATE_FORMAT)
    file_handler.setFormatter(formatter)
    return file_handler


def _create_rotating_file_handler(
    file_path: Path,
    level: int,
    max_bytes: int = 10 * 1024 * 1024,
    backup_count: int = 10,
) -> logging.Handler:
    """Creates a size-based rotating file handler (retained for backward compatibility).

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
    file_handler.addFilter(MirzaContextFilter())
    formatter = logging.Formatter(_FILE_FORMAT, datefmt=_DATE_FORMAT)
    file_handler.setFormatter(formatter)
    return file_handler


def setup_logging(
    log_level: str = "INFO",
    log_dir: Path = Path("logs"),
    server_log_name: str = "server.log",
) -> logging.Logger:
    """Initializes global system logging with console and daily rotating file output.

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

    if not any(isinstance(f, MirzaContextFilter) for f in root_logger.filters):
        root_logger.addFilter(MirzaContextFilter())

    # Avoid duplicating handlers if setup_logging is invoked multiple times
    if root_logger.handlers:
        return root_logger

    # Attach console handler
    root_logger.addHandler(_create_console_handler(numeric_level))

    # Attach master daily rotating file handler
    server_log_path = log_dir / server_log_name
    root_logger.addHandler(_create_timed_rotating_file_handler(server_log_path, numeric_level))

    root_logger.debug(f"Logging initialized successfully at level: {log_level.upper()}")
    return root_logger


def get_channel_logger(
    channel_id: str,
    log_dir: Path = Path("logs"),
    log_level: Optional[str] = None,
) -> logging.Logger:
    """Retrieves or creates a dedicated logger instance for a specific livestream channel.

    Ensures that general channel lifecycle and playlist rotation events are isolated
    into `logs/<channel_id>.log` using daily file rotation.

    Args:
        channel_id: Unique string identifier for the channel (e.g., 'channel_main').
        log_dir: Directory where the channel log file should be stored.
        log_level: Optional override for the logging level of this specific channel.

    Returns:
        logging.Logger: Specialized logger for the channel (`mirza.channel.<id>`).
    """
    channel_logger = logging.getLogger(f"mirza.channel.{channel_id}")

    if not any(isinstance(f, MirzaContextFilter) for f in channel_logger.filters):
        channel_logger.addFilter(MirzaContextFilter())

    if log_level is not None:
        numeric_level = getattr(logging, log_level.upper(), logging.INFO)
        channel_logger.setLevel(numeric_level)
    else:
        numeric_level = channel_logger.getEffectiveLevel()

    channel_log_filename = f"{channel_id}.log"
    has_file_handler = any(
        (isinstance(h, (TimedRotatingFileHandler, RotatingFileHandler)) and h.baseFilename.endswith(channel_log_filename))
        for h in channel_logger.handlers
    )

    if not has_file_handler:
        channel_log_path = log_dir / channel_log_filename
        channel_logger.addHandler(
            _create_timed_rotating_file_handler(channel_log_path, numeric_level)
        )
        channel_logger.debug(f"Channel logger initialized: {channel_log_path}")

    return channel_logger


def get_ffmpeg_logger(
    channel_id: str,
    log_dir: Path = Path("logs"),
) -> logging.Logger:
    """Retrieves or creates a dedicated logger for capturing raw FFmpeg stderr output.

    Isolating FFmpeg encoder output (`logs/<channel_id>_ffmpeg.log`) keeps high-frequency
    `frame=... fps=...` telemetry separate from standard channel lifecycle logs.

    Args:
        channel_id: Unique string identifier for the channel (`channel_main`).
        log_dir: Directory where the FFmpeg log file should be stored.

    Returns:
        logging.Logger: Specialized logger (`mirza.ffmpeg.<id>`).
    """
    ffmpeg_logger = logging.getLogger(f"mirza.ffmpeg.{channel_id}")
    ffmpeg_logger.setLevel(logging.INFO)

    if not any(isinstance(f, MirzaContextFilter) for f in ffmpeg_logger.filters):
        ffmpeg_logger.addFilter(MirzaContextFilter())

    ffmpeg_log_filename = f"{channel_id}_ffmpeg.log"
    has_file_handler = any(
        (isinstance(h, (TimedRotatingFileHandler, RotatingFileHandler)) and h.baseFilename.endswith(ffmpeg_log_filename))
        for h in ffmpeg_logger.handlers
    )

    if not has_file_handler:
        ffmpeg_log_path = log_dir / ffmpeg_log_filename
        ffmpeg_logger.addHandler(
            _create_timed_rotating_file_handler(ffmpeg_log_path, logging.INFO, backup_count=14)
        )
        # Prevent double-printing raw FFmpeg lines to the main console / server log
        ffmpeg_logger.propagate = False

    return ffmpeg_logger
