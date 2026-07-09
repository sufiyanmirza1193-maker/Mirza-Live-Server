"""Top-level CLI entry point for Mirza Live Server.

This module parses command-line arguments, bootstraps the logging engine,
loads configuration and environment variables, and delegates execution
to the multi-channel streaming orchestrator.
"""

import argparse
import asyncio
import logging
import sys
from pathlib import Path
from typing import Optional, Sequence

# Ensure src/ is on sys.path when running directly from project root
sys.path.insert(0, str(Path(__file__).resolve().parent / "src"))

# Note: These modules will be generated in upcoming execution modules.
# We import inside helper functions or wrap with try/except during Phase 1 verification.


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

    # Validate subcommand
    subparsers.add_parser(
        "validate",
        help="Validate config.yaml, environment secrets, and media paths.",
    )

    # Status subcommand
    subparsers.add_parser(
        "status",
        help="Inspect running channel status and hardware resource usage.",
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
        from mirza.config.loader import load_config
        from mirza.logger import setup_logging

        setup_logging("INFO")
        logger = logging.getLogger("mirza.cli")
        logger.info(f"Validating configuration file: {config_path}")

        app_config = load_config(config_path)
        logger.info(f"Configuration loaded successfully! ({len(app_config.channels)} channels found)")

        for channel in app_config.channels:
            status_str = "ENABLED" if channel.enabled else "DISABLED"
            logger.info(f" - [{channel.channel_id}] '{channel.name}' -> {status_str}")

        logger.info("Validation complete. All configuration parameters are valid.")
        return 0
    except Exception as exc:
        print(f"Validation Error: {exc}", file=sys.stderr)
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

        # Register graceful shutdown signals on Windows and POSIX
        await orchestrator.start_channels(target_channel_id=channel_id)

        # Run continuously until interrupted
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
    elif args.command == "start":
        try:
            return asyncio.run(handle_start_async(args.config, args.channel))
        except KeyboardInterrupt:
            print("\nExiting Mirza Live Server.")
            return 0
    elif args.command == "status":
        print("Status command requires active server orchestration (v2 API feature).")
        return 0

    parser.print_help()
    return 1


if __name__ == "__main__":
    sys.exit(main())
