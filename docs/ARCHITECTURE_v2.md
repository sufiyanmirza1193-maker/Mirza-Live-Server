# Mirza Live Server — Version 2.0 Architectural Blueprint

**Document Version:** 2.0.0-draft  
**Target Release Date:** Q4 2026  
**Author:** Lead Software Architect & Principal Systems Engineer  
**Scope:** Architecture Specification & Implementation Roadmap for **Mirza Live Server v2 (YouTube Automation Platform)**

---

## 1. System Overview & Core Value Proposition

While **Version 1 (`v1.0.0`)** provides a rock-solid, zero-downtime, single-node continuous streaming engine (`Orchestrator` + `ChannelSupervisor` + `FFmpeg`), **Version 2 (`v2.0.0`)** evolves Mirza into a comprehensive, cloud-ready **YouTube Automation & Multi-Channel Management Platform**.

Version 2 builds directly on the clean domain models (`AppConfig`, `ChannelConfig`, `StreamHealthMetrics`) and state registry (`Orchestrator`) of Version 1 without breaking changes. By wrapping the core engine in an asynchronous REST & WebSocket API and introducing modular worker isolation, scheduling, and plugin hooks, v2 enables operators to manage dozens of automated 24/7 channels from a centralized Web Dashboard.

```mermaid
graph TB
    subgraph Frontend["Dashboard Layer (dashboard/)"]
        UI[Next.js 14 / React Web Dashboard]
        Charts[Real-Time FPS/Bitrate Charts]
        PlaylistEditor[Drag & Drop Playlist Builder]
    end

    subgraph API["API Layer (src/mirza/api/)"]
        FastAPI[FastAPI REST Server]
        WebSocket[WebSocket Telemetry Hub (/ws)]
        Auth[JWT / API Key RBAC Auth]
    end

    subgraph Core["Core Orchestration Layer (src/mirza/engine/)"]
        Orchestrator[V1 Orchestrator & State Registry]
        Scheduler[V2 Cron Scheduler Engine]
        PluginBus[Event-Driven Plugin Event Bus]
    end

    subgraph Workers["Worker Subsystem (Multi-Channel Isolation)"]
        W1[Channel Worker Process: channel_main]
        W2[Channel Worker Process: channel_gaming]
        Wn[Channel Worker Process: channel_n...]
    end

    subgraph Telemetry["Observability & Storage Layer"]
        Prometheus[Prometheus Metrics Exporter (/metrics)]
        Redis[Redis State & Pub/Sub Cache]
        ConfigStore[YAML / Database Configuration]
    end

    UI <-->|HTTP REST / JWT| FastAPI
    UI <-->|WebSocket Stream| WebSocket
    FastAPI --> Orchestrator
    WebSocket <--> PluginBus
    Orchestrator <--> Scheduler
    Orchestrator <--> PluginBus
    Orchestrator --> W1 & W2 & Wn
    W1 & W2 & Wn -->|Telemetry Stderr| Prometheus
    Orchestrator <--> Redis
```

---

## 2. Web Dashboard Architecture (`dashboard/`)

Version 2 ships with a modern, responsive single-page web dashboard built using **Next.js 14 (App Router)**, **React**, **TypeScript**, and **TailwindCSS** (or **Vite + React 18** for lightweight self-hosted setups).

### 2.1 Core UI Modules & Capabilities
1. **Global Fleet Overview Card Matrix**:
   - Real-time status cards for every registered channel (`ONLINE`, `BACKOFF`, `OFFLINE`, `STALLED`).
   - One-click action buttons: **Launch**, **Stop**, **Force Restart**, and **Emergency Kill**.
2. **Live Telemetry & Health Graphing**:
   - High-refresh (1 Hz) interactive charts rendered via **Recharts / Chart.js** displaying live FPS (`30.0 / 60.0`), encoding bitrate (`kbits/s`), and CPU/RAM consumption per channel.
3. **Interactive Drag-and-Drop Playlist Builder**:
   - Visual media grid showing video thumbnails, exact duration, codec metadata, and validation status (`ffprobe`).
   - Drag-and-drop re-ordering (`react-beautiful-dnd`) that instantly updates `concat.txt` and triggers a clean transition at the next video boundary.
4. **Post-Mortem Crash Inspector**:
   - Interactive viewer for `crash_reports/*.json`. Shows full stack traces, system overload indicators (`is_cpu_overloaded`), and the exact 15-line FFmpeg stderr tail leading up to any failure.

---

## 3. Async REST & WebSocket API Specification (`src/mirza/api/`)

The core Python engine will embed an **asyncio FastAPI** application running on Uvicorn (`src/mirza/api/server.py`).

