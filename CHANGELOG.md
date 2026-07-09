# Changelog — Mirza Live Server

All notable changes to the **Mirza Live Server** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-07-09 (Production Release)

### Added
- **Single-Instance File Locking (`src/mirza/engine/lock.py`)**: Cross-platform file locking (`logs/mirza.lock`) using `msvcrt.locking` on Windows and `fcntl.flock` on POSIX to guarantee that no concurrent or duplicate daemon instances can ever conflict over RTMP stream keys or media folders.
- **Enhanced Diagnostic Command (`doctor`)**: Expanded pre-flight check suite verifying Python 3.12+ runtime, FFmpeg/FFprobe binaries on `PATH`, explicit OS read/write/execute permissions across `logs/`, `playlists/`, `crash_reports/`, `media/`, and enforcing a `> 2.0 GB` free disk space safety margin to prevent filesystem exhaustion.
- **Structured Context Logging (`MirzaContextFilter`)**: Automatic injection of `[Session: <id>]` and `[Channel: <id>]` headers across console outputs and rotating daily log files (`logs/server.log`, `logs/<channel_id>.log`) without requiring modifications to calling code.
- **Comprehensive Production Stress & Edge-Case Test Suite (`tests/`)**: Added `test_production_stress.py` (`O(1)` memory/file-descriptor leak verification across 1,000+ continuous playlist cycles and concurrent orchestrator shutdown) and `test_edge_cases.py` (corrupt media skip, low disk space thresholds, permission denied errors, and network disconnect signatures).
- **Production Manuals & Documentation (`docs/`)**: Added `DEPLOYMENT_GUIDE.md` (bare-metal Windows Server Task Scheduler unattended startup & Docker Compose orchestration), `TROUBLESHOOTING_GUIDE.md` (diagnostic commands and error symptom resolution matrix), and `RECOVERY_GUIDE.md` (autonomous self-healing formulas, atomic `config.yaml.tmp -> replace()` rollback, and JSON crash trace analysis).

### Hardened & Fixed
- **Atomic Configuration Persistence (`save_config`)**: Refactored `save_config` in `src/mirza/config/loader.py` to write modifications to a temporary staging file (`config.yaml.tmp`) before executing an atomic OS replacement (`Path.replace()`), alongside automatic `.bak` backups to eliminate corruption during power cuts or crashes.
- **Expanded Network Interruption Signatures**: Enhanced `StreamHealthMonitor._NETWORK_ERROR_SIGNATURES` in `src/mirza/monitor/health.py` to capture Windows WSA socket errors (`WSAGetLastError: 10054`, `WSAECONNRESET`), RTMP pull/push failures, and broken pipes for instant exponential backoff recovery.
- **Windows Path Escape Safety**: Verified and enforced forward-slash path conversion (`safe_ffmpeg_path`) across all playlist items (`MediaItem`) so FFmpeg `concat` files operate with zero syntax errors across all Windows drives and subdirectories.

---

## [0.9.0] - 2026-07-08 (Beta Architecture Completion)

### Added
- **Multi-Channel Orchestrator & Supervisor (`src/mirza/engine/`)**: Asynchronous supervision loop (`ChannelSupervisor`) managing individual `ffmpeg` encoding subprocesses with exponential backoff (`2s -> 60s`).
- **Dynamic Folder Scanning & Playlist Caching (`src/mirza/playlist/`)**: `MediaDetector` with `st_mtime` modification caching and `MediaValidator` running `ffprobe` checks prior to adding `.mp4`, `.mkv`, and `.mov` files to the queue.
- **Real-Time Telemetry & Health Monitoring (`src/mirza/monitor/`)**: `StreamHealthMonitor` parsing `stderr` (`fps`, `bitrate`, `speed`) for freeze detection (`freeze_timeout_seconds`), and `SystemHealthMonitor` tracking CPU/RAM thresholds via `psutil`.
- **Diagnostic CLI Utilities (`main.py`)**: Subcommands including `doctor`, `dry-run`, `validate`, `verify`, `start`, and `status`.
- **Post-Mortem Crash Traces (`CrashReport`)**: Automatic serialization of process exit codes, last media item, system hardware metrics, and `stderr` tail into `crash_reports/crash_*.json`.
- **Daily Rotating Logs (`src/mirza/logger.py`)**: `TimedRotatingFileHandler` isolation separating general channel lifecycle from high-frequency FFmpeg encoder telemetry (`logs/<channel_id>_ffmpeg.log`).

---

## [0.1.0] - 2026-07-01 (Initial Prototype)

### Added
- Initial project layout and basic FFmpeg subprocess spawning script.
- Basic YAML loading (`config.yaml`) and `.env` environment variable substitution.
