"use client"

import * as React from "react"
import Link from "next/link"
import { Tv, Activity, Zap, Radio, PlusCircle, ArrowRight, Layers, ShieldCheck } from "lucide-react"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useLiveTelemetry } from "@/hooks/use-live-telemetry"
import { BitrateChart, FpsChart } from "@/components/telemetry/telemetry-charts"

export default function StreamsPage() {
  const { data: telemetryData } = useLiveTelemetry(30)

  return (
    <DashboardShell>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] flex items-center gap-2">
            <Tv className="h-6 w-6 text-[#FF5A1F]" /> Live Streams &amp; Encoding Telemetry
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Real-time FFmpeg `-f concat` supervisor progress, GOP synchronization, and bitrate/FPS stability graphs.
          </p>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-center">
          <Badge variant="online" className="px-3 py-1 text-xs font-mono">
            FULL CBR SYNCHRONIZED
          </Badge>
          <Link href="/onboarding">
            <Button size="sm" className="bg-[#FF5A1F] hover:bg-[#E04D14] text-white font-bold gap-2 shadow-lg shadow-[#FF5A1F]/20">
              <PlusCircle className="h-4 w-4" /> New 24/7 Playlist Stream
            </Button>
          </Link>
        </div>
      </div>

      {/* Prominent Setup Wizard Quick-Launch Banner */}
      <Card className="rounded-2xl border border-[var(--border-subtle)] bg-gradient-to-r from-[var(--bg-card)] via-[var(--bg-elevated)] to-[#FF5A1F]/10 overflow-hidden shadow-xl">
        <div className="p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-[#FF5A1F]/40 text-[#FF5A1F] bg-[#FF5A1F]/10 font-mono text-xs">
                V2 PLAYLIST-FIRST WORKFLOW
              </Badge>
              <span className="text-xs font-mono text-[var(--text-muted)]">• Zero API Keys Required</span>
            </div>
            <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
              Need to launch another continuous 24/7 lo-fi or broadcast loop?
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">
              Use our interactive 8-step wizard to choose your destination, configure infinite playlist looping (`Repeat Forever`), validate file health (`Codec H.264/AAC`), and spin up dedicated background workers in clicks.
            </p>
          </div>

          <Link href="/onboarding" className="shrink-0 w-full md:w-auto">
            <Button size="lg" className="w-full md:w-auto bg-[var(--text-primary)] text-[var(--bg-canvas)] hover:opacity-90 font-bold px-6 py-6 rounded-xl shadow-lg transition-transform hover:scale-[1.02] flex items-center justify-center gap-2">
              Launch Setup Wizard <ArrowRight className="h-5 w-5 text-[#FF5A1F]" />
            </Button>
          </Link>
        </div>
      </Card>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-base text-[var(--text-primary)] flex items-center justify-between">
              <span>Stream FPS</span>
              <ShieldCheck className="h-4 w-4 text-[#10B981]" />
            </CardTitle>
            <CardDescription className="text-[var(--text-muted)]">Target: 60.00 / 30.00 FPS</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#10B981]">
              {telemetryData[telemetryData.length - 1]?.fps.toFixed(1) || "60.0"} / 60
            </div>
            <p className="text-[var(--text-secondary)] mt-1">0 dropped frames last 24h (100% Health)</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-base text-[var(--text-primary)] flex items-center justify-between">
              <span>Encoding Bitrate</span>
              <Radio className="h-4 w-4 text-[#FF5A1F] animate-pulse" />
            </CardTitle>
            <CardDescription className="text-[var(--text-muted)]">Target: 6,000 kbps CBR</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[var(--text-primary)]">
              {telemetryData[telemetryData.length - 1]?.bitrate || 6012} kbps
            </div>
            <p className="text-[var(--text-secondary)] mt-1">-bufsize 12000k constraint</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-base text-[var(--text-primary)] flex items-center justify-between">
              <span>Active Playlist Pipeline</span>
              <Layers className="h-4 w-4 text-[#3B82F6]" />
            </CardTitle>
            <CardDescription className="text-[var(--text-muted)]">Loop #14 Active</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#3B82F6]">1.00x Speed</div>
            <p className="text-[var(--text-secondary)] mt-1">Auto-skip corrupt files ON</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-[var(--text-primary)]">
              <Activity className="h-4 w-4 text-[#FF5A1F]" /> Bitrate CBR Stability Graph
            </CardTitle>
            <CardDescription className="text-xs text-[var(--text-secondary)]">
              30-second window of FFmpeg encoding bitrate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BitrateChart data={telemetryData} height={260} />
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-[var(--text-primary)]">
              <Zap className="h-4 w-4 text-[#10B981]" /> Framerate (FPS) Synchronization
            </CardTitle>
            <CardDescription className="text-xs text-[var(--text-secondary)]">
              Real-time FPS tracking against target line
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
