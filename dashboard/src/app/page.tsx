"use client"

import * as React from "react"
import { motion } from "framer-motion"
import {
  Activity,
  Radio,
  Cpu,
  Tv,
  Play,
  RotateCcw,
  AlertTriangle,
  ShieldCheck,
  Zap,
  TrendingUp,
  HardDrive,
  Network,
  Eye,
  Clock,
  Database,
  PlusCircle,
  BarChart3,
  Layers,
  Sparkles,
  Server,
  Flame,
} from "lucide-react"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AnimatedCounter } from "@/components/ui/animated-counter"
import { useLiveTelemetry } from "@/hooks/use-live-telemetry"
import { StatCard } from "@/components/telemetry/stat-card"
import { WorkerCard, WorkerStatus } from "@/components/telemetry/worker-card"
import { LiveStreamPreviewSection } from "@/components/telemetry/live-preview-card"
import { SystemHealthPanel } from "@/components/telemetry/system-health-panel"
import { StreamPerformanceSection } from "@/components/telemetry/telemetry-charts"
import { RecentActivityFeed } from "@/components/telemetry/recent-activity-feed"
import { AlertCenterPanel } from "@/components/telemetry/alert-center"
import { QuickActionsSection } from "@/components/telemetry/quick-actions"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

export default function DashboardPage() {
  const [dialogOpen, setDialogOpen] = React.useState(false)
  // Mount guard: prevents rendering client-time-dependent values during SSR/hydration
  const [isMounted, setIsMounted] = React.useState(false)
  React.useEffect(() => { setIsMounted(true) }, [])

  const {
    data: telemetryData,
    connected,
    lastUpdated,
    systemHealth,
    activities,
    alerts,
    dismissAlert,
    resolveAlert,
  } = useLiveTelemetry(30)

  const currentBitrate = telemetryData[telemetryData.length - 1]?.bitrate || 4512
  const currentCpu = telemetryData[telemetryData.length - 1]?.cpu || 24
  const currentRam = telemetryData[telemetryData.length - 1]?.ram || 13.1
  const currentGpu = telemetryData[telemetryData.length - 1]?.gpu || 18.4
  const currentFps = telemetryData[telemetryData.length - 1]?.fps || 30.0

  // Sparkline data generators for StatCards
  const bitrateSpark = telemetryData.map((d) => ({ val: d.bitrate }))
  const cpuSpark = telemetryData.map((d) => ({ val: d.cpu }))
  const ramSpark = telemetryData.map((d) => ({ val: d.ram }))
  const gpuSpark = telemetryData.map((d) => ({ val: d.gpu }))
  const netSpark = telemetryData.map((d) => ({ val: d.networkIn }))
  const fpsSpark = telemetryData.map((d) => ({ val: d.fps }))

  const [workers, setWorkers] = React.useState([
    {
      id: "channel_main",
      name: "Mirza Primary YouTube Broadcast (24/7 Lo-Fi)",
      rtmpUrl: "rtmp://a.rtmp.youtube.com/live2/xxxx-••••",
      status: "LIVE" as WorkerStatus,
      currentVideo: "ep_102_lofi_mix.mp4",
      viewers: 1420,
      bitrate: currentBitrate,
      fps: currentFps,
      resolution: "1920x1080 @ 60fps",
      cpuUsage: currentCpu,
      ramUsage: currentRam,
      networkSpeed: 45.2,
      healthScore: 100,
    },
    {
      id: "channel_secondary",
      name: "Mirza Backup Mirror (1080p Stream)",
      rtmpUrl: "rtmp://b.rtmp.youtube.com/live2/yyyy-••••",
      status: "IDLE" as WorkerStatus,
      currentVideo: "ep_103_chill_study_session.mp4",
      viewers: 312,
      bitrate: 3500,
      fps: 30.0,
      resolution: "1920x1080 @ 30fps",
      cpuUsage: 12,
      ramUsage: 8.4,
      networkSpeed: 14.8,
      healthScore: 99,
    },
  ])

  const handleRestartWorker = (id: string) => {
    setWorkers((prev) =>
      prev.map((w) => (w.id === id ? { ...w, status: "RECOVERING" as WorkerStatus } : w))
    )
    setTimeout(() => {
      setWorkers((prev) =>
        prev.map((w) => (w.id === id ? { ...w, status: "LIVE" as WorkerStatus, healthScore: 100 } : w))
      )
    }, 2500)
  }

  const handleStopWorker = (id: string) => {
    setWorkers((prev) =>
      prev.map((w) => (w.id === id ? { ...w, status: "OFFLINE" as WorkerStatus, viewers: 0 } : w))
    )
  }

  const handleStartWorker = (id: string) => {
    setWorkers((prev) =>
      prev.map((w) => (w.id === id ? { ...w, status: "LIVE" as WorkerStatus, viewers: Math.round(250 + Math.random() * 200) } : w))
    )
  }

  return (
    <DashboardShell>
      {/* Top Header Banner & Quick Provisioning */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1C1C1C] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="online" className="text-xs px-2.5 py-0.5 font-mono shadow-md">
              ENTERPRISE ORCHESTRATOR ONLINE
            </Badge>
            <span className="text-xs font-mono text-[#888888] hidden md:inline">
              Mirza Live Platform V2 • WebSocket: {connected ? "Live Supervisor Hook" : "Fallback High-Freq Hub"}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mt-1.5 flex items-center gap-2.5">
            Enterprise Command &amp; Telemetry Center
          </h1>
          <p className="text-[#888888] text-sm mt-1 max-w-3xl">
            Real-time multi-channel orchestration, zero-drop RTMP pipelines, and high-density system diagnostics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="glow" size="sm" className="font-bold px-4 h-9 shadow-lg">
                <Play className="h-4 w-4 mr-2 fill-white" /> Launch New Channel
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-white">
                  <Radio className="h-5 w-5 text-[#FF5A1F]" /> Provision Channel Worker Instance
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Configure isolated multi-threaded FFmpeg encoding parameters for continuous RTMP streaming.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="rounded-xl border border-[#1C1C1C] bg-[#090909] p-4 space-y-3 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#888888]">Worker ID Identifier</span>
                    <span className="text-[#10B981] font-bold">channel_aux_3 (Isolated Thread)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#888888]">Bitrate Constraint</span>
                    <span className="text-white">4,500 kbps (`-bufsize 9000k`)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#888888]">Media Loop Guard</span>
                    <span className="text-white">Active (`PlaylistManager`)</span>
                  </div>
                  <div className="flex justify-between border-t border-[#1C1C1C]/60 pt-2">
                    <span className="text-[#888888]">Hardware Acceleration</span>
                    <span className="text-[#FF5A1F] font-bold">NVIDIA NVENC Engine</span>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setDialogOpen(false)} className="text-xs">
                  Cancel
                </Button>
                <Button variant="default" onClick={() => setDialogOpen(false)} className="text-xs font-bold">
                  Confirm Provision
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* SECTION 1: High-Density 10-Card Statistics Grid (`StatCard` with Sparklines & Trends) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-mono font-bold tracking-wider text-[#888888] uppercase flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-[#FF5A1F]" /> High-Frequency KPI Statistics Grid (`1Hz Polling`)
          </h2>
          <span className="text-xs font-mono text-[#888888]">
            Last updated:{" "}
            <span className="text-white tabular-nums">
              {isMounted ? lastUpdated.toLocaleTimeString() : "\u2014"}
            </span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <StatCard
            title="CHANNELS ONLINE"
            value={workers.filter((w) => w.status === "LIVE").length}
            suffix=" / 2"
            trendPercent={0.0}
            trendLabel="vs yesterday"
            statusColor="success"
            icon={<Radio className="h-4 w-4" />}
            tooltip="Total supervised workers actively transmitting RTMP packets"
            lastUpdated="Just now"
            sparklineData={bitrateSpark.slice(-15)}
          />

          <StatCard
            title="STREAMS RUNNING"
            value={workers.filter((w) => w.status === "LIVE").length}
            suffix=" RTMP"
            trendPercent={0.0}
            trendLabel="sync locked"
            statusColor="primary"
            icon={<Tv className="h-4 w-4" />}
            tooltip="Active RTMP destinations connected to YouTube live ingest servers"
            lastUpdated="2s ago"
            sparklineData={fpsSpark.slice(-15)}
          />

          <StatCard
            title="TOTAL BITRATE"
            value={currentBitrate}
            suffix=" kbps"
            trendPercent={0.3}
            trendLabel="CBR variance"
            statusColor="primary"
            icon={<Activity className="h-4 w-4" />}
            tooltip="Combined video + audio output bitrate across all workers (-maxrate strict)"
            lastUpdated="Just now"
            sparklineData={bitrateSpark}
          />

          <StatCard
            title="ACTIVE VIEWERS"
            value={workers.reduce((acc, w) => acc + w.viewers, 0)}
            trendPercent={12.4}
            trendLabel="vs last hr"
            statusColor="info"
            icon={<Eye className="h-4 w-4" />}
            tooltip="Real-time concurrent viewers aggregated across active broadcasts"
            lastUpdated="Just now"
            sparklineData={netSpark}
          />

          <StatCard
            title="ENCODING SPEED"
            value={1.0}
            suffix="x Sync"
            decimals={2}
            trendPercent={0.0}
            trendLabel="0 dropped frames"
            statusColor="success"
            icon={<Zap className="h-4 w-4" />}
            tooltip="FFmpeg pipeline speed relative to real-time playback clock (1.00x required)"
            lastUpdated="1s ago"
            sparklineData={fpsSpark}
          />

          <StatCard
            title="CPU LOAD"
            value={currentCpu}
            suffix="%"
            trendPercent={-1.2}
            trendLabel="vs baseline"
            statusColor={currentCpu > 80 ? "destructive" : "info"}
            icon={<Cpu className="h-4 w-4" />}
            tooltip="Host CPU utilization across all 12 physical hardware cores"
            lastUpdated="Just now"
            sparklineData={cpuSpark}
          />

          <StatCard
            title="RAM USAGE"
            value={currentRam}
            suffix="%"
            decimals={1}
            trendPercent={0.4}
            trendLabel="4.2/32 GB"
            statusColor="success"
            icon={<Database className="h-4 w-4" />}
            tooltip="System memory allocation including FFmpeg read-ahead frame buffers"
            lastUpdated="Just now"
            sparklineData={ramSpark}
          />

          <StatCard
            title="GPU ENGINE"
            value={currentGpu}
            suffix="%"
            trendPercent={2.1}
            trendLabel="NVENC active"
            statusColor="primary"
            icon={<HardDrive className="h-4 w-4" />}
            tooltip="NVIDIA hardware NVENC encoding engine capacity utilization"
            lastUpdated="Just now"
            sparklineData={gpuSpark}
          />

          <StatCard
            title="NETWORK I/O"
            value={systemHealth.networkSpeed}
            suffix=" Mbps"
            decimals={1}
            trendPercent={1.8}
            trendLabel="full duplex"
            statusColor="success"
            icon={<Network className="h-4 w-4" />}
            tooltip="Ethernet NIC ingress and RTMP egress network throughput"
            lastUpdated="Just now"
            sparklineData={netSpark}
          />

          <StatCard
            title="SERVER UPTIME"
            value={42}
            suffix=" Days"
            trendPercent={100}
            trendLabel="mirza.lock ok"
            statusColor="success"
            icon={<Clock className="h-4 w-4" />}
            tooltip="Continuous uninterrupted uptime since last kernel or supervisor restart"
            lastUpdated="Just now"
          />
        </div>
      </div>

      {/* SECTION 2: Enterprise Quick Actions Grid */}
      <div className="pt-4 pb-2">
        <QuickActionsSection
          onStartAll={() => {
            setWorkers((prev) =>
              prev.map((w) => ({ ...w, status: "LIVE" as WorkerStatus, viewers: Math.round(500 + Math.random() * 500) }))
            )
          }}
          onStopAll={() => {
            setWorkers((prev) =>
              prev.map((w) => ({ ...w, status: "OFFLINE" as WorkerStatus, viewers: 0 }))
            )
          }}
          onRestartMain={() => handleRestartWorker("channel_main")}
        />
      </div>

      {/* SECTION 3: Live Channels / Worker Cards Section */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
            <Tv className="h-5 w-5 text-[#FF5A1F]" /> Live Channels &amp; Supervised Worker Instances
          </h2>
          <span className="text-xs text-[#888888] font-mono bg-[#111111] px-2.5 py-1 rounded-lg border border-[#1C1C1C]">
            {workers.filter((w) => w.status === "LIVE").length} / {workers.length} Workers LIVE
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {workers.map((w) => (
            <WorkerCard
              key={w.id}
              {...w}
              bitrate={w.id === "channel_main" ? currentBitrate : w.bitrate}
              cpuUsage={w.id === "channel_main" ? currentCpu : w.cpuUsage}
              ramUsage={w.id === "channel_main" ? currentRam : w.ramUsage}
              onRestart={handleRestartWorker}
              onStop={handleStopWorker}
              onStart={handleStartWorker}
            />
          ))}
        </div>
      </div>

      {/* SECTION 3: Live Stream Preview Section */}
      <div className="pt-2">
        <LiveStreamPreviewSection
          streams={workers
            .filter((w) => w.status === "LIVE" || w.status === "RECOVERING")
            .map((w) => ({
              channelId: w.id,
              title: w.name,
              currentMedia: w.currentVideo,
              elapsedSeconds: w.id === "channel_main" ? 4462 : 1840,
              viewers: w.viewers,
              bitrate: w.id === "channel_main" ? currentBitrate : w.bitrate,
              qualityScore: w.healthScore,
              rtmpUrl: w.rtmpUrl,
            }))}
        />
      </div>

      {/* SECTION 4: System Health Panel (`SystemHealthPanel`) */}
      <div className="pt-2">
        <SystemHealthPanel health={systemHealth} />
      </div>

      {/* SECTION 5: Stream Performance Recharts Grid (`StreamPerformanceSection`) */}
      <div className="pt-2">
        <StreamPerformanceSection data={telemetryData} />
      </div>

      {/* SECTION 6: Recent Activity Feed & Alert Center Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        <RecentActivityFeed activities={activities} />
        <AlertCenterPanel
          alerts={alerts}
          onDismiss={dismissAlert}
          onResolve={resolveAlert}
        />
      </div>
    </DashboardShell>
  )
}
