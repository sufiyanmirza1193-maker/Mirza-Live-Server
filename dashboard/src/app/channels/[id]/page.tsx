"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import {
  Radio,
  RotateCcw,
  Square,
  ArrowLeft,
  Tv,
  ListVideo,
  Terminal,
  Sliders,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { useLiveTelemetry } from "@/hooks/use-live-telemetry"
import { BitrateChart } from "@/components/telemetry/telemetry-charts"

export default function ChannelDetailView() {
  const params = useParams()
  const router = useRouter()
  const channelId = (params.id as string) || "channel_main"
  const { data: telemetryData } = useLiveTelemetry(30)

  return (
    <DashboardShell>
      {/* Top Breadcrumb & Action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1C1C1C] pb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/channels")}
            className="h-9 w-9 text-[#888888] hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="online" className="text-xs">
                ONLINE
              </Badge>
              <span className="text-xs font-mono text-[#888888]">
                Worker ID: {channelId}
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
              {channelId === "channel_main" ? "Primary YouTube Broadcast" : "Secondary Backup Instance"}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="text-xs">
            <RotateCcw className="h-3.5 w-3.5 mr-1.5 text-[#FF5A1F]" /> Restart Worker
          </Button>
          <Button variant="destructive" size="sm" className="text-xs">
            <Square className="h-3.5 w-3.5 mr-1.5 fill-white" /> Terminate Stream
          </Button>
        </div>
      </div>

      {/* Deep-Dive Tabs */}
      <Tabs defaultValue="telemetry" className="w-full space-y-6">
        <TabsList className="bg-[#111111] border border-[#1C1C1C] p-1 font-mono text-xs">
          <TabsTrigger value="telemetry" className="flex items-center gap-1.5">
            <Tv className="h-3.5 w-3.5" /> Live Telemetry
          </TabsTrigger>
          <TabsTrigger value="queue" className="flex items-center gap-1.5">
            <ListVideo className="h-3.5 w-3.5" /> Concat Queue
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-1.5">
            <Terminal className="h-3.5 w-3.5" /> Worker Logs
          </TabsTrigger>
          <TabsTrigger value="config" className="flex items-center gap-1.5">
            <Sliders className="h-3.5 w-3.5" /> Channel Config
          </TabsTrigger>
        </TabsList>

        <TabsContent value="telemetry" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono text-xs">
            <Card className="glass-card p-4 space-y-1">
              <span className="text-[#888888] text-[11px] block">CURRENT FPS</span>
              <span className="text-2xl font-bold text-[#10B981]">30.0 FPS</span>
              <span className="text-[10px] text-[#888888] block">0 Dropped</span>
            </Card>
            <Card className="glass-card p-4 space-y-1">
              <span className="text-[#888888] text-[11px] block">ENCODING BITRATE</span>
              <span className="text-2xl font-bold text-white">4,512 kbps</span>
              <span className="text-[10px] text-[#888888] block">CBR Strict</span>
            </Card>
            <Card className="glass-card p-4 space-y-1">
              <span className="text-[#888888] text-[11px] block">SUPERVISOR STATUS</span>
              <span className="text-2xl font-bold text-[#10B981]">0 Failures</span>
              <span className="text-[10px] text-[#888888] block">Max Retries: 5</span>
            </Card>
            <Card className="glass-card p-4 space-y-1">
              <span className="text-[#888888] text-[11px] block">WORKER PID</span>
              <span className="text-2xl font-bold text-[#3B82F6]">14202</span>
              <span className="text-[10px] text-[#888888] block">windows.subprocess</span>
            </Card>
          </div>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-base">Worker Bitrate Progress</CardTitle>
              <CardDescription className="text-xs">
                30-second sliding progress window parsed directly from FFmpeg stderr
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BitrateChart data={telemetryData} height={280} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="queue" className="space-y-4">
          <Card className="glass-card font-mono text-xs">
            <CardHeader>
              <CardTitle className="text-base text-white">Active Concat Sequence (`playlist.txt`)</CardTitle>
              <CardDescription className="text-xs font-mono">
                Windows absolute file syntax verified (`file 'C:/live channel/mirza_live_server/media/...'`)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { id: 1, name: "ep_101_rainy_night_lofi.mp4", duration: "01:15:00", status: "PLAYED" },
                { id: 2, name: "ep_102_lofi_mix.mp4", duration: "01:15:12", status: "PLAYING NOW" },
                { id: 3, name: "ep_103_chill_study_session.mp4", duration: "01:15:00", status: "NEXT IN QUEUE" },
              ].map((item) => (
                <div key={item.id} className="p-3 rounded-xl bg-[#090909] border border-[#1C1C1C] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-[#888888]">#{item.id}</span>
                    <span className="text-white font-bold">{item.name}</span>
                  </div>
                  <Badge variant={item.status === "PLAYING NOW" ? "online" : "outline"} className="text-[10px]">
                    {item.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card className="glass-card font-mono text-xs">
            <CardHeader>
              <CardTitle className="text-base text-white">Live Worker Stderr Output (`logs/{channelId}.log`)</CardTitle>
            </CardHeader>
            <CardContent className="p-4 bg-[#090909] space-y-2 overflow-x-auto max-h-[400px]">
              {[
                { time: "04:00:01", msg: "ChannelSupervisor[channel_main]: Spawning FFmpeg worker..." },
                { time: "04:00:02", msg: "StreamHealthMonitor: FFmpeg stderr pipe opened successfully." },
                { time: "04:00:10", msg: "frame= 300 fps=30.0 q=28.0 size= 4500kB time=00:00:10.00 bitrate=4500.0kbits/s speed=1.00x" },
                { time: "04:00:20", msg: "frame= 600 fps=30.0 q=28.0 size= 9000kB time=00:00:20.00 bitrate=4500.0kbits/s speed=1.00x" },
              ].map((log, i) => (
                <div key={i} className="flex gap-3 text-[#F5F5F5]">
                  <span className="text-[#888888] shrink-0">[{log.time}]</span>
                  <span className="text-[#10B981] font-bold shrink-0">[PROGRESS]</span>
                  <span>{log.msg}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
          <Card className="glass-card font-mono text-xs">
            <CardHeader>
              <CardTitle className="text-base text-white">Worker Encoding &amp; RTMP Destination</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 font-sans text-sm">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-[#888888]">RTMP Destination URL</label>
                <Input defaultValue="rtmp://a.rtmp.youtube.com/live2/••••-••••-••••" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-[#888888]">Target Bitrate (CBR Strict)</label>
                  <Input defaultValue="4500k" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-[#888888]">Video Resolution</label>
                  <Input defaultValue="1920x1080" />
                </div>
              </div>
              <Button variant="default" size="sm">
                Save Worker Configuration
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  )
}
