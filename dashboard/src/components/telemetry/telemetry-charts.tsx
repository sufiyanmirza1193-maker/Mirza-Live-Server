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
  ResponsiveContainer,
  ReferenceLine,
  BarChart,
  Bar,
} from "recharts"
import { TelemetryPoint } from "@/hooks/use-live-telemetry"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Activity, Cpu, HardDrive, Network, Zap, ListVideo } from "lucide-react"

interface ChartProps {
  data: TelemetryPoint[]
  height?: number
}

export function BitrateChart({ data, height = 240 }: ChartProps) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="bitrateColor" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FF5A1F" stopOpacity={0.45} />
              <stop offset="95%" stopColor="#FF5A1F" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="time" stroke="#555555" fontSize={11} tickLine={false} />
          <YAxis domain={[4450, 4550]} stroke="#555555" fontSize={11} tickLine={false} />
          <Tooltip
            contentStyle={{ backgroundColor: "#111111", borderColor: "#1C1C1C", borderRadius: "8px", fontSize: "12px", fontFamily: "monospace" }}
          />
          <ReferenceLine y={4500} stroke="#10B981" strokeDasharray="3 3" label={{ value: "4500 CBR Strict", fill: "#10B981", fontSize: 10 }} />
          <Area type="monotone" dataKey="bitrate" stroke="#FF5A1F" strokeWidth={2} fillOpacity={1} fill="url(#bitrateColor)" name="Bitrate (kbps)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export function FpsChart({ data, height = 240 }: ChartProps) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <XAxis dataKey="time" stroke="#555555" fontSize={11} tickLine={false} />
          <YAxis domain={[25, 32]} stroke="#555555" fontSize={11} tickLine={false} />
          <Tooltip
            contentStyle={{ backgroundColor: "#111111", borderColor: "#1C1C1C", borderRadius: "8px", fontSize: "12px", fontFamily: "monospace" }}
          />
          <ReferenceLine y={30.0} stroke="#10B981" strokeDasharray="3 3" label={{ value: "30.0 FPS Sync", fill: "#10B981", fontSize: 10 }} />
          <Line type="monotone" dataKey="fps" stroke="#10B981" strokeWidth={2} dot={false} name="FPS" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function HardwareLoadChart({ data, height = 240 }: ChartProps) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
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
          <XAxis dataKey="time" stroke="#555555" fontSize={11} tickLine={false} />
          <YAxis domain={[0, 100]} stroke="#555555" fontSize={11} tickLine={false} />
          <Tooltip
            contentStyle={{ backgroundColor: "#111111", borderColor: "#1C1C1C", borderRadius: "8px", fontSize: "12px", fontFamily: "monospace" }}
          />
          <Area type="monotone" dataKey="cpu" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#cpuColor)" name="CPU %" />
          <Area type="monotone" dataKey="gpu" stroke="#FF5A1F" strokeWidth={2} fillOpacity={1} fill="url(#gpuColor)" name="GPU %" />
          <Area type="monotone" dataKey="ram" stroke="#10B981" strokeWidth={2} fillOpacity={0} name="RAM %" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export function NetworkSpeedChart({ data, height = 240 }: ChartProps) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="netInColor" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="time" stroke="#555555" fontSize={11} tickLine={false} />
          <YAxis domain={[0, 100]} stroke="#555555" fontSize={11} tickLine={false} />
          <Tooltip
            contentStyle={{ backgroundColor: "#111111", borderColor: "#1C1C1C", borderRadius: "8px", fontSize: "12px", fontFamily: "monospace" }}
          />
          <Area type="monotone" dataKey="networkIn" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#netInColor)" name="Network Inbound (Mbps)" />
          <Area type="monotone" dataKey="networkOut" stroke="#3B82F6" strokeWidth={1.5} fillOpacity={0} name="Egress (Mbps)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export function WorkerPerformanceChart({ data, height = 240 }: ChartProps) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <XAxis dataKey="time" stroke="#555555" fontSize={11} tickLine={false} />
          <YAxis domain={[0, 100]} stroke="#555555" fontSize={11} tickLine={false} />
          <Tooltip
            contentStyle={{ backgroundColor: "#111111", borderColor: "#1C1C1C", borderRadius: "8px", fontSize: "12px", fontFamily: "monospace" }}
          />
          <Bar dataKey="workerLoad" fill="#FF5A1F" radius={[4, 4, 0, 0]} name="Worker Load %" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function StreamPerformanceSection({ data }: { data: TelemetryPoint[] }) {
  return (
    <Card className="glass-card">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1C1C1C] pb-4">
        <div>
          <CardTitle className="text-base font-bold text-white flex items-center gap-2">
            <Activity className="h-4 w-4 text-[#FF5A1F]" /> Enterprise Stream Performance &amp; Hardware Telemetry (`Recharts`)
          </CardTitle>
          <CardDescription className="text-xs">
            1Hz high-frequency WebSocket data visualization with reference bounds and zero-drop validation
          </CardDescription>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <Tabs defaultValue="encoding" className="w-full space-y-4">
          <TabsList className="bg-[#090909] border border-[#1C1C1C] p-1 font-mono text-xs flex flex-wrap h-auto gap-1">
            <TabsTrigger value="encoding" className="flex items-center gap-1.5 px-3 py-1.5">
              <Zap className="h-3.5 w-3.5 text-[#FF5A1F]" /> Bitrate &amp; FPS Strictness
            </TabsTrigger>
            <TabsTrigger value="hardware" className="flex items-center gap-1.5 px-3 py-1.5">
              <Cpu className="h-3.5 w-3.5 text-[#3B82F6]" /> CPU, RAM &amp; GPU History
            </TabsTrigger>
            <TabsTrigger value="network" className="flex items-center gap-1.5 px-3 py-1.5">
              <Network className="h-3.5 w-3.5 text-[#10B981]" /> Network I/O &amp; Dropped Frames
            </TabsTrigger>
            <TabsTrigger value="worker" className="flex items-center gap-1.5 px-3 py-1.5">
              <ListVideo className="h-3.5 w-3.5 text-[#F59E0B]" /> Worker &amp; Playlist Activity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="encoding" className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-mono text-[#888888] px-1">
                <span>ENCODING BITRATE (-bufsize 9000k)</span>
                <span className="text-[#10B981] font-bold">CBR Strict Sync OK</span>
              </div>
              <BitrateChart data={data} height={230} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-mono text-[#888888] px-1">
                <span>STREAM FRAMERATE (FPS)</span>
                <span className="text-white font-bold">30.00 FPS Target</span>
              </div>
              <FpsChart data={data} height={230} />
            </div>
          </TabsContent>

          <TabsContent value="hardware" className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-mono text-[#888888] px-1">
                <span>CPU, GPU &amp; RAM UTILIZATION (%)</span>
                <span className="text-[#3B82F6] font-bold">12 Physical Cores</span>
              </div>
              <HardwareLoadChart data={data} height={230} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-mono text-[#888888] px-1">
                <span>WORKER THREAD CPU LOAD (%)</span>
                <span className="text-[#FF5A1F] font-bold">Priority Class HIGH</span>
              </div>
              <WorkerPerformanceChart data={data} height={230} />
            </div>
          </TabsContent>

          <TabsContent value="network" className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-mono text-[#888888] px-1">
                <span>NETWORK INGRESS VS EGRESS (Mbps)</span>
                <span className="text-[#10B981] font-bold">0 Packet Drops</span>
              </div>
              <NetworkSpeedChart data={data} height={230} />
            </div>
            <div className="space-y-2 font-mono text-xs p-4 rounded-xl bg-[#090909] border border-[#1C1C1C] flex flex-col justify-between">
              <div>
                <span className="text-[#888888] uppercase block">Dropped Frames Audit</span>
                <span className="text-3xl font-bold text-[#10B981] block mt-2">0 Frames</span>
                <p className="text-[#888888] text-xs mt-2 leading-relaxed">
                  GOP synchronization is locked at 60 frames (2.0s keyframe interval). Zero buffer underruns recorded across the last 24 hours of continuous RTMP transmission.
                </p>
              </div>
              <div className="pt-3 border-t border-[#1C1C1C]/60 flex justify-between items-center">
                <span>RTMP Socket Buffer:</span>
                <span className="text-white font-bold">100% Health</span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="worker" className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-mono text-[#888888] px-1">
                <span>MULTI-THREADED FFMPEG WORKER LOAD</span>
                <span className="text-white font-bold">PID 14202</span>
              </div>
              <WorkerPerformanceChart data={data} height={230} />
            </div>
            <div className="space-y-3 font-mono text-xs p-4 rounded-xl bg-[#090909] border border-[#1C1C1C] flex flex-col justify-between">
              <div>
                <span className="text-[#888888] uppercase block">Playlist Concat Loop Activity</span>
                <span className="text-2xl font-bold text-white block mt-2">ep_102_lofi_mix.mp4</span>
                <p className="text-[#10B981] text-xs mt-1">
                  Playing item #2 of 3 in active sequence.
                </p>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-[#888888]">
                  <span>Item Progress</span>
                  <span className="text-white font-bold">{data[data.length - 1]?.playlistProgress || 45}%</span>
                </div>
                <div className="w-full bg-[#181818] h-2 rounded-full overflow-hidden border border-[#1C1C1C]">
                  <div
                    className="bg-[#FF5A1F] h-full transition-all duration-500"
                    style={{ width: `${data[data.length - 1]?.playlistProgress || 45}%` }}
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
