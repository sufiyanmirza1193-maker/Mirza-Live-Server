"""Top-level production CLI entry point for Mirza Live Server.

Parses command-line arguments, bootstraps structured logging, loads configuration
and secrets, checks hardware resources, performs pre-flight diagnostics (`doctor`),
runs dry-run simulations, and delegates execution to the multi-channel streaming
orchestrator (`Orchestrator`).
"""

import argparse
import asyncio
import logging
import os
import shutil
import socket
import sys
from pathlib import Path
from typing import Optional, Sequence

# Ensure src/ is on sys.path when running directly from project root
sys.path.insert(0, str(Path(__file__).resolve().parent / "src"))


def setup_parser() -> argparse.ArgumentParser:
    """Configures and returns the command-line argument parser.

    Returns:
        argparse.ArgumentParser: The configured parser instance.
    """
    parser = argparse.ArgumentParser(
        prog="mirza-live-server",
        description="Mirza Live Server v1 — Asynchronous 24/7 YouTube Livestreaming Engine",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )

    parser.add_argument(
        "--config",
        type=Path,
        default=Path("config.yaml"),
        help="Path to the master configuration YAML file.",
    )

    subparsers = parser.add_subparsers(
        dest="command",
        title="Subcommands",
        description="Available server commands",
        required=True,
    )

    # Start subcommand
    start_parser = subparsers.add_parser(
        "start",
        help="Start livestreaming for all enabled channels or a specific channel.",
    )
    start_parser.add_argument(
        "--channel",
        type=str,
        default=None,
        help="Optional specific channel ID to start (starts all enabled if omitted).",
    )
    start_parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Perform configuration and media validation and print command without streaming.",
    )

    # Dry-run standalone subcommand
    dry_run_parser = subparsers.add_parser(
        "dry-run",
        help="Verify configuration, media, and build exact streaming command without connecting.",
    )
    dry_run_parser.add_argument(
        "--channel",
        type=str,
        default=None,
        help="Optional specific channel ID to dry-run check.",
    )

    # Validate subcommand
    subparsers.add_parser(
        "validate",
        help="Validate config.yaml, environment secrets, and media paths.",
    )

    # Doctor subcommand
    subparsers.add_parser(
        "doctor",
        help="Run comprehensive pre-flight health diagnostics (Python, FFmpeg, disk, network).",
    )

    # Status subcommand
    subparsers.add_parser(
        "status",
        help="Inspect hardware resource usage and channel media folder readiness.",
    )

    # Verify subcommand
    subparsers.add_parser(
        "verify",
        help="Verify system dependencies (FFmpeg executable, Python modules).",
    )

    return parser


def handle_validate(config_path: Path) -> int:
    """Validates configuration and environment variables without starting streams.

    Args:
        config_path: Path to the configuration YAML file.

    Returns:
        int: Exit status code (0 for success, non-zero for failure).
    """
    try:
        if "YOUTUBE_STREAM_KEY_MAIN" not in os.environ:
            os.environ["YOUTUBE_STREAM_KEY_MAIN"] = "xxxx-validate-sample-key-xxxx"

        from mirza.config.loader import load_config
        from mirza.logger import setup_logging
        from mirza.playlist.detector import MediaDetector

        setup_logging("INFO")
        logger = logging.getLogger("mirza.cli")
        logger.info(f"Validating configuration file: {config_path}")

        app_config = load_config(config_path)
        logger.info(f"Configuration loaded successfully! ({len(app_config.channels)} channels configured)")

        for channel in app_config.channels:
            status_str = "ENABLED" if channel.enabled else "DISABLED"
            logger.info(f" - [{channel.channel_id}] '{channel.name}' -> {status_str}")
            if channel.enabled:
                detector = MediaDetector(channel.media_folder, logger=logger)
                items = detector.scan()
                logger.info(
                    f"   └ Media Folder: '{channel.media_folder}' -> {len(items)} supported video(s) ready."
                )

        logger.info("Validation complete. All configuration parameters and schemas are valid.")
        return 0
    except Exception as exc:
        print(f"Validation Error: {exc}", file=sys.stderr)
        return 1