### 3.1 REST API Endpoints (OpenAPI / Swagger Schema)

| HTTP Method | Endpoint Path | Description | Required Role |
| :---: | :--- | :--- | :---: |
| **GET** | `/api/v2/channels` | List all channel configurations, live status, and active metrics | `VIEWER` |
| **POST** | `/api/v2/channels/{id}/start` | Launch the supervisor and FFmpeg process for channel `{id}` | `OPERATOR` |
| **POST** | `/api/v2/channels/{id}/stop` | Gracefully stop streaming (`SIGTERM` -> `SIGKILL`) | `OPERATOR` |
| **POST** | `/api/v2/channels/{id}/restart` | Initiate a clean channel restart (e.g., after config change) | `OPERATOR` |
| **GET** | `/api/v2/channels/{id}/playlist` | Get the current ordered playlist queue and active playing item | `VIEWER` |
| **PUT** | `/api/v2/channels/{id}/playlist` | Replace or re-order playlist sequence dynamically | `EDITOR` |
| **POST** | `/api/v2/channels/{id}/media/scan` | Force an immediate folder re-scan (`MediaDetector.scan(force=True)`) | `EDITOR` |
| **GET** | `/api/v2/health/system` | Return hardware CPU/RAM snapshot (`SystemMetrics`) | `VIEWER` |
| **GET** | `/api/v2/reports/crashes` | Paginated listing of all historical crash diagnostic reports | `VIEWER` |

### 3.2 Authentication & Security Middleware
- **JWT Bearer Token Authentication**: Users authenticate via `/api/v2/auth/login` to obtain short-lived access tokens (`15m`) and secure HTTP-only refresh tokens (`7d`).
- **API Key Machine-to-Machine Auth**: Automated CI/CD pipelines or external bots can authenticate using `X-API-Key` headers tied to specific RBAC roles (`VIEWER`, `EDITOR`, `OPERATOR`, `ADMIN`).

---

## 4. Automated Scheduler Engine (`src/mirza/scheduler/`)

To transform from a static loop server into a 24/7 automated broadcasting network, v2 introduces `MirzaScheduler` built atop `APScheduler` (`AsyncIOScheduler`).

### 4.1 Scheduled Playback Transitions
Operators can define time-based schedule profiles in `config.yaml` or via the API:
```yaml
channels:
  - channel_id: channel_main
    name: "Mirza 24/7 Automated Network"
    schedule:
      - cron: "0 6 * * *"
        name: "Morning Ambient Lo-Fi"
        playlist_folder: "media/morning"
        settings: { shuffle: true, loop: true }
        youtube_metadata:
          title: "\ud83c\udf05 Morning Lo-Fi Beats To Chill / Study To [24/7 Radio]"
          description: "Start your day with relaxing ambient lo-fi music."
      
      - cron: "0 14 * * *"
        name: "Afternoon High-Energy Gameplay"
        playlist_folder: "media/gameplay"
        settings: { shuffle: false, loop: true }
        youtube_metadata:
          title: "\ud83c\udfae 4K Ultra Gameplay Lounge [24/7 Stream]"
```

### 4.2 Automated YouTube API v3 Metadata Sync
When a cron transition fires, `Scheduler` calls the **YouTube Data API v3 (`liveBroadcasts.update`)** to automatically update the livestream's public Title, Description, and Tags without breaking or restarting the underlying RTMP connection.

---

## 5. Multi-Channel Isolation & Worker Scale-Out

In Version 1, `Orchestrator` runs all `ChannelSupervisor` instances inside the same asyncio event loop. In Version 2, high-density environments (e.g., 10–50 concurrent channels per host) will utilize **Worker Subsystem Isolation (`src/mirza/engine/worker.py`)**:

1. **Subprocess / IPC Worker Architecture**: Each `ChannelSupervisor` runs inside an isolated OS process spawned via `multiprocessing` or `asyncio.create_subprocess_exec`.
2. **Zero Blast Radius**: If a third-party C-library codec inside FFmpeg corrupts shared kernel memory or consumes 100% of a CPU core, only that isolated worker process is affected. The master API server (`Orchestrator`) and other active channels continue broadcasting with zero interruption.
3. **IPC Command Queue**: The master `Orchestrator` communicates with isolated workers via high-speed Unix Domain Sockets (POSIX) or Named Pipes (Windows) using structured JSON-RPC messages (`START_STREAM`, `STOP_STREAM`, `REFRESH_PLAYLIST`, `PING_HEALTH`).

---

## 6. Plugin Extension Architecture (`mirza.plugins.*`)

To enable third-party integrations without modifying core source code, v2 introduces an event-driven **Plugin Bus (`src/mirza/plugins/`)**.

