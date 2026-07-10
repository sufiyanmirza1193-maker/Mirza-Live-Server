"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Radio, Plus, Play, Square, RotateCcw, Sliders, ShieldAlert, Eye } from "lucide-react"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function ChannelsPage() {
  const router = useRouter()

  return (
    <DashboardShell>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1C1C1C] pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Radio className="h-6 w-6 text-[#FF5A1F]" /> Multi-Channel Orchestration Fleet
          </h1>
          <p className="text-sm text-[#888888] mt-1">
            Supervise, provision, and configure isolated FFmpeg streaming workers across YouTube destinations.
          </p>
        </div>
        <Button variant="glow" size="sm">
          <Plus className="h-4 w-4 mr-1.5" /> Provision Worker
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="glass-card border-[#FF5A1F]/40 shadow-xl flex flex-col justify-between">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge variant="online">ACTIVE WORKER</Badge>
              <span className="text-xs font-mono text-[#10B981]">ID: channel_main</span>
            </div>
            <CardTitle className="mt-2 text-xl">Primary YouTube Stream</CardTitle>
            <CardDescription className="text-xs font-mono">
              rtmp://a.rtmp.youtube.com/live2/••••-••••-••••
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-[#090909] border border-[#1C1C1C]">
                <span className="text-[#888888] block">Resolution</span>
                <span className="text-white font-bold">1920x1080 @ 30 FPS</span>
              </div>
              <div className="p-3 rounded-xl bg-[#090909] border border-[#1C1C1C]">
                <span className="text-[#888888] block">Strict Bitrate</span>
                <span className="text-white font-bold">4,500 kbps CBR</span>
              </div>
              <div className="p-3 rounded-xl bg-[#090909] border border-[#1C1C1C]">
                <span className="text-[#888888] block">Uptime</span>
                <span className="text-[#10B981] font-bold">142h 21m 09s</span>
              </div>
              <div className="p-3 rounded-xl bg-[#090909] border border-[#1C1C1C]">
                <span className="text-[#888888] block">Supervisor Backoff</span>
                <span className="text-white font-bold">0 / 5 Failures</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex gap-2 justify-end border-t border-[#1C1C1C]/60 pt-4">
            <Button
              variant="default"
              size="sm"
              onClick={() => router.push("/channels/channel_main")}
              className="text-xs font-bold"
            >
              <Eye className="h-3.5 w-3.5 mr-1.5" /> Deep-Dive Inspect
            </Button>
            <Button variant="outline" size="sm" className="text-xs">
              <RotateCcw className="h-3.5 w-3.5 mr-1 text-[#FF5A1F]" /> Restart
            </Button>
            <Button variant="destructive" size="sm" className="text-xs">
              <Square className="h-3.5 w-3.5 mr-1 fill-white" /> Stop
            </Button>
          </CardFooter>
        </Card>

        <Card className="glass-card opacity-90 flex flex-col justify-between">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-[#888888]">IDLE STANDBY</Badge>
              <span className="text-xs font-mono text-[#888888]">ID: channel_secondary</span>
            </div>
            <CardTitle className="mt-2 text-xl">Secondary Backup Channel</CardTitle>
            <CardDescription className="text-xs font-mono">
              rtmp://b.rtmp.youtube.com/live2/••••-••••-••••
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-[#090909] border border-[#1C1C1C]">
                <span className="text-[#888888] block">Status</span>
                <span className="text-[#888888] font-bold">Worker Offline</span>
              </div>
              <div className="p-3 rounded-xl bg-[#090909] border border-[#1C1C1C]">
                <span className="text-[#888888] block">Target Bitrate</span>
                <span className="text-white font-bold">3,500 kbps CBR</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex gap-2 justify-end border-t border-[#1C1C1C]/60 pt-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => router.push("/channels/channel_secondary")}
              className="text-xs"
            >
              <Eye className="h-3.5 w-3.5 mr-1.5" /> Inspect Config
            </Button>
            <Button variant="glow" size="sm" className="text-xs">
              <Play className="h-3.5 w-3.5 mr-1 fill-white" /> Launch Standby
            </Button>
          </CardFooter>
        </Card>
      </div>
    </DashboardShell>
  )
}