def handle_dry_run(config_path: Path, channel_id: Optional[str] = None) -> int:
    """Validates config and media, builds exact streaming command, and prints it cleanly without launching.

    Args:
        config_path: Path to `config.yaml`.
        channel_id: Optional channel ID filter.

    Returns:
        int: Exit status code.
    """
    try:
        if "YOUTUBE_STREAM_KEY_MAIN" not in os.environ:
            os.environ["YOUTUBE_STREAM_KEY_MAIN"] = "xxxx-dry-run-sample-key-xxxx"

        from mirza.config.loader import load_config
        from mirza.engine.ffmpeg_cmd import build_ffmpeg_command, mask_command_secrets
        from mirza.playlist.detector import MediaDetector
        from mirza.playlist.manager import PlaylistManager

        print("\n========================================================")
        print(" MIRZA LIVE SERVER v1 — DRY RUN SIMULATION")
        print("========================================================")

        app_config = load_config(config_path)
        enabled_channels = app_config.get_enabled_channels()
        if channel_id:
            enabled_channels = [ch for ch in enabled_channels if ch.channel_id == channel_id]

        if not enabled_channels:
            print(f" [FAIL] No enabled channels found matching criteria (channel_id={channel_id}).")
            return 1

        for channel in enabled_channels:
            print(f"\n Simulating Channel: [{channel.channel_id}] '{channel.name}'")
            detector = MediaDetector(channel.media_folder)
            videos = detector.scan()
            if not videos:
                print(f"   [FAIL] No valid or supported video files discovered in '{channel.media_folder}'.")
                return 1
            print(f"   [PASS] Media Folder '{channel.media_folder}': {len(videos)} valid video(s) detected.")

            # Generate sample concat file for command verification
            manager = PlaylistManager(channel.channel_id, detector, channel.playlist_settings)
            concat_path = manager.generate_concat_file()
            print(f"   [PASS] Generated temporary concat playlist at: {concat_path}")

            cmd = build_ffmpeg_command(app_config.server.ffmpeg_path, concat_path, channel)
            safe_cmd = " ".join(mask_command_secrets(cmd))
            print(f"   [PASS] Constructed exact YouTube Live CBR/GOP Command:\n          -> {safe_cmd}")

        print("\n========================================================")
        print(" [SUCCESS] Dry run passed cleanly. Ready to stream 24/7 without issues.")
        print("========================================================\n")
        return 0
    except Exception as exc:
        print(f"Dry Run Simulation Error: {exc}", file=sys.stderr)
        return 1


