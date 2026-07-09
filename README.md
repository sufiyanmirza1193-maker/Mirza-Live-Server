# Mirza Live Server (Version 1 — Core Streaming Engine)

**Mirza Live Server** is a production-grade, asynchronous 24/7 YouTube livestreaming engine built in Python 3.12+ for Windows (with Linux/macOS cross-compatibility). Version 1 focuses strictly on high-reliability, continuous video ingestion using `ffmpeg` with automatic crash recovery, dynamic folder monitoring, and real-time hardware/stream telemetry.

---

## 🌟 Version 1 Core Features

- **Robust FFmpeg Streaming Engine**: Adheres strictly to YouTube Live ingestion guidelines (Constant Bitrate `CBR`, fixed 2-second Keyframe intervals `GOP`, audio sync).
- **Automatic Media Folder Detection**: Continuously monitors designated video folders (`media/channel_main`). Simply drop new `.mp4`, `.mkv`, or `.mov` files into the folder, and they are automatically incorporated into the next playlist loop without restarting the stream.
- **Dynamic Playlist Manager**: Supports random shuffle, sequential playback, and continuous infinite looping with forward-slash escaped Windows path handling (`concat.txt`).
- **Stream Health & Freeze Monitor**: Real-time asynchronous parsing of `ffmpeg` standard error (`stderr`) to monitor frame rate (`fps`), output bitrate (`kbits/s`), encoding speed multiplier (`speed`), and dropped frames.
- **Autonomous Auto-Restart & Supervisor**: Catches unexpected `ffmpeg` crashes, network drops, or stream stalls, applying exponential backoff retry policies to guarantee 24/7 uptime.
- **CPU & RAM Telemetry**: Hardware resource monitoring using `psutil` with configurable alert thresholds.
- **Structured Rotating Logging**: Daily rotating log files (`logs/server.log` and `logs/<channel_id>.log`) plus colored console output (`colorlog`).
- **Secure Environment Variables**: Stream keys and credentials are loaded safely via `.env` (`python-dotenv`). Never hardcoded.

---

## 📁 Project Folder Structure

```
Mirza-Live-Server/
├── src/
│   └── mirza/                 # Core Python package
│       ├── config/            # Pydantic V2 models & YAML/.env configuration loader
│       ├── monitor/           # psutil CPU/RAM telemetry & FFmpeg stderr health parser
│       ├── playlist/          # Automatic folder scanner & safe Windows concat builder
│       └── engine/            # FFmpeg command builder, async supervisor & orchestrator
├── config/                    # Additional channel profiles and custom schemas
├── playlists/                 # Generated runtime concat playlist files (concat_*.txt)
├── media/                     # Media folders containing video files (.mp4, .mkv, .mov)
│   └── channel_main/          # Drop videos for 'channel_main' here
├── logs/                      # Rotating daily log files (server.log, channel_main.log)
├── tests/                     # Unit test suite for all core modules (pytest)
├── scripts/                   # Windows startup utilities (.bat, .ps1 launcher scripts)
├── requirements.txt           # Python 3.12+ dependencies
├── README.md                  # Project documentation (this file)
├── ARCHITECTURE.md            # Technical architectural specifications & v2 roadmap
├── .gitignore                 # Git ignore rules
├── .env.example               # Template for sensitive environment variables
├── config.yaml                # Master configuration file (multi-channel definitions)
└── main.py                    # Top-level CLI entry point
```

---

## 🚀 Quick Start & Installation (Windows)

### 1. Prerequisites
- **Python 3.12+**: Ensure Python is installed and added to your system `PATH`.
- **FFmpeg**: Install `ffmpeg` and ensure `ffmpeg.exe` is accessible via command line (or specify its exact path in `.env` / `config.yaml`).

### 2. Setup Virtual Environment
Open PowerShell or Command Prompt in the project directory:

