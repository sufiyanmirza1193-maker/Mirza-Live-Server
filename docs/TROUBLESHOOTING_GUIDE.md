# Mirza Live Server — Troubleshooting & Diagnostic Guide

This document outlines resolution procedures, diagnostic commands, and log interpretation workflows for troubleshooting operational anomalies during 24/7 continuous livestreaming.

---

## Quick Diagnostic Command (`doctor`)

Whenever you encounter unexpected behavior, startup failures, or media drops, execute the diagnostic suite first:

```powershell
python main.py doctor
```

### What `doctor` Checks:
1. **FFmpeg & FFprobe Availability**: Verifies `ffmpeg.exe` and `ffprobe.exe` are on `PATH` and executable.
2. **Directory Read/Write/Execute Permissions**: Confirms `logs/`, `playlists/`, `crash_reports/`, and configured media directories (`media_folder`) have proper OS permissions.
3. **Low Disk Space Safety Threshold (`> 2.0 GB`)**: Checks that the host drive housing `logs/` and `playlists/` has at least 2.0 GB of available storage. If disk space drops below 2.0 GB, `doctor` flags a critical error to prevent system hang or corrupted `concat` files.
4. **Environment Variables**: Confirms that all `${ENV_VAR}` references inside `config.yaml` are defined in `.env` or system environment variables.

---

## Common Error Symptoms & Resolutions

### 1. Stream Freeze / Connection Reset by Peer

**Symptom**:
Log file (`logs/channel_main.log`) reports:
```text
[StreamHealth] NETWORK INTERRUPTION DETECTED on 'channel_main': [rtmp @ 0x...] WSAGetLastError: 10054 Connection reset by peer
-- OR --
[StreamHealth] FREEZE DETECTED on 'channel_main': No frame updates received for 16.2 seconds!
```

**Root Cause**:
The upstream Internet connection experienced temporary packet loss, or YouTube's RTMP ingestion endpoint dropped the TCP connection due to transient network congestion or GOP/framerate jitter.

**Automated Recovery & Resolution**:
- **What Mirza Does Automatically**: `StreamHealthMonitor` detects the freeze/connection drop within `15.0` seconds (`freeze_timeout_seconds`), kills the stale `ffmpeg` child process via `psutil` process tree cleanup, and initiates an **exponential backoff restart loop** (`2s -> 4s -> 8s -> ... -> 60s max`).
- **Operator Action**:
  1. Check network connectivity (`ping rtmp.a.rtmp.youtube.com`).
  2. If the freeze repeats continuously every few minutes, inspect `logs/channel_main_ffmpeg.log` for encoder slowdown warnings (`speed=0.65x`).
  3. If encoding speed is below `0.95x`, your host CPU is overloaded. Reduce target video resolution (`1920x1080` -> `1280x720`) or target bitrate (`4500k` -> `3000k`) in `config.yaml`.

---

### 2. Lockfile Collision (`InstanceAlreadyRunningError`)

**Symptom**:
Attempting to start the server fails immediately with:
```text
mirza.engine.lock.InstanceAlreadyRunningError: Another instance of Mirza Live Server is already running. Active instance detected (PID: 12344) holding lock file: C:\live_channel\mirza_live_server\logs\mirza.lock
```

**Root Cause**:
An old `python.exe` process is still running in the background, or a previous system crash left an orphaned handle on `mirza.lock` (though the file lock uses OS-level file locking which auto-releases on true process death).

**Resolution**:
1. Check running Python/FFmpeg processes in Task Manager or PowerShell:
   ```powershell
   Get-Process python, ffmpeg -ErrorAction SilentlyContinue
   ```
2. Terminate any orphaned background worker processes:
   ```powershell
   Stop-Process -Name python, ffmpeg -Force -ErrorAction SilentlyContinue
   ```
3. If no processes exist, safely remove the stale lockfile:
   ```powershell
   Remove-Item logs\mirza.lock -Force -ErrorAction SilentlyContinue
   ```

---

### 3. Media File Skipped / Corrupted Container Warning

**Symptom**:
`logs/server.log` shows:
```text
WARNING | [Session: a1b2c3d4] [Channel: channel_main] | Skipping corrupted or invalid media 'broken_clip.mp4': Corrupted container or unreadable header (ffprobe exit 1)
```

**Root Cause**:
`MediaValidator` scanned the media folder using `ffprobe` and detected that `broken_clip.mp4` has a missing header, incomplete download (`.crdownload`), or unsupported video stream codec (not H.264/HEVC/VP9).

**Resolution**:
- **No immediate action required**: Mirza automatically quarantines/skips corrupted files and builds the playlist `concat` list exclusively with valid videos so the stream never crashes.
- To clean up your folder, run `ffprobe` manually on the reported file to inspect the exact container error:
  ```powershell
  ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 media\main\broken_clip.mp4
  ```

---

### 4. YouTube RTMP Authentication Error / Invalid Stream Key

**Symptom**:
`logs/channel_main_ffmpeg.log` displays:
```text
[rtmp @ 0x...] Server returned 403 Forbidden (access denied)
-- OR --
[rtmp @ 0x...] RTMP_Connect0, failed to connect socket.
```

**Root Cause**:
The configured YouTube stream key is expired, revoked, or formatted incorrectly with extra whitespace or quotes.

**Resolution**:
1. Open YouTube Studio -> **Live Control Room**.
2. Reset/generate a new **Default Stream Key**.
3. Update your `.env` file (`YOUTUBE_MAIN_KEY=new_key_here`) without trailing spaces or quotation marks.
4. Restart the server:
   ```powershell
   python main.py start
   ```

---

## Log Interpretation & Trace Anatomy

Every log line in **Mirza Live Server** (`v1.0.0+`) is enriched with structured context headers (`MirzaContextFilter`) to enable trace correlation across concurrent channels and background threads:

```text
2026-07-09 17:12:44.102 | INFO     | [Session: e8a1f9c0] [Channel: channel_main] | mirza.supervisor | Supervisor initialized for channel: channel_main
```

### Header Breakdown:
- **`2026-07-09 17:12:44.102`**: Precise millisecond timestamp (`_DATE_FORMAT`).
- **`INFO`**: Severity level (`DEBUG`, `INFO`, `WARNING`, `ERROR`, `CRITICAL`).
- **`[Session: e8a1f9c0]`**: 8-character hex unique session ID generated when `python main.py` boots. Use this ID to filter logs from a specific server run.
- **`[Channel: channel_main]`**: Target channel context (`[System]` for master orchestrator / CLI tasks).
- **`mirza.supervisor`**: Python logger namespace and component origin.