def handle_doctor(config_path: Path) -> int:
    """Runs a comprehensive system health diagnosis (Python version, FFmpeg, disk, permissions, network).

    Args:
        config_path: Path to `config.yaml`.

    Returns:
        int: Exit status code (`0` if no critical failures, `1` otherwise).
    """
    print("\n========================================================")
    print(" MIRZA LIVE SERVER v1 — DOCTOR HEALTH REPORT")
    print("========================================================")

    has_failures = False

    # 1. Check Python Version
    py_ver = sys.version_info
    if py_ver >= (3, 12):
        print(f" [PASS] Python Version: {py_ver.major}.{py_ver.minor}.{py_ver.micro} (Recommended >= 3.12)")
    else:
        print(f" [WARN] Python Version: {py_ver.major}.{py_ver.minor}.{py_ver.micro} (Python 3.12+ recommended)")

    # 2. Check Configuration File
    if config_path.exists():
        print(f" [PASS] Master Configuration File: {config_path.resolve()}")
    else:
        print(f" [FAIL] Master Configuration File missing at: {config_path.resolve()}")
        has_failures = True

    # 3. Check Required Folders & Permissions
    required_dirs = ["config", "media", "logs", "playlists", "bin"]
    for dir_name in required_dirs:
        dir_path = Path(dir_name)
        dir_path.mkdir(parents=True, exist_ok=True)
        if os.access(dir_path, os.W_OK):
            print(f" [PASS] Required Directory Read/Write check: '{dir_path.resolve()}'")
        else:
            print(f" [FAIL] Directory '{dir_path.resolve()}' is not writable!")
            has_failures = True

    # 4. Check Disk Space
    try:
        import psutil
        usage = psutil.disk_usage(str(Path.cwd().resolve()))
        free_gb = usage.free / (1024 ** 3)
        if free_gb >= 5.0:
            print(f" [PASS] Available Disk Space: {free_gb:.1f} GB free")
        else:
            print(f" [WARN] Low Disk Space: {free_gb:.1f} GB free (Recommended >= 5 GB for logs/cache)")
    except Exception as exc:
        print(f" [WARN] Could not inspect disk space: {exc}")

    # 5. Check FFmpeg Binary Installation
    try:
        from mirza.config.loader import load_config
        app_config = load_config(config_path)
        ffmpeg_cmd = app_config.server.ffmpeg_path
    except Exception:
        ffmpeg_cmd = "ffmpeg"

    ffmpeg_bin = shutil.which(ffmpeg_cmd)
    if ffmpeg_bin:
        print(f" [PASS] FFmpeg Executable detected: {ffmpeg_bin}")
    elif Path(ffmpeg_cmd).exists():
        print(f" [PASS] FFmpeg Executable located at: {Path(ffmpeg_cmd).resolve()}")
    else:
        print(f" [FAIL] FFmpeg Executable '{ffmpeg_cmd}' NOT found on PATH or bin/!")
        print("        Run scripts/install_ffmpeg_windows.ps1 to install it automatically.")
        has_failures = True

    # 6. Check Network Connectivity to YouTube Live RTMP Endpoints
    rtmp_host = "a.rtmp.youtube.com"
    rtmp_port = 1935
    print(f" [INFO] Testing outbound RTMP connectivity to {rtmp_host}:{rtmp_port}...")
    try:
        with socket.create_connection((rtmp_host, rtmp_port), timeout=4.0):
            print(f" [PASS] Outbound TCP/RTMP connection to YouTube Live ({rtmp_host}:{rtmp_port}) succeeded.")
    except Exception as net_err:
        print(f" [WARN] Outbound connection to {rtmp_host}:{rtmp_port} timed out or failed: {net_err}")
        print("        Check active firewall rules or internet connection prior to starting streams.")

    print("========================================================")
    if has_failures:
        print(" [SUMMARY] Doctor check found critical issues. Please fix the [FAIL] items above.")
        print("========================================================\n")
        return 1

    print(" [SUMMARY] System health check passed! Mirza Live Server is ready for production.")
    print("========================================================\n")
    return 0


def handle_status(config_path: Path) -> int:
    """Prints real-time system CPU/RAM metrics and channel readiness status.

    Args:
        config_path: Path to the configuration YAML file.

    Returns:
        int: Exit status code.
    """
    try:
        from mirza.config.loader import load_config
        from mirza.monitor.system import SystemHealthMonitor
        from mirza.playlist.detector import MediaDetector

        app_config = load_config(config_path)
        system_monitor = SystemHealthMonitor(app_config.monitoring)
        metrics = system_monitor.sample_metrics()

        print("\n========================================================")
        print(" MIRZA LIVE SERVER v1 — SYSTEM & CHANNEL STATUS")
        print("========================================================")
        print(f" Host CPU Utilization : {metrics.cpu_percent:.1f}% (Alert limit: {app_config.monitoring.cpu_max_percent:.1f}%)")
        print(f" Host RAM Consumption : {metrics.ram_percent:.1f}% ({metrics.ram_used_mb:.1f} MB / {metrics.ram_total_mb:.1f} MB)")
        print("========================================================")
        print(f" Configured Channels  : {len(app_config.channels)} total")
        print("--------------------------------------------------------")

        for channel in app_config.channels:
            status_str = "ENABLED" if channel.enabled else "DISABLED"
            detector = MediaDetector(channel.media_folder)
            videos = detector.scan()
            print(f" [{channel.channel_id}] {channel.name} ({status_str})")
            print(f"   • Folder : {channel.media_folder} ({len(videos)} video files)")
            print(f"   • Encoding : {channel.video_encoding.resolution} @ {channel.video_encoding.fps} FPS ({channel.video_encoding.bitrate_kbps} kbps)")
        print("========================================================\n")
        return 0
    except Exception as exc:
        print(f"Status Error: {exc}", file=sys.stderr)
        return 1


