# Mirza Live Server Version 2 — Milestone 2 & Milestone 3 Documentation

**Status:** Completed & Certified  
**Date:** July 2026  
**Scope:** Dashboard Master Shell Layout (`Sidebar`, `TopBar`, `DashboardShell`), Global Command Palette (`Ctrl+K` via `cmdk`), and 11-Route Navigation Architecture (`/`, `/channels`, `/streams`, `/playlists`, `/media`, `/scheduler`, `/analytics`, `/plugins`, `/logs`, `/notifications`, `/settings`)

---

## 1. Architectural Summary & Scope

Milestones 2 and 3 transform the Milestone 1 primitive design system into a complete, navigable enterprise cloud application shell. Inspired directly by Linear and Raycast, the master structural layout features:
- **Responsive Navigation Sidebar (`md:w-64 fixed`)**: Organizes 11 domain routes under 4 logical operational headers (`OPERATIONS`, `CONTENT`, `INTEGRATIONS`, `SYSTEM`).
- **Global Command Palette (`Ctrl+K` / `⌘K`)**: Powered by `cmdk` inside a dark glassmorphic Radix Dialog, providing instant fuzzy search across all pages, broadcast actions (`Start Channel Broadcast`, `Restart FFmpeg`), and system preferences.
- **Top Navigation Bar (`sticky top-0 z-20`)**: Features dynamic breadcrumb formatting, mobile drawer triggers (`Sheet`), real-time WebSocket telemetry latency indicators (`WS: 2ms`), and emergency control triggers.

---

## 2. All 11 Navigation Routes Implemented & Certified

Every required navigation route in Mirza Live Server v2 has been created as an active Next.js 15 App Router page wrapped inside `DashboardShell`:

| Route | Page File | Section | Key Features & Metrics Displayed |
| :--- | :--- | :--- | :--- |
| **Dashboard** (`/`) | `src/app/page.tsx` | OPERATIONS | 4 KPI cards (`Active Channels`, `Total Bitrate`, `Encoding Speed`, `Server Uptime`), active worker cards, and host CPU/RAM bars. |
| **Channels** (`/channels`) | `src/app/channels/page.tsx` | OPERATIONS | Multi-channel worker orchestration cards (`channel_main`, `channel_secondary`), restart/configure/stop actions. |
| **Live Streams** (`/streams`) | `src/app/streams/page.tsx` | OPERATIONS | Real-time FFmpeg stderr progress parsing (`30.0 FPS`, `4,512 kbps CBR`, `1.00x speed`), GOP sync status chart. |
| **Playlists** (`/playlists`) | `src/app/playlists/page.tsx` | CONTENT | Looping schedule queue (`ep_101...`, `ep_102...`), Windows concat syntax builder (`file 'C:/path...'`). |
| **Media Library** (`/media`) | `src/app/media/page.tsx` | CONTENT | Automated `ffprobe` inspection reports (`VALID` vs `CORRUPT` header detection), resolution & codec details. |
| **Scheduler** (`/scheduler`) | `src/app/scheduler/page.tsx` | CONTENT | Cron rotation schedules (`0 8 * * *`, `0 22 * * *`), target playlist folder bindings. |
| **Analytics** (`/analytics`) | `src/app/analytics/page.tsx` | INTEGRATIONS | YouTube Live API concurrency tracking (`1,420 viewers`), 30-day watch time (`142,890 hrs`), 24h activity chart. |
| **Plugins** (`/plugins`) | `src/app/plugins/page.tsx` | INTEGRATIONS | Event hook manager (`on_error`, `on_restart`), Discord/Telegram notification webhooks. |
| **Logs** (`/logs`) | `src/app/logs/page.tsx` | SYSTEM | Real-time tailing of `logs/channel_main.log`, process-isolated event streams, filter/export tools. |
| **Notifications** (`/notifications`)| `src/app/notifications/page.tsx`| SYSTEM | Audit log of hardware warnings (`Corrupted Media Auto-Skipped`), instance lock confirmations (`mirza.lock`). |
| **Settings** (`/settings`) | `src/app/settings/page.tsx` | SYSTEM | Global video/audio CBR boundary inputs (`4500 kbps`), supervisor exponential backoff limits (`2^n`). |

---

## 3. Verification & Certification Results

### 1. Component & Layout Unit Testing (`npm test` via Vitest)
All navigation and command components verified with `100%` pass rate across automated render and interaction checks:
```powershell
cd dashboard; npm test
```
```text
> dashboard@0.1.0 test
> vitest run

 RUN  v4.1.10 C:/live channel/mirza_live_server/dashboard

 ✓ src/components/ui/card.test.tsx (1 test)
 ✓ src/components/ui/button.test.tsx (3 tests)
 ✓ src/components/layout/sidebar.test.tsx (3 tests)
     ✓ renders section headers accurately
     ✓ renders all 11 required navigation links with proper href attributes
     ✓ highlights the active route based on usePathname
 ✓ src/components/layout/command-palette.test.tsx (2 tests)
     ✓ renders quick search trigger button with ⌘K badge
     ✓ opens dialog when trigger button is clicked and displays command groups

 Test Files  4 passed (4)
      Tests  9 passed (9)
```

### 2. Next.js 15 Production Multi-Route Build Certification (`npm run build`)
Verified clean static compilation across all 11 pages with `0` TypeScript or SSR errors:
```powershell
cd dashboard; npm run build
```
```text
▲ Next.js 16.2.10 (Turbopack)
✓ Compiled successfully in 7.3s
✓ Generating static pages using 7 workers (14/14) in 1074ms

Route (app)
┌ ○ /
├ ○ /_not-found
├ ○ /analytics
├ ○ /channels
├ ○ /logs
├ ○ /media
├ ○ /notifications
├ ○ /playlists
├ ○ /plugins
├ ○ /scheduler
├ ○ /settings
└ ○ /streams
```

### 3. Core Engine V1 Regression Suite (`pytest`)
Verified `0%` impact on active Python orchestrator (`main.py`, `models.py`, `worker.py`):
```powershell
$env:PYTHONPATH="src"; python -m pytest -v
```
```text
============================= 46 passed in 9.03s ==============================
```
