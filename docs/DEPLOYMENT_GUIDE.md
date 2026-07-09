# Mirza Live Server — Production Deployment Guide

This guide provides step-by-step instructions for deploying **Mirza Live Server** (`v1.0.0`) in a high-availability, 24/7 production environment on **Windows Server / Windows 10/11** and **Docker / Linux container orchestration systems**.

---

## 1. System & Hardware Requirements

To ensure zero frame drops, consistent GOP pacing, and reliable real-time H.264/AAC encoding, verify your host meets or exceeds the following minimum requirements:

| Component | Minimum Specification | Recommended Production Spec (2–4 Channels) |
| :--- | :--- | :--- |
| **CPU** | 2 Cores (x86_64, 2.0+ GHz) | 4–8 Cores (Intel Xeon / AMD Ryzen with NVENC/QSV support) |
| **RAM** | 4 GB | 8–16 GB |
| **Disk** | 20 GB free (SSD required) | 100+ GB NVMe SSD (`> 2.0 GB` safety margin enforced by `doctor`) |
| **Network** | Dedicated 10 Mbps Upstream | Dedicated 100+ Mbps Fiber Upstream (Low latency to YouTube RTMP ingest) |
| **OS** | Windows 10 / Windows Server 2019 | Windows 11 / Windows Server 2022 / Ubuntu 22.04 LTS (Docker) |

---

## 2. Windows Bare-Metal Production Deployment

### Step 2.1: Install Python 3.12+ and FFmpeg 6.0+

1. **Install Python 3.12+**: Ensure `python.exe` and `pip.exe` are added to your system `PATH`.
2. **Install FFmpeg via Winget (Recommended)**:
   ```powershell
   winget install --id=Gyan.FFmpeg -e
   ```
   *Alternative via Chocolatey*:
   ```powershell
   choco install ffmpeg
   ```
3. **Verify Binaries**: Open PowerShell and confirm both tools are accessible:
   ```powershell
   python --version
   ffmpeg -version
   ffprobe -version
   ```

### Step 2.2: Clone Repository & Create Virtual Environment

1. Clone or copy the **Mirza Live Server** release artifact to `C:\live_channel\mirza_live_server`.
2. Create and activate an isolated Python virtual environment:
   ```powershell
   cd C:\live_channel\mirza_live_server
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   ```
3. Install dependencies in editable/production mode:
   ```powershell
   pip install --upgrade pip
   pip install -e .
   ```

### Step 2.3: Configure `config.yaml` & `.env` Secrets

Never hardcode raw YouTube stream keys directly inside `config.yaml`. Instead, use environment variable substitution (`${VAR_NAME}`):

1. Copy the example environment file:
   ```powershell
   copy .env.example .env
   ```
2. Edit `.env` and insert your actual YouTube live ingestion keys:
   ```env
   YOUTUBE_MAIN_KEY=xxxx-xxxx-xxxx-xxxx-xxxx
   YOUTUBE_GAMING_KEY=yyyy-yyyy-yyyy-yyyy-yyyy
   ```
3. Verify your `config.yaml` references these environment variables cleanly:
   ```yaml
   server:
     log_level: INFO
     monitoring:
       cpu_max_percent: 85.0
       ram_max_percent: 85.0

   channels:
     - channel_id: channel_main
       name: "Mirza Main 24/7 Radio"
       enabled: true
       stream_key: "${YOUTUBE_MAIN_KEY}"
       media_folder: "C:/live_channel/media/main"
       video_encoding:
         fps: 30
         resolution: "1920x1080"
         bitrate: "4500k"
         audio_bitrate: "160k"
       playlist_settings:
         loop: true
         shuffle: true
   ```

### Step 2.4: Run Production Diagnostics (`doctor`)

Before launching live streams, run the built-in diagnostic tool to verify directory permissions, FFmpeg codec support, environment variables, and disk space limits:

```powershell
python main.py doctor
```

If the health check passes with zero errors (`All diagnostic checks passed!`), proceed to launch.

### Step 2.5: Launch Server

To run synchronously inside your terminal session:
```powershell
python main.py start
```
*Note: The server automatically acquires a single-instance lock file (`logs/mirza.lock`) to prevent accidental multi-instance startup collisions.*

---

## 3. Windows Task Scheduler — Unattended Startup Setup

To ensure **Mirza Live Server** starts automatically when Windows boots up—and automatically recovers if the host server reboots—configure a Windows Task Scheduler job using the generated `run_mirza.bat` wrapper or PowerShell:

1. Open PowerShell as **Administrator**.
2. Execute the following task registration command:
   ```powershell
   $Action = New-ScheduledTaskAction -Execute "C:\live_channel\mirza_live_server\venv\Scripts\python.exe" -Argument "main.py start" -WorkingDirectory "C:\live_channel\mirza_live_server"
   $Trigger = New-ScheduledTaskTrigger -AtStartup
   $Principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest
   $Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -ExecutionTimeLimit 0 -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 1)
   
   Register-ScheduledTask -TaskName "MirzaLiveServer24x7" -Action $Action -Trigger $Trigger -Principal $Principal -Settings $Settings -Description "Mirza Live Server 24/7 Automated YouTube Streaming Daemon"
   ```
3. Start the service immediately without rebooting:
   ```powershell
   Start-ScheduledTask -TaskName "MirzaLiveServer24x7"
   ```

---

## 4. Docker & Container Production Deployment

For Linux container orchestration environments, **Mirza Live Server** ships with a multi-stage production Docker image and `docker-compose.yml`.

### Step 4.1: Directory & Volume Setup
Ensure host media folders exist and contain valid `.mp4` / `.mkv` video files:
```bash
mkdir -p ./media/main ./logs ./crash_reports ./playlists
```

### Step 4.2: `docker-compose.yml` Configuration
Create a production `docker-compose.yml`:
```yaml
version: '3.8'

services:
  mirza-server:
    build: .
    image: mirza-live-server:v1.0.0
    container_name: mirza-live-daemon
    restart: unless-stopped
    environment:
      - YOUTUBE_MAIN_KEY=${YOUTUBE_MAIN_KEY}
    volumes:
      - ./config.yaml:/app/config.yaml:ro
      - ./media:/app/media:ro
      - ./logs:/app/logs:rw
      - ./playlists:/app/playlists:rw
      - ./crash_reports:/app/crash_reports:rw
    deploy:
      resources:
        limits:
          cpus: '4.0'
          memory: 8G
        reservations:
          cpus: '1.0'
          memory: 2G
```

### Step 4.3: Launch Container Stack
Run the container daemon in background detached mode:
```bash
docker compose up -d --build
```
Inspect structured telemetry logs:
```bash
docker compose logs -f mirza-server
```
