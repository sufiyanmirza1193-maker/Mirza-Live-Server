"use client"

import * as React from "react"
import { Tv, Activity, Zap, RefreshCw } from "lucide-react"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useLiveTelemetry } from "@/hooks/use-live-telemetry"
import { BitrateChart, FpsChart } from "@/components/telemetry/telemetry-charts"

export default function StreamsPage() {
  const { data: telemetryData } = useLiveTelemetry(30)

  return (
    <DashboardShell>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1C1C1C] pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Tv className="h-6 w-6 text-[#FF5A1F]" /> Live Streams &amp; Encoding Telemetry
          </h1>
          <p className="text-sm text-[#888888] mt-1">
            Real-time FFmpeg stderr progress parsing, GOP synchronization, and bitrate/FPS stability graphs.
          </p>
        </div>
        <Badge variant="online" className="self-start sm:self-center">
          FULL CBR SYNCHRONIZED
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-base text-white">Stream FPS</CardTitle>
            <CardDescription>Target: 30.00 FPS</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#10B981]">
              {telemetryData[telemetryData.length - 1]?.fps.toFixed(1) || "30.0"} / 30
            </div>
            <p className="text-[#888888] mt-1">0 dropped frames last 24h</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-base text-white">Encoding Bitrate</CardTitle>
            <CardDescription>Target: 4,500 kbps CBR</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {telemetryData[telemetryData.length - 1]?.bitrate || 4512} kbps
            </div>
            <p className="text-[#888888] mt-1">-bufsize 9000k constraint</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-base text-white">Encoding Speed</CardTitle>
            <CardDescription>Real-time factor</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#3B82F6]">1.00x</div>
            <p className="text-[#888888] mt-1">GOP size: 60 frames (2.0s)</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4 text-[#FF5A1F]" /> Bitrate CBR Stability Graph
            </CardTitle>
            <CardDescription className="text-xs">
              30-second window of FFmpeg encoding bitrate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BitrateChart data={telemetryData} height={260} />
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="h-4 w-4 text-[#10B981]" /> Framerate (FPS) Synchronization
            </CardTitle>
            <CardDescription className="text-xs">
              Real-time FPS tracking against 30.0 FPS target line
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FpsChart data={telemetryData} height={260} />
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}
