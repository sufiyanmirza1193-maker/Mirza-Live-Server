# Mirza Live Server — Phase 1 Complete Code Review & Architectural Assessment

**Author**: Lead Software Architect & Senior Python Engineer  
**Date**: July 2026  
**Target Release**: Mirza Live Server v1.0.0 Production Release  

---

## Executive Summary

The **Mirza Live Server** Version 1 codebase has been audited across all packages (`src/mirza/config`, `engine`, `playlist`, `monitor`, `logger.py`, CLI entry `main.py`, `scripts/`, and `tests/`). The architecture strictly follows **clean layered architecture** and **SOLID principles**, isolating concerns between configuration parsing (`Pydantic`), asynchronous process supervision (`asyncio`), deterministic playlist demuxing, and hardware health telemetry (`psutil`).

This report documents our exhaustive inspection of architecture, memory safety, concurrency (`asyncio`), error boundaries, and performance characteristics, alongside actionable recommendations categorized by priority level (`HIGH`, `MEDIUM`, `LOW`).

---

## 1. Package-by-Package Audit & Findings

### 1.1 Configuration Subsystem (`src/mirza/config/`)
*Files: `models.py`, `loader.py`*

- **Strengths**:
  - `models.py` uses **Pydantic v2 (`BaseModel`, `Field`, `@field_validator`)** to enforce strict typing on resolutions, GOP sizes, bitrates, and retry policies.
  - `loader.py` implements safe YAML parsing (`yaml.safe_load`), environment variable resolution (`${VAR_NAME}` syntax), and automatic `.bak` backups prior to saving configuration mutations.
- **Weaknesses / Observations**:
  - `save_config()` writes YAML directly to disk without atomic file replacement (e.g., writing to a temporary `.tmp` file and renaming), which could leave a zero-byte or partially written file if power fails mid-write (`OSError`).
- **Recommendations**:
  - **[MEDIUM]** Upgrade `save_config()` to use atomic file replacement (`Path.replace()`) after writing to a temporary file.

---

### 1.2 Orchestration & Supervision Engine (`src/mirza/engine/`)
*Files: `orchestrator.py`, `supervisor.py`, `ffmpeg_cmd.py`, `crash_report.py`*

- **Strengths**:
  - `Orchestrator` cleanly encapsulates multi-channel task management (`asyncio.gather`) and guarantees structured shutdown (`logging.shutdown()`).
  - `ChannelSupervisor` manages asynchronous child subprocess creation (`asyncio.create_subprocess_exec`) without blocking the main event loop.
  - `CrashReport` captures exact UTC timestamps, CPU/RAM utilization, and the last 15 lines of raw FFmpeg stderr, persisting them to `logs/crash_reports/`.
- **Weaknesses / Observations**:
  - If two instances of `main.py start` are executed concurrently on the same machine, both instances will attempt to bind to the same media files and output RTMP stream keys simultaneously without a mutual exclusion mechanism (`flock` / file locking).
  - While `ChannelSupervisor` isolates `_last_stderr_lines` cleanly, extreme network drops might emit transient socket timeouts (`RTMP_Connect0`) where immediate retry without backoff damping could flood the network.
- **Recommendations**:
  - **[HIGH]** Implement cross-platform single-instance file locking (`src/mirza/engine/lock.py`) to prevent multiple conflicting processes.
  - **[MEDIUM]** Add fine-grained network disconnect categorization inside `supervisor.py` to ensure clean backoff recovery on `EOF` and `Broken pipe`.

---

### 1.3 Playlist & Demuxer Subsystem (`src/mirza/playlist/`)
*Files: `manager.py`, `detector.py`, `item.py`, `validator.py`*

