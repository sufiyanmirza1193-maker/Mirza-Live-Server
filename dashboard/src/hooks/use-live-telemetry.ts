"use client"

import * as React from "react"

export interface TelemetryPoint {
  time: string
  bitrate: number
  fps: number
  dropped: number
  cpu: number
  ram: number
  gpu: number
  disk: number
  networkIn: number
  networkOut: number
  temperature: number
  workerLoad: number
  playlistProgress: number
}

export interface ActivityItem {
  id: string
  type: "RESTART" | "PLAYLIST" | "MEDIA" | "BACKUP" | "PLUGIN" | "CHANNEL" | "RECOVERY"
  title: string
  description: string
  timestamp: string
  status: "success" | "warning" | "info" | "destructive"
}

export interface AlertItem {
  id: string
  level: "CRITICAL" | "WARNING" | "INFORMATION" | "RESOLVED"
  title: string
  message: string
  time: string
  workerId?: string
}

export function useLiveTelemetry(maxPoints: number = 30) {
  const [data, setData] = React.useState<TelemetryPoint[]>([])
  const [connected, setConnected] = React.useState(false)
  const [lastUpdated, setLastUpdated] = React.useState<Date>(new Date())

  // Dynamic system health snapshot
  const [systemHealth, setSystemHealth] = React.useState({
    cpu: 24.2,
    ram: 13.1,
    gpu: 18.4,
    disk: 58.2,
    temperature: 48.5,
    networkSpeed: 45.2,
    uptimeSec: 3679800, // ~42d 14h
    healthScore: 100,
  })

  // Stable ref for uptimeSec — read inside intervals without triggering re-mounts
  const uptimeRef = React.useRef(3679800)

  // Live activity feed
  const [activities, setActivities] = React.useState<ActivityItem[]>([
    {
      id: "act_1",
      type: "RECOVERY",
      title: "Health Recovered",
      description: "Supervisor re-established RTMP handshake for `channel_main` within 180ms.",
      timestamp: "Just now",
      status: "success",
    },
    {
      id: "act_2",
      type: "PLAYLIST",
      title: "Playlist Updated",
      description: "Appended `ep_104_midnight_vibes.mp4` to active concat loop queue.",
      timestamp: "2m ago",
      status: "info",
    },
    {
      id: "act_3",
      type: "MEDIA",
      title: "Media Uploaded",
      description: "ffprobe verified `ep_104_midnight_vibes.mp4` (1080p60 h264/aac).",
      timestamp: "5m ago",
      status: "success",
    },
    {
      id: "act_4",
      type: "BACKUP",
      title: "Backup Completed",
      description: "Automatic snapshot `config.yaml.bak` written to NVMe storage array.",
      timestamp: "18m ago",
      status: "info",
    },
    {
      id: "act_5",
      type: "PLUGIN",
      title: "Plugin Installed",
      description: "Hook `Telegram Alert Bot v1.0.1` registered to `on_error` lifecycle.",
      timestamp: "1h ago",
      status: "info",
    },
    {
      id: "act_6",
      type: "RESTART",
      title: "Worker Restarted",
      description: "Process PID 14202 clean start after nightly memory defragmentation.",
      timestamp: "3h ago",
      status: "warning",
    },
    {
      id: "act_7",
      type: "CHANNEL",
      title: "Channel Started",
      description: "Mirza Main Broadcast initialized RTMP stream to YouTube Live.",
      timestamp: "142h ago",
      status: "success",
    },
  ])

  // Alert Center state
  const [alerts, setAlerts] = React.useState<AlertItem[]>([
    {
      id: "alt_1",
      level: "RESOLVED",
      title: "Supervisor Recovery Successful",
      message: "Worker `channel_main` recovered from temporary socket timeout without dropped frames.",
      time: "2m ago",
      workerId: "channel_main",
    },
    {
      id: "alt_2",
      level: "WARNING",
      title: "Corrupted Media Auto-Skipped",
      message: "Header check failed on `corrupted_raw_clip_temp.mp4`. Excluded from concat playlist automatically.",
      time: "14m ago",
      workerId: "channel_main",
    },
    {
      id: "alt_3",
      level: "INFORMATION",
      title: "CBR Strict Target Maintained",
      message: "Encoder buffer stabilization active (-bufsize 9000k). Bitrate variance < 0.3%.",
      time: "42m ago",
      workerId: "channel_main",
    },
  ])

  React.useEffect(() => {
    // Generate initial baseline telemetry
    const initialPoints: TelemetryPoint[] = []
    const now = new Date()
    for (let i = maxPoints; i >= 0; i--) {
      const t = new Date(now.getTime() - i * 1000)
      initialPoints.push({
        time: t.toLocaleTimeString("en-US", { hour12: false, second: "2-digit", minute: "2-digit" }),
        bitrate: Math.round(4500 + (Math.random() * 16 - 8)),
        fps: 30.0,
        dropped: 0,
        cpu: Math.round(24 + (Math.random() * 4 - 2)),
        ram: Number((13.1 + Math.random() * 0.2).toFixed(1)),
        gpu: Math.round(18 + (Math.random() * 3 - 1.5)),
        disk: Number((58.2 + Math.random() * 0.05).toFixed(1)),
        networkIn: Number((45.2 + Math.random() * 2 - 1).toFixed(1)),
        networkOut: Number((4.5 + Math.random() * 0.2).toFixed(1)),
        temperature: Number((48.5 + Math.random() * 0.4 - 0.2).toFixed(1)),
        workerLoad: Math.round(62 + (Math.random() * 6 - 3)),
        playlistProgress: Math.min(100, Math.round(((maxPoints - i) / maxPoints) * 100)),
      })
    }
    setData(initialPoints)

    // Attempt WebSocket connection
    let ws: WebSocket | null = null
    try {
      ws = new WebSocket("ws://127.0.0.1:8000/ws/telemetry")
      ws.onopen = () => setConnected(true)
      ws.onmessage = (event) => {
        try {
          const point = JSON.parse(event.data) as TelemetryPoint
          setData((prev) => [...prev.slice(1), point])
          setLastUpdated(new Date())
        } catch (e) {
          // Ignore invalid packet
        }
      }
      ws.onerror = () => setConnected(false)
      ws.onclose = () => setConnected(false)
    } catch (err) {
      setConnected(false)
    }

    // Fallback 1Hz simulation loop if offline / standalone UI
    const interval = setInterval(() => {
      setData((prev) => {
        const last = prev[prev.length - 1] || initialPoints[initialPoints.length - 1]
        const nowTime = new Date()
        const newCpu = Math.min(100, Math.max(8, Math.round(last.cpu + (Math.random() * 3 - 1.5))))
        const newRam = Number(Math.min(100, Math.max(10, last.ram + (Math.random() * 0.14 - 0.07))).toFixed(1))
        const newGpu = Math.min(100, Math.max(5, Math.round(last.gpu + (Math.random() * 2 - 1))))
        const newTemp = Number((48.5 + (newCpu - 24) * 0.15 + (Math.random() * 0.3 - 0.15)).toFixed(1))
        const newNetIn = Number(Math.max(10, last.networkIn + (Math.random() * 3 - 1.5)).toFixed(1))
        
        const newPoint: TelemetryPoint = {
          time: nowTime.toLocaleTimeString("en-US", { hour12: false, second: "2-digit", minute: "2-digit" }),
          bitrate: Math.round(4500 + (Math.random() * 24 - 12)),
          fps: Math.random() > 0.96 ? 29.9 : 30.0,
          dropped: 0,
          cpu: newCpu,
          ram: newRam,
          gpu: newGpu,
          disk: last.disk,
          networkIn: newNetIn,
          networkOut: Number((newNetIn * 0.1).toFixed(1)),
          temperature: newTemp,
          workerLoad: Math.min(100, Math.max(20, Math.round(last.workerLoad + (Math.random() * 4 - 2)))),
          playlistProgress: (last.playlistProgress + 1) % 100,
        }

        setSystemHealth({
          cpu: newCpu,
          ram: newRam,
          gpu: newGpu,
          disk: last.disk,
          temperature: newTemp,
          networkSpeed: newNetIn,
          uptimeSec: uptimeRef.current + 1,
          healthScore: newCpu > 90 ? 94 : 100,
        })
        uptimeRef.current = uptimeRef.current + 1
        setLastUpdated(nowTime)

        return [...prev.slice(1), newPoint]
      })
    }, 1000)

    return () => {
      if (ws) ws.close()
      clearInterval(interval)
    }
  }, [maxPoints]) // eslint-disable-line react-hooks/exhaustive-deps
  // NOTE: systemHealth.uptimeSec intentionally excluded — tracked via ref to prevent
  // WebSocket reconnection and interval accumulation on every tick.

  const dismissAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id))
  }

  const resolveAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, level: "RESOLVED" as const } : a))
    )
  }

  return {
    data,
    connected,
    lastUpdated,
    systemHealth,
    activities,
    alerts,
    dismissAlert,
    resolveAlert,
  }
}
