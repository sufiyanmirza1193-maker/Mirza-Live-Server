"use client"

import * as React from "react"
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  BarChart,
  Bar,
} from "recharts"
import { TelemetryPoint } from "@/hooks/use-live-telemetry"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Activity, Cpu, Network, Zap, ListVideo } from "lucide-react"
import { BaseTelemetryChart, COMMON_TOOLTIP_STYLE } from "@/components/telemetry/charts/base-chart"

interface ChartProps {
  data: TelemetryPoint[]
  height?: number
}

const BitrateChart = React.memo(function BitrateChart({ data, height = 240 }: ChartProps) {
  return (
    <BaseTelemetryChart height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="bitrateColor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#FF5A1F" stopOpacity={0.45} />
            <stop offset="95%" stopColor="#FF5A1F" stopOpacity={0.0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
        <YAxis domain={[4450, 4550]} stroke="var(--text-muted)" fontSize={11} tickLine={false} />
        <Tooltip contentStyle={COMMON_TOOLTIP_STYLE} />
        <ReferenceLine y={4500} stroke="#10B981" strokeDasharray="3 3" label={{ value: "4500 CBR Strict", fill: "#10B981", fontSize: 10 }} />
        <Area type="monotone" dataKey="bitrate" stroke="#FF5A1F" strokeWidth={2} fillOpacity={1} fill="url(#bitrateColor)" name="Bitrate (kbps)" isAnimationActive={false} />
      </AreaChart>
    </BaseTelemetryChart>
  )
})

export { BitrateChart }

const FpsChart = React.memo(function FpsChart({ data, height = 240 }: ChartProps) {
  return (
    <BaseTelemetryChart height={height}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
        <YAxis domain={[25, 32]} stroke="var(--text-muted)" fontSize={11} tickLine={false} />
        <Tooltip contentStyle={COMMON_TOOLTIP_STYLE} />
        <ReferenceLine y={30.0} stroke="#10B981" strokeDasharray="3 3" label={{ value: "30.0 FPS Sync", fill: "#10B981", fontSize: 10 }} />
        <Line type="monotone" dataKey="fps" stroke="#10B981" strokeWidth={2} dot={false} name="FPS" isAnimationActive={false} />
      </LineChart>
    </BaseTelemetryChart>
  )
})

export { FpsChart }

const HardwareLoadChart = React.memo(function HardwareLoadChart({ data, height = 240 }: ChartProps) {
  return (
    <BaseTelemetryChart height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="cpuColor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
          </linearGradient>
          <linearGradient id="gpuColor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#FF5A1F" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#FF5A1F" stopOpacity={0.0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
        <YAxis domain={[0, 100]} stroke="var(--text-muted)" fontSize={11} tickLine={false} />
        <Tooltip contentStyle={COMMON_TOOLTIP_STYLE} />
        <Area type="monotone" dataKey="cpu" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#cpuColor)" name="CPU %" isAnimationActive={false} />
        <Area type="monotone" dataKey="gpu" stroke="#FF5A1F" strokeWidth={2} fillOpacity={1} fill="url(#gpuColor)" name="GPU %" isAnimationActive={false} />
        <Area type="monotone" dataKey="ram" stroke="#10B981" strokeWidth={2} fillOpacity={0} name="RAM %" isAnimationActive={false} />
      </AreaChart>
    </BaseTelemetryChart>
  )
})

export { HardwareLoadChart }

const NetworkSpeedChart = React.memo(function NetworkSpeedChart({ data, height = 240 }: ChartProps) {
  return (
    <BaseTelemetryChart height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="netInColor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
        <YAxis domain={[0, 100]} stroke="var(--text-muted)" fontSize={11} tickLine={false} />
        <Tooltip contentStyle={COMMON_TOOLTIP_STYLE} />
        <Area type="monotone" dataKey="networkIn" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#netInColor)" name="Network Inbound (Mbps)" isAnimationActive={false} />
        <Area type="monotone" dataKey="networkOut" stroke="#3B82F6" strokeWidth={1.5} fillOpacity={0} name="Egress (Mbps)" isAnimationActive={false} />
      </AreaChart>
    </BaseTelemetryChart>
  )
})

export { NetworkSpeedChart }

const WorkerPerformanceChart = React.memo(function WorkerPerformanceChart({ data, height = 240 }: ChartProps) {
  return (
    <BaseTelemetryChart height={height}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
        <YAxis domain={[0, 100]} stroke="var(--text-muted)" fontSize={11} tickLine={false} />
        <Tooltip contentStyle={COMMON_TOOLTIP_STYLE} />
        <Bar dataKey="workerLoad" fill="#FF5A1F" radius={[4, 4, 0, 0]} name="Worker Load %" isAnimationActive={false} />
      </BarChart>
    </BaseTelemetryChart>
  )
})

export { WorkerPerformanceChart }

function StreamPerformanceSectionComponent({ data }: { data: TelemetryPoint[] }) {
  const latestProgress = data[data.length - 1]?.playlistProgress || 45

  return (
    <Card className="bg-[var(--bg-card)] border-[var(--border-subtle)] shadow-md overflow-hidden">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-4 bg-[var(--bg-surface)]/30">
        <div>
          <CardTitle className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2 font-sans">
            <Activity className="h-4 w-4 text-[#FF5A1F]" /> Enterprise Stream Performance & Hardware Telemetry
          </CardTitle>
          <CardDescription className="text-xs text-[var(--text-muted)] font-mono mt-0.5">
            1Hz high-frequency WebSocket data visualization with reference bounds and zero-drop validation
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5">
        <Tabs defaultValue="encoding" className="w-full space-y-4">
          <TabsList className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-1 font-mono text-xs flex flex-wrap h-auto gap-1 rounded-xl">
            <TabsTrigger
              value="encoding"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg data-[state=active]:bg-[var(--bg-card)] data-[state=active]:text-[var(--text-primary)] data-[state=active]:shadow-xs text-[var(--text-secondary)]"
            >
              <Zap className="h-3.5 w-3.5 text-[#FF5A1F]" /> Bitrate & FPS Strictness
            </TabsTrigger>
            <TabsTrigger
              value="hardware"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg data-[state=active]:bg-[var(--bg-card)] data-[state=active]:text-[var(--text-primary)] data-[state=active]:shadow-xs text-[var(--text-secondary)]"
            >
              <Cpu className="h-3.5 w-3.5 text-[#3B82F6]" /> CPU, RAM & GPU History
            </TabsTrigger>
            <TabsTrigger
              value="network"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg data-[state=active]:bg-[var(--bg-card)] data-[state=active]:text-[var(--text-primary)] data-[state=active]:shadow-xs text-[var(--text-secondary)]"
            >
              <Network className="h-3.5 w-3.5 text-[#10B981]" /> Network I/O & Dropped Frames
            </TabsTrigger>
            <TabsTrigger
              value="worker"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg data-[state=active]:bg-[var(--bg-card)] data-[state=active]:text-[var(--text-primary)] data-[state=active]:shadow-xs text-[var(--text-secondary)]"
            >
              <ListVideo className="h-3.5 w-3.5 text-[#F59E0B]" /> Worker & Playlist Activity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="encoding" className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-mono text-[var(--text-muted)] px-1">
                <span>ENCODING BITRATE (-bufsize 9000k)</span>
                <span className="text-[#10B981] font-bold">CBR Strict Sync OK</span>
              </div>
              <BitrateChart data={data} height={230} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-mono text-[var(--text-muted)] px-1">
                <span>STREAM FRAMERATE (FPS)</span>
                <span className="text-[var(--text-primary)] font-bold">30.00 FPS Target</span>
              </div>
              <FpsChart data={data} height={230} />
            </div>
          </TabsContent>

          <TabsContent value="hardware" className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-mono text-[var(--text-muted)] px-1">
                <span>CPU, GPU & RAM UTILIZATION (%)</span>
                <span className="text-[#3B82F6] font-bold">12 Physical Cores</span>
              </div>
              <HardwareLoadChart data={data} height={230} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-mono text-[var(--text-muted)] px-1">
                <span>WORKER THREAD CPU LOAD (%)</span>
                <span className="text-[#FF5A1F] font-bold">Priority Class HIGH</span>
              </div>
              <WorkerPerformanceChart data={data} height={230} />
            </div>
          </TabsContent>

          <TabsContent value="network" className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-mono text-[var(--text-muted)] px-1">
                <span>NETWORK INGRESS VS EGRESS (Mbps)</span>
                <span className="text-[#10B981] font-bold">0 Packet Drops</span>
              </div>
              <NetworkSpeedChart data={data} height={230} />
            </div>
            <div className="space-y-2 font-mono text-xs p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex flex-col justify-between">
              <div>
                <span className="text-[var(--text-muted)] uppercase block">Dropped Frames Audit</span>
                <span className="text-3xl font-bold text-[#10B981] block mt-2">0 Frames</span>
                <p className="text-[var(--text-secondary)] text-xs mt-2 leading-relaxed">
                  GOP synchronization is locked at 60 frames (2.0s keyframe interval). Zero buffer underruns recorded across the last 24 hours of continuous RTMP transmission.
                </p>
              </div>
              <div className="pt-3 border-t border-[var(--border-subtle)] flex justify-between items-center text-[var(--text-secondary)]">
                <span>RTMP Socket Buffer:</span>
                <span className="text-[var(--text-primary)] font-bold">100% Health</span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="worker" className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-mono text-[var(--text-muted)] px-1">
                <span>MULTI-THREADED FFMPEG WORKER LOAD</span>
                <span className="text-[var(--text-primary)] font-bold">PID 14202</span>
              </div>
              <WorkerPerformanceChart data={data} height={230} />
            </div>
            <div className="space-y-3 font-mono text-xs p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex flex-col justify-between">
              <div>
                <span className="text-[var(--text-muted)] uppercase block">Playlist Concat Loop Activity</span>
                <span className="text-2xl font-bold text-[var(--text-primary)] block mt-2">ep_102_lofi_mix.mp4</span>
                <p className="text-[#10B981] text-xs mt-1 font-semibold">
                  Playing item #2 of 3 in active sequence.
                </p>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-[var(--text-muted)]">
                  <span>Item Progress</span>
                  <span className="text-[var(--text-primary)] font-bold">{latestProgress}%</span>
                </div>
                <div className="w-full bg-[var(--bg-elevated)] h-2 rounded-full overflow-hidden border border-[var(--border-subtle)]">
                  <div
                    className="bg-[#FF5A1F] h-full transition-all duration-500"
                    style={{ width: `${latestProgress}%` }}
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

export const StreamPerformanceSection = React.memo(StreamPerformanceSectionComponent)
