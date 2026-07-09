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

Mirza Live Server provides three clean CLI subcommands:

### Validate Configuration
Check that `config.yaml` is valid, environment variables are set, `ffmpeg` is installed, and media files exist:
```powershell
python main.py validate
```

### Start Livestream Server
Start all enabled channels defined in `config.yaml`:
```powershell
python main.py start
```

Start a single specific channel by ID:
```powershell
python main.py start --channel channel_main
```

### Check Status
View running channels, uptime, memory/CPU consumption, and auto-restart counts:
```powershell
python main.py status
```

---

## 🛠️ Troubleshooting & Common Issues

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