### 6.1 Abstract Base Class (`PluginInterface`)
```python
from abc import ABC, abstractmethod
from typing import Any, Dict
from mirza.monitor.health import StreamHealthMetrics
from mirza.playlist.item import MediaItem


class PluginInterface(ABC):
    """Formal contract for Mirza Live Server v2 plugins."""

    @property
    @abstractmethod
    def plugin_name(self) -> str:
        """Unique plugin identifier (e.g., 'discord_notifier')."""
        pass

    async def on_server_boot(self, config: Dict[str, Any]) -> None:
        """Triggered once when the master orchestrator initializes."""
        pass

    async def on_channel_start(self, channel_id: str) -> None:
        """Triggered whenever a channel livestream begins or recovers."""
        pass

    async def on_playlist_item_change(self, channel_id: str, new_item: MediaItem) -> None:
        """Triggered right before FFmpeg transitions to a new video clip."""
        pass

    async def on_telemetry_sample(self, channel_id: str, metrics: StreamHealthMetrics) -> None:
        """Triggered once per second with real-time FFmpeg encoding telemetry."""
        pass

    async def on_stream_freeze(self, channel_id: str, reason: str) -> None:
        """Triggered immediately when StreamHealthMonitor flags a freeze or network drop."""
        pass
```

### 6.2 Official Flagship Plugins (Included in v2)
- **`mirza.plugins.discord_notifications`**: Automatically sends rich Discord webhooks (`Embeds`) when a stream starts, crashes, enters backoff, or when CPU/RAM crosses safety limits.
- **`mirza.plugins.obs_remote_control`**: Connects via `obs-websocket-py` to trigger scene transitions, update text sources (now playing track names), or toggle lower thirds when `on_playlist_item_change` fires.
- **`mirza.plugins.watermark_generator`**: Dynamically injects an FFmpeg `overlay` filter across videos to stamp channel logos or dynamic clocks.

---

## 7. Observability, Telemetry & Prometheus Metrics (`src/mirza/metrics/`)

To support cloud-native observability stacks, v2 implements a native **Prometheus Metrics Exporter** available at `/metrics`:

### 7.1 Exported Prometheus Gauges & Counters
```text
# HELP mirza_channel_fps Current encoding framerate (frames per second)
# TYPE mirza_channel_fps gauge
mirza_channel_fps{channel_id="channel_main"} 30.0

# HELP mirza_channel_bitrate_kbps Current output stream bitrate in kbits/s
# TYPE mirza_channel_bitrate_kbps gauge
mirza_channel_bitrate_kbps{channel_id="channel_main"} 4500.0

# HELP mirza_channel_speed_multiplier Encoding speed ratio relative to real-time (1.0x)
# TYPE mirza_channel_speed_multiplier gauge
mirza_channel_speed_multiplier{channel_id="channel_main"} 1.01

# HELP mirza_stream_restarts_total Cumulative number of automated crash recoveries
# TYPE mirza_stream_restarts_total counter
mirza_stream_restarts_total{channel_id="channel_main",reason="NETWORK_INTERRUPTION"} 2

# HELP mirza_system_cpu_percent Host CPU utilization percentage
# TYPE mirza_system_cpu_percent gauge
mirza_system_cpu_percent 14.5
```

### 7.2 Grafana Dashboard Template (`docs/grafana/mirza_dashboard.json`)
A pre-built Grafana JSON dashboard will be shipped, featuring multi-channel comparison tiles, bitrate deviation alerts, and historical uptime tracking.

---

## 8. Real-Time WebSocket Signaling Protocol (`/ws/telemetry`)

The web dashboard and external monitoring bots connect to `/ws/telemetry` via bi-directional WebSockets.

### 8.1 JSON Signaling Envelope Schema
```json
{
  "$schema": "https://mirza-server.io/schemas/v2/websocket_envelope.json",
  "event_id": "c9e8d7f6-5a4b-3c2d-1e0f-9a8b7c6d5e4f",
  "event_type": "TELEMETRY_UPDATE",
  "timestamp": "2026-07-09T17:15:00.000Z",
  "channel_id": "channel_main",
  "payload": {
    "frame": 12450,
    "fps": 30.0,
    "bitrate_kbps": 4501.2,
    "speed_multiplier": 1.00,
    "is_healthy": true,
    "is_frozen": false
  }
}
```