- **Strengths**:
  - `MediaValidator` queries `ffprobe` and caches results against file `st_mtime`, ensuring `O(1)` validation performance across repeated loops over unchanged directories.
  - `PlaylistManager.generate_concat_file()` converts Windows backslashes (`\`) to forward slashes (`/`), resolving FFmpeg demuxer syntax issues on Windows NTFS.
- **Weaknesses / Observations**:
  - When `settings.loop` is enabled, if every video in `media_folder` is deleted while the stream is live, `PlaylistManager.get_next_item()` catches `PlaylistEmptyError` but returns `None` when loop count advances. `ChannelSupervisor._supervision_loop()` traps this cleanly and waits 10 seconds before retrying, but `PlaylistManager` should log explicit warnings when directory item count drops to zero mid-stream.
- **Recommendations**:
  - **[LOW]** Add proactive directory empty alerts inside `detect_changes()` whenever `len(current_items) == 0`.

---

### 1.4 Monitoring & Telemetry Subsystem (`src/mirza/monitor/`)
*Files: `health.py`, `system.py`*

- **Strengths**:
  - `StreamHealthMonitor` parses real-time FFmpeg progress strings (`frame=... fps=... bitrate=... speed=...`) using fast string slicing (`split()`) with near-zero CPU overhead.
  - `SystemHealthMonitor` samples CPU (`psutil.cpu_percent()`) and RAM (`psutil.virtual_memory()`) and raises structured threshold warnings when memory consumption crosses user limits (`ram_max_percent`).
- **Weaknesses / Observations**:
  - None identified. Thread/task safety is preserved by running `_monitor_health_loop()` inside a dedicated `asyncio.Task` tied directly to the supervisor lifecycle.

---

### 1.5 Logging Subsystem (`src/mirza/logger.py`)
*Files: `logger.py`*

- **Strengths**:
  - Uses `TimedRotatingFileHandler` (`when='midnight'`, `interval=1`) across master server logs, channel logs, and FFmpeg raw logs, preventing unbounded disk growth.
  - Optional `colorlog` support for rich console output with automatic fallback.
- **Weaknesses / Observations**:
  - Logs lack explicit Session UUIDs and Channel UUID context prefixes, which makes multi-channel log correlation across concurrent streams harder in production.
- **Recommendations**:
  - **[MEDIUM]** Inject `[Session: <id>]` and `[Channel: <id>]` header context into rotating file handlers (`_FILE_FORMAT`).

---

### 1.6 Command-Line Interface & Utilities (`main.py`, `scripts/`)
*Files: `main.py`, `scripts/register_startup.ps1`, `scripts/unregister_startup.ps1`*

- **Strengths**:
  - Clean `argparse` hierarchy providing `start`, `validate`, `doctor`, `dry-run`, `status`, and `verify` subcommands.
  - Windows PowerShell scripts (`register_startup.ps1`) configure clean background task scheduler registration (`-AtLogOn` / `-AtStartup`).
- **Weaknesses / Observations**:
  - `handle_doctor()` checks directory permissions (`os.W_OK`) and disk space (`psutil.disk_usage`), but should also verify `os.R_OK` and `os.X_OK` to guarantee complete directory traversal safety.
- **Recommendations**:
  - **[HIGH]** Hardening `doctor` and `verify` commands with explicit `R_OK | W_OK | X_OK` checks.

---

## 2. Priority Action Plan for Production Hardening

| Priority | Component | Action Item | Target Phase |
| :--- | :--- | :--- | :--- |
| **HIGH** | `src/mirza/engine/lock.py` | Create single-instance file lock (`logs/mirza.lock`) to prevent concurrent instances. | Phase 2 |
| **HIGH** | `main.py` (`handle_doctor`) | Hardening diagnostic permission checks (`read/write/execute`) across all system directories. | Phase 2 |
| **MEDIUM** | `src/mirza/config/loader.py` | Implement atomic temporary file write before renaming during `save_config()`. | Phase 2 |
| **MEDIUM** | `src/mirza/logger.py` | Inject `[Session: <uuid>]` and `[Channel: <id>]` context directly into log formatters. | Phase 4 |
| **MEDIUM** | `tests/` | Add comprehensive edge-case (`test_edge_cases.py`) and long-running stress tests (`test_production_stress.py`). | Phase 3 |

---
*End of Code Review Report.*