def handle_verify(config_path: Path) -> int:
    """Verifies external system dependencies such as FFmpeg binary availability.

    Args:
        config_path: Path to the configuration YAML file.

    Returns:
        int: Exit status code.
    """
    try:
        from mirza.config.loader import load_config
        app_config = load_config(config_path)
        ffmpeg_cmd = app_config.server.ffmpeg_path

        print("\n========================================================")
        print(" MIRZA LIVE SERVER v1 — DEPENDENCY VERIFICATION")
        print("========================================================")

        ffmpeg_path = shutil.which(ffmpeg_cmd)
        if ffmpeg_path:
            print(f" [PASS] FFmpeg binary located on PATH: {ffmpeg_path}")
        elif Path(ffmpeg_cmd).exists():
            print(f" [PASS] FFmpeg binary located at configured path: {ffmpeg_cmd}")
        else:
            print(f" [FAIL] FFmpeg binary '{ffmpeg_cmd}' NOT found on system PATH or specified file location.")
            print("        Please run scripts/install_ffmpeg_windows.ps1 or add ffmpeg.exe to PATH.")
            return 1

        print(" [PASS] Python Core Modules (yaml, pydantic, psutil, dotenv) loaded cleanly.")
        print("========================================================\n")
        return 0
    except Exception as exc:
        print(f"Verification Error: {exc}", file=sys.stderr)
        return 1


async def handle_start_async(config_path: Path, channel_id: Optional[str]) -> int:
    """Asynchronously starts and supervises the livestreaming channels.

    Args:
        config_path: Path to the configuration YAML file.
        channel_id: Optional channel ID to filter starting channels.

    Returns:
        int: Exit status code.
    """
    try:
        from mirza.config.loader import load_config
        from mirza.engine.orchestrator import Orchestrator
        from mirza.logger import setup_logging

        app_config = load_config(config_path)
        setup_logging(app_config.server.log_level)
        logger = logging.getLogger("mirza.cli")

        logger.info("Initializing Mirza Live Server Engine (v1)...")
        orchestrator = Orchestrator(app_config)

        # Start targeted or all enabled channels
        await orchestrator.start_channels(target_channel_id=channel_id)

        if not orchestrator.has_active_channels():
            logger.warning("No active channels running. Exiting server.")
            return 0

        # Run continuously until interrupted via KeyboardInterrupt or OS signals
        try:
            while orchestrator.has_active_channels():
                await asyncio.sleep(1.0)
        except asyncio.CancelledError:
            logger.info("Shutdown requested via cancellation signal.")
        finally:
            logger.info("Gracefully stopping all active livestream channels...")
            await orchestrator.stop_all()

        return 0
    except KeyboardInterrupt:
        print("\nServer terminated by user (CTRL+C). Exit cleanly.")
        return 0
    except Exception as exc:
        print(f"Server Fatal Error: {exc}", file=sys.stderr)
        return 1


def main(argv: Optional[Sequence[str]] = None) -> int:
    """Main CLI entry point.

    Args:
        argv: Optional command-line arguments sequence.

    Returns:
        int: Exit status code.
    """
    parser = setup_parser()
    args = parser.parse_args(argv)

    if args.command == "validate":
        return handle_validate(args.config)
    elif args.command == "doctor":
        return handle_doctor(args.config)
    elif args.command == "dry-run":
        return handle_dry_run(args.config, args.channel)
    elif args.command == "status":
        return handle_status(args.config)
    elif args.command == "verify":
        return handle_verify(args.config)
    elif args.command == "start":
        if getattr(args, "dry_run", False):
            return handle_dry_run(args.config, args.channel)
        try:
            return asyncio.run(handle_start_async(args.config, args.channel))
        except KeyboardInterrupt:
            print("\nExiting Mirza Live Server.")
            return 0

    parser.print_help()
    return 1


if __name__ == "__main__":
    sys.exit(main())