### 8.2 Supported Event Types:
- `CLIENT_SUBSCRIBE`: Sent by client upon connection to filter updates for specific `channel_id` targets.
- `TELEMETRY_UPDATE`: Emitted every 1,000ms with fresh `StreamHealthMetrics`.
- `STATE_TRANSITION`: Emitted whenever `Orchestrator` changes state (`STARTING`, `RUNNING`, `RECOVERING`, `STOPPED`).
- `PLAYLIST_REFRESHED`: Emitted when `MediaDetector` spots new files or `Scheduler` transitions playlists.
- `ALERT_CRITICAL`: High-priority alert triggered by disk exhaustion (`< 2 GB`) or CPU starvation (`> 90%`).

---

## 9. Enterprise Security & Compliance Hardening

As an internet-facing production daemon, v2 enforces strict enterprise security boundaries:
1. **Role-Based Access Control (RBAC)**: Fine-grained permissions matrix separating `VIEWER` (read-only charts), `EDITOR` (playlist re-ordering), `OPERATOR` (start/stop channels), and `ADMIN` (API key issuance and system configuration).
2. **Rate Limiting & DDoS Protection**: All API endpoints enforce token-bucket rate limiting via **SlowAPI** (`100 req/minute` per IP for read queries, `10 req/minute` for process start/stop actions).
3. **Zero-Trust Secret Handling**: In addition to `.env` resolution, v2 supports direct integration with **HashiCorp Vault** and **AWS Secrets Manager** to fetch temporary RTMP tokens dynamically into RAM without ever writing them to disk.
4. **Audit Logging (`logs/audit.log`)**: Every control action executed via the API or CLI is permanently logged with user identity, source IP, exact timestamp, and parameter payload.

---

## 10. Multi-Node & Kubernetes / Docker Compose Deployment Topology

For high-availability enterprise networks streaming dozens of concurrent channels across cloud infrastructure (AWS/GCP/Azure), Version 2 supports multi-node clustering:

```mermaid
graph LR
    subgraph Edge["Ingress & Edge Traffic"]
        Client[Operator Web Dashboard]
        APIClient[REST / CI/CD Automation]
        Ingress[Traefik / Nginx Reverse Proxy (SSL / TLS termination)]
    end

    subgraph Cluster["Mirza v2 Kubernetes Cluster / Docker Stack"]
        Master[Mirza API & Orchestrator Node (FastAPI)]
        Redis[(Redis Pub/Sub & State Cache)]
        WorkerPod1[Worker Pod 1: Channels 1–5]
        WorkerPod2[Worker Pod 2: Channels 6–10]
        WorkerPodN[Worker Pod N: Channels 11–15]
    end

    subgraph Monitoring["Observability Stack"]
        Prometheus[Prometheus Server]
        Grafana[Grafana Dashboards]
    end

    subgraph Storage["Shared Network Storage"]
        NFS[(NFS / AWS EFS Media & Playlists Volume)]
    end

    Client & APIClient -->|HTTPS / WSS| Ingress
    Ingress --> Master
    Master <-->|Task Distribution| Redis
    Redis <--> WorkerPod1 & WorkerPod2 & WorkerPodN
    WorkerPod1 & WorkerPod2 & WorkerPodN <-->|Read Video Files| NFS
    WorkerPod1 & WorkerPod2 & WorkerPodN -->|Prometheus Scrape| Prometheus
    Prometheus --> Grafana
```

---

## 11. Migration Roadmap (From Version 1 to Version 2)

Transitioning from `v1.0.0` to `v2.0.0` is designed to be **100% backward compatible** and zero-downtime:
1. **Zero Schema Breaking Changes**: Any existing `config.yaml` from v1.0.0 will load seamlessly into v2.0.0 (`AppConfig` remains the foundation).
2. **Progressive Enhancement**: If no API tokens or dashboard configurations are defined, `python main.py start` runs in **Headless V1 Compatibility Mode** exactly as before.
3. **Gradual Worker Enablement**: Operators can enable worker isolation per-channel (`worker_mode: isolated`) while keeping simple channels on standard threading.

---

## Summary of Deliverables & Timeline
- **Phase 2.1 (API Foundation)**: Implement `src/mirza/api/` with FastAPI, JWT auth, and basic channel control REST endpoints.
- **Phase 2.2 (WebSocket & Signaling)**: Build `/ws/telemetry` signaling protocol and `PluginBus` event dispatching.
- **Phase 2.3 (Web Dashboard)**: Build Next.js dashboard UI (`dashboard/`) with Recharts graphs and drag-and-drop playlist management.
- **Phase 2.4 (Scheduler & Worker Isolation)**: Implement `MirzaScheduler` (`APScheduler`) and multi-process worker pool (`worker.py`).
- **Phase 2.5 (GA Verification & Release)**: End-to-end stress testing across 50 simulated concurrent worker channels and v2.0.0 release.