```powershell
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Configure Credentials & Channels
1. Copy `.env.example` to `.env`:
   ```powershell
   Copy-Item .env.example .env
   ```
2. Open `.env` and insert your actual YouTube Live stream key:
   ```env
   YOUTUBE_STREAM_KEY_MAIN=xxxx-xxxx-xxxx-xxxx-xxxx
   ```
3. Place your livestream video files (e.g., `lofi_background.mp4`) into `media/channel_main/`.
4. Review `config.yaml` to adjust video/audio encoding parameters (resolution, bitrate, framerate) as desired.

---

## 💻 Command Line Usage (`main.py`)

Mirza Live Server provides six clean CLI subcommands for production operations and diagnostics:

### 1. Pre-Flight Health Check (`doctor`)
Run a comprehensive diagnosis of system prerequisites, Python version (`3.12+`), folder read/write permissions, disk space availability, FFmpeg executable status, and outbound RTMP connectivity to YouTube Live:
```powershell
python main.py doctor
```

### 2. Dry-Run Simulation (`dry-run`)
Validate configuration profiles, check media directory health (`ffprobe` verification), generate the safe `concat.txt` playlist, and print the exact YouTube Live CBR/GOP FFmpeg command without initiating an internet connection or streaming:
```powershell
python main.py dry-run
# Or run targeting a specific channel:
python main.py dry-run --channel channel_main
# Or run via start flag:
python main.py start --dry-run
```

### 3. Validate Configuration (`validate`)
Inspect `config.yaml` syntax, Pydantic type constraints, environment secret resolution, and scan media folders:
```powershell
python main.py validate
```

### 4. Verify System Dependencies (`verify`)
Quickly verify that `ffmpeg` binary and core Python libraries (`pydantic`, `psutil`, `yaml`, `dotenv`) are loaded:
```powershell
python main.py verify
```

### 5. Start Livestream Server (`start`)
Launch the asynchronous supervision loop for all enabled channels defined in `config.yaml`:
```powershell
python main.py start
```

Start a single specific channel by ID:
```powershell
python main.py start --channel channel_main
```

### 6. Check Real-Time Status (`status`)
Inspect host CPU utilization (`psutil`), RAM consumption, and channel media folder counts:
```powershell
python main.py status
```

---

## ⚡ Windows Automatic Startup Setup (`scripts/`)

To run Mirza Live Server automatically in the background on your Windows machine 24/7 immediately after logging in (or at system boot), we provide PowerShell utilities using Windows Task Scheduler:

### Register Automatic Startup Task
Open PowerShell as **Administrator** and run:
```powershell
powershell -ExecutionPolicy Bypass -File scripts\register_startup.ps1
```
- Creates a persistent scheduled task named **`MirzaLiveServer_24_7`**.
- Runs `python main.py start` in the background with `HighestAvailable` privileges upon user logon.
- Automatically retries up to 3 times if interrupted during OS boot.

### Unregister / Remove Startup Task
If you want to stop background scheduling and remove the task:
```powershell
powershell -ExecutionPolicy Bypass -File scripts\unregister_startup.ps1
```

---

## 🛡️ Production Finalization & Resilience Upgrades

Mirza Live Server incorporates hardened production capabilities to guarantee continuous 24/7 broadcasting without intervention:
- **Media Validator (`src/mirza/playlist/validator.py`)**: Before querying FFmpeg, videos undergo deep `ffprobe` inspection (`H.264`/`AAC` codec check, frame rate checking, corrupted header detection). Corrupted or invalid media files are automatically skipped and excluded from `concat.txt`.
- **Directory Modification Caching (`st_mtime`)**: `MediaDetector` caches folder timestamps so redundant disk scans are bypassed when media folders remain unchanged (`O(1)` verification).
- **Network Interruption Signatures**: `StreamHealthMonitor` captures RTMP drops (`Connection reset by peer`, `RTMP_Connect0`, `Server returned 4XX/5XX`, `Broken pipe`), immediately triggering an exponential backoff auto-restart (`ChannelSupervisor`).
- **Crash Diagnostic Reports (`CrashReport`)**: Whenever FFmpeg exits unexpectedly or drops due to network/freeze events, a structured diagnostic artifact is saved to `logs/crash_<channel_id>_<timestamp>.json` recording CPU/RAM state, exit code, current media file, and the last 15 raw stderr lines.
- **Config Backup Protection (`config.yaml.bak`)**: Prior to persisting configuration changes, `save_config` automatically generates a backup `.bak` snapshot to prevent corruption.
- **Daily Rotating Logs & FFmpeg Isolation**: System logs rotate daily at midnight (`TimedRotatingFileHandler`, 30-day retention). Raw FFmpeg progress output is isolated inside `logs/<channel_id>_ffmpeg.log` (14-day retention).

---

## 📚 Production Documentation & Guides (`docs/`)

For deep-dive technical operations, deployment architectures, and post-mortem analysis, consult our comprehensive production manuals:

- [Production Deployment Guide (`docs/DEPLOYMENT_GUIDE.md`)](file:///C:/live%20channel/mirza_live_server/docs/DEPLOYMENT_GUIDE.md): Step-by-step Windows Server bare-metal setup, Windows Task Scheduler unattended startup, and Docker Compose single/multi-container orchestration.
- [Troubleshooting & Diagnostic Guide (`docs/TROUBLESHOOTING_GUIDE.md`)](file:///C:/live%20channel/mirza_live_server/docs/TROUBLESHOOTING_GUIDE.md): Resolution procedures for common runtime symptoms (`Stream freeze`, `Lockfile collisions`, `Corrupted media header`, `RTMP 403 access denied`) and structured log interpretation.
- [Automated Recovery & Self-Healing Guide (`docs/RECOVERY_GUIDE.md`)](file:///C:/live%20channel/mirza_live_server/docs/RECOVERY_GUIDE.md): Architectural deep dive into `StreamHealthMonitor` freeze traps, exponential backoff formulas ($2^{\text{attempts}} \times 2\text{s}$), atomic `config.yaml.tmp -> replace()` configuration guarantees, and post-mortem JSON crash trace evaluation.
- [Version 1 Code Review & Architectural Audit (`docs/CODE_REVIEW_v1.md`)](file:///C:/live%20channel/mirza_live_server/docs/CODE_REVIEW_v1.md): Comprehensive review report detailing architectural strengths, security hardening measures, and SOLID conformance.

---

## 🛠️ Quick Troubleshooting & Common Issues

- **`FFmpeg not found` error**: Ensure `ffmpeg.exe` is placed in your Windows `PATH` or set `MIRZA_FFMPEG_PATH=C:/ffmpeg/bin/ffmpeg.exe` in your `.env` file.
- **YouTube Stream Disconnects or Buffers**:
  - Check that `video_encoding.bitrate_kbps` does not exceed your internet upload bandwidth.
  - Verify that the frame rate (`fps`) exactly matches your source video framerate (typically `30` or `60`).
  - Check `logs/channel_main.log` for encoder dropped frames or `speed < 1.0x` warnings.
- **Windows File Path Syntax Errors**:
  - The `PlaylistManager` automatically formats Windows `C:\` paths to forward slashes (`C:/path/to/video.mp4`) inside `concat.txt` to prevent FFmpeg syntax errors. Do not manually edit temporary `concat_*.txt` files while streaming.

---

## 🗺️ Future Expansion (Version 2 Roadmap)

Version 1 is explicitly designed with clean decoupling of state and business logic so that Version 2 features can be added **without major refactoring**:
- **v2 API (`src/mirza/api/`)**: A FastAPI REST and WebSocket server querying the in-memory `Orchestrator` `StateRegistry` to provide real-time stream control and telemetry.
- **v2 Dashboard (`dashboard/`)**: A React/Next.js frontend communicating directly with the API.
- **OBS & AI Integration**: Automated dynamic overlays, scheduled metadata updates, and chat-triggered transitions.
