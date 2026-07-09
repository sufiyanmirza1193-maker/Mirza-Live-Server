"""FFmpeg command builder and cross-platform process flag utilities.

Enforces strict YouTube Live ingestion standards: Constant Bitrate (CBR),
exact 2-second Keyframe interval (GOP = 2 * fps), native frame rate reading (`-re`),
and Windows process flags to suppress distracting console popups.
"""

import subprocess
import sys
from pathlib import Path
from typing import List

from mirza.config.models import ChannelConfig


def get_windows_creation_flags() -> int:
    """Returns platform-specific subprocess creation flags to suppress CMD popups.

    On Windows (`win32`), returns `subprocess.CREATE_NO_WINDOW` (`0x08000000`).
    On POSIX (Linux/macOS), returns `0`.

    Returns:
        int: Subprocess creation flag integer.
    """
    if sys.platform == "win32":
        return getattr(subprocess, "CREATE_NO_WINDOW", 0x08000000)
    return 0


def build_ffmpeg_command(
    ffmpeg_path: str,
    concat_file: Path,
    channel_config: ChannelConfig,
) -> List[str]:
    """Constructs the exact FFmpeg argument list required for stable YouTube ingestion.

    YouTube Live mandates:
    1. `-re`: Read input at native frame rate.
    2. `-b:v {bitrate}k -maxrate {bitrate}k -bufsize {2*bitrate}k`: Strict CBR video encoding.
    3. `-g {2*fps} -keyint_min {fps}`: Exactly 2-second Group of Pictures (GOP) keyframe interval.
    4. `-pix_fmt yuv420p`: Standard 4:2:0 chroma subsampling required by YouTube player.
    5. `-f flv {rtmp_url}/{stream_key}`: Flash Video RTMP transport container.

    Args:
        ffmpeg_path: Name or absolute path pointing to the FFmpeg executable (`ffmpeg`).
        concat_file: Absolute path to the runtime `concat.txt` demuxer file (`playlists/concat_*.txt`).
        channel_config: The channel's configuration model (`video_encoding`, `audio_encoding`).

    Returns:
        List[str]: Complete argument list ready for `asyncio.create_subprocess_exec`.
    """
    video = channel_config.video_encoding
    audio = channel_config.audio_encoding

    # Ensure RTMP URL ends without trailing slash before appending stream key
    rtmp_base = channel_config.rtmp_url.rstrip("/")
    destination_url = f"{rtmp_base}/{channel_config.stream_key}"

    command: List[str] = [
        ffmpeg_path,
        "-y",                             # Overwrite output without asking (safety for flags)
        "-re",                            # Read input at native video frame rate
        "-f", "concat",                   # Use FFmpeg concat demuxer
        "-safe", "0",                     # Allow absolute file paths inside concat.txt
        "-i", str(concat_file.resolve()), # Input playlist path
        
        # Video encoding parameters
        "-c:v", "libx264",
        "-preset", video.preset,
        "-b:v", f"{video.bitrate_kbps}k",
        "-maxrate", f"{video.bitrate_kbps}k",
        "-bufsize", f"{video.bitrate_kbps * 2}k",
        "-pix_fmt", video.pix_fmt,
        "-r", str(video.fps),
        "-g", str(video.gop_size),
        "-keyint_min", str(video.fps),
        
        # Audio encoding parameters
        "-c:a", "aac",
        "-b:a", f"{audio.bitrate_kbps}k",
        "-ar", str(audio.sample_rate_hz),
        "-ac", str(audio.channels),
        
        # Output format & endpoint destination
        "-f", "flv",
        destination_url,
    ]

    return command


def mask_command_secrets(command: List[str]) -> List[str]:
    """Returns a copy of the command list with sensitive RTMP stream keys redacted for logging.

    Args:
        command: Raw argument list produced by `build_ffmpeg_command`.

    Returns:
        List[str]: Sanitized argument list safe for plain-text log files.
    """
    sanitized = list(command)
    if not sanitized:
        return sanitized

    last_arg = sanitized[-1]
    if "rtmp://" in last_arg or "rtmps://" in last_arg:
        parts = last_arg.rsplit("/", 1)
        if len(parts) == 2:
            sanitized[-1] = f"{parts[0]}/<REDACTED_STREAM_KEY>"

    return sanitized
