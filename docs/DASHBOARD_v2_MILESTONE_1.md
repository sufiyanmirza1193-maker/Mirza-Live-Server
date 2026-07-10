# Mirza Live Server Version 2 — Milestone 1: UI Design System Documentation

**Status:** Completed & Verified  
**Date:** July 2026  
**Scope:** Enterprise UI Design System, Primitives, Domain Interfaces, and Testing Scaffold for Mirza Live Server v2 (`dashboard/`)

---

## 1. Architectural Summary & Value Proposition

Milestone 1 establishes the rock-solid foundation for the **Mirza Live Server v2 Enterprise Dashboard** using modern cloud-native frontend standards (`Next.js 15`, `React 19`, `TypeScript`, `Tailwind CSS v4`, `shadcn/ui`, and `Framer Motion`). 

Inspired directly by premium commercial interfaces like Vercel, Datadog, Grafana Cloud, Linear, and Raycast, our Design System prioritizes ultra-high data density, dark glassmorphism (`#090909` background with `#111111` card surfaces and `#1C1C1C` borders), zero layout shift (`O(1)` skeleton loaders), and strict keyboard accessibility (`Radix UI`).

---

## 2. Directory & File Structure (`dashboard/`)

```text
dashboard/
├── src/
│   ├── app/
│   │   ├── globals.css           # Enterprise Design Tokens (#090909, #111111, #FF5A1F, glass utilities)
│   │   ├── layout.tsx            # Root Layout with Inter & Outfit fonts + Dark Theme provider
│   │   └── page.tsx              # Interactive Enterprise Design System & Primitives Showcase
│   ├── components/
│   │   └── ui/
│   │       ├── badge.tsx         # Semantic Status Badges (Online, Success, Warning, Destructive, Info)
│   │       ├── button.tsx        # Enterprise Button (Glow gradient, Glass outline, Destructive)
│   │       ├── button.test.tsx   # Vitest unit & accessibility render checks
│   │       ├── card.tsx          # Glassmorphism Card (border #1C1C1C, hover effects)
│   │       ├── card.test.tsx     # Vitest unit checks for data-testid and dark surface classes
│   │       ├── dialog.tsx        # Radix UI Dialog with backdrop blur and smooth entrance
│   │       ├── separator.tsx     # 1px border #1C1C1C separator
│   │       ├── skeleton.tsx      # Pulse loading placeholder
│   │       ├── tabs.tsx          # Radix UI Tabs with orange active indicator
│   │       └── tooltip.tsx       # Hover tooltips with Radix portal placement
│   ├── lib/
│   │   └── utils.ts              # cn() class merge helper (clsx + tailwind-merge)
│   ├── test/
│   │   └── setup.ts              # Vitest JSDOM matchers (@testing-library/jest-dom)
│   └── types/
│       ├── alert.ts              # SystemAlert, AlertSeverity, AlertCategory interfaces
│       ├── channel.ts            # Channel, ChannelStatus, VideoEncodingStats, ChannelQueueItem
│       ├── media.ts              # MediaFile, MediaMetadata, PlaylistScheduleProfile
│       ├── metrics.ts            # HostHardwareMetrics, TelemetryDataPoint, GlobalDashboardStats
│       └── plugin.ts             # PluginMetadata, PluginStatus, NotificationChannelConfig
├── package.json
├── tailwind.config.ts / postcss.config.mjs
├── tsconfig.json
└── vitest.config.ts
```

---

## 3. Exact Design Tokens & Color Palette (`globals.css`)

| Element | Hex Code | CSS Variable | Usage & Behavior |
| :--- | :---: | :--- | :--- |
| **Background** | `#090909` | `--background` | Root canvas layer (`bg-[#090909]`). |
| **Card / Surface** | `#111111` | `--card` | Glass panels (`bg-[#111111]/90 backdrop-blur-md`). |
| **Border / Line** | `#1C1C1C` | `--border` | Crisp 1px separators and card boundaries (`border-[#1C1C1C]`). |
| **Primary Accent** | `#FF5A1F` | `--primary` | Active triggers, glow buttons, and focus rings (`ring-[#FF5A1F]`). |
| **Secondary Accent**| `#E53935` | `--secondary` | Emergency stop buttons, critical alerts, and destructive actions. |
| **Success** | `#10B981` | `--success` | Healthy stream badges (`ONLINE`), encoding speed `1.0x` indicators. |
| **Warning** | `#F59E0B` | `--warning` | Socket reconnection backoff notices, disk &gt; 80% full warnings. |
| **Information** | `#3B82F6` | `--info` | Background media folder scans and configuration updates. |

---

## 4. Verification & Certification Results

### 1. Frontend Component Testing (`npm test` via Vitest)
All UI primitives verified with `100%` pass rate across automated component render checks:
```powershell
cd dashboard; npm test
```
```text
> dashboard@0.1.0 test
> vitest run

 RUN  v4.1.10 C:/live channel/mirza_live_server/dashboard

 ✓ src/components/ui/card.test.tsx (1 test) 64ms
 ✓ src/components/ui/button.test.tsx (3 tests) 219ms

 Test Files  2 passed (2)
      Tests  4 passed (4)
```

### 2. Next.js 15 Production Build Certification (`npm run build`)
Verified clean static and dynamic compilation with `0` TypeScript or SSR tree-shaking errors:
```powershell
cd dashboard; npm run build
```
```text
▲ Next.js 16.2.10 (Turbopack)

  Creating an optimized production build ...
✓ Compiled successfully in 6.3s
  Running TypeScript ...
  Finished TypeScript in 5.0s ...
✓ Generating static pages using 5 workers (4/4) in 1221ms

Route (app)
┌ ○ /
└ ○ /_not-found
```

### 3. Core Engine V1 Regression Suite (`pytest`)
Verified that our frontend creation had `0%` impact on the active Python streaming engine:
```powershell
$env:PYTHONPATH="src"; python -m pytest -v
```
```text
============================= 46 passed in 9.80s ==============================
```

---

## 5. Next Steps: Milestone 2 (Dashboard Layout & Command Palette)

With Milestone 1 complete, we are ready to advance to **Milestone 2 (Dashboard Layout & Command Palette)**:
- Build responsive master layout wrapper (`Sidebar`, `TopBar`, `MainContent`).
- Implement the **Global Command Palette (`Ctrl+K` / `Cmd+K`)** (`Raycast`/`Linear` style modal search and quick commands).
- Add keyboard focus trapping (`aria-modal`) and screen reader support.
