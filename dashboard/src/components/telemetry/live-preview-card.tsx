"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Tv, Radio, Eye, Activity, Clock, ShieldCheck, Maximize2, Grid, Volume2 } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export interface StreamPreviewProps {
  channelId: string
  title: string
  currentMedia: string
  elapsedSeconds: number
  viewers: number
  bitrate: number
  qualityScore: number // e.g. 100%
  rtmpUrl: string
}

function LiveStreamPreviewSectionComponent({
  streams = [
    {
      channelId: "channel_main",
      title: "Mirza Primary YouTube Broadcast (24/7 Lo-Fi)",
      currentMedia: "ep_102_lofi_mix.mp4",
      elapsedSeconds: 4462,
      viewers: 1420,
      bitrate: 6012,
      qualityScore: 100,
      rtmpUrl: "rtmp://a.rtmp.youtube.com/live2/xxxx-••••",
    },
    {
      channelId: "channel_secondary",
      title: "Mirza Backup Stream (1080p60 Mirror)",
      currentMedia: "ep_103_chill_study_session.mp4",
      elapsedSeconds: 1840,
      viewers: 312,
      bitrate: 4500,
      qualityScore: 99,
      rtmpUrl: "rtmp://b.rtmp.youtube.com/live2/yyyy-••••",
    },
  ],
}: {
  streams?: StreamPreviewProps[]
}) {
  const [gridMode, setGridMode] = React.useState<"single" | "multi">("single")
  const [activeStreamIndex, setActiveStreamIndex] = React.useState(0)
  const [timerTick, setTimerTick] = React.useState(0)
  // Mount guard — prevents hydration mismatch on time-sensitive values
  const [isMounted, setIsMounted] = React.useState(false)
  // Pre-computed waveform values — NEVER call Math.random() during render
  const [waveHeights, setWaveHeights] = React.useState<number[]>(Array.from({ length: 32 }, () => 40))
  const [waveDurations, setWaveDurations] = React.useState<number[]>(Array.from({ length: 32 }, () => 1.5))

  React.useEffect(() => {
    setIsMounted(true)
    // Only generate random values after mount, safely on the client
    setWaveHeights(Array.from({ length: 32 }, () => Math.random() * 80 + 20))
    setWaveDurations(Array.from({ length: 32 }, () => 1.2 + Math.random()))
  }, [])

  React.useEffect(() => {
    const i = setInterval(() => setTimerTick((t) => t + 1), 1000)
    return () => clearInterval(i)
  }, [])

  const formatElapsed = (baseSeconds: number) => {
    const total = baseSeconds + timerTick
    const hrs = Math.floor(total / 3600)
    const mins = Math.floor((total % 3600) / 60)
    const secs = total % 60
    return `${hrs > 0 ? hrs.toString().padStart(2, "0") + ":" : ""}${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }
  // Safe to render only after mount — returns stable placeholder during SSR
  const renderElapsed = (baseSeconds: number) =>
    isMounted ? formatElapsed(baseSeconds) : "--:--:--"

  // Simulated Playlist Progress inside active loop (e.g., 02:14:10 / 04:12:30 = ~53%)
  const clipCurrentSec = Math.floor((4462 + timerTick) % 4512)
  const clipProgressPct = Math.min(100, Math.round((clipCurrentSec / 4512) * 100))

  const displayedStreams = (gridMode === "single" ? [streams[activeStreamIndex] || streams[0]] : streams).filter(
    (s): s is StreamPreviewProps => Boolean(s)
  )

  return (
    <Card className="glass-card overflow-hidden">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#10B981] animate-ping" />
            <span className="text-[11px] font-mono font-bold text-[#10B981] uppercase tracking-wider">
              MISSION CONTROL • ACTIVE PLAYLIST PIPELINE (`1Hz SUPERVISOR`)
            </span>
          </div>
          <CardTitle className="text-lg font-bold text-[var(--text-primary)] mt-1 flex items-center gap-2">
            <Tv className="h-5 w-5 text-[#FF5A1F]" /> Autonomous 24/7 Playlist Broadcast Monitor
          </CardTitle>
          <CardDescription className="text-xs text-[var(--text-secondary)]">
            Real-time FFmpeg `-f concat` sequence inspection, audio/video synchronization, and worker health metrics
          </CardDescription>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          {gridMode === "single" && streams.length > 1 && (
            <div className="flex bg-[var(--bg-elevated)] p-1 rounded-lg border border-[var(--border-subtle)] text-xs font-mono">
              {streams.map((s, idx) => (
                <button
                  key={s.channelId}
                  onClick={() => setActiveStreamIndex(idx)}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    activeStreamIndex === idx
                      ? "bg-[#FF5A1F] text-white font-bold"
                      : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {s.channelId === "channel_main" ? "CH 1 (Main)" : "CH 2 (Backup)"}
                </button>
              ))}
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setGridMode(gridMode === "single" ? "multi" : "single")}
            className="text-xs font-mono h-8 border-[var(--border-subtle)]"
          >
            <Grid className="h-3.5 w-3.5 mr-1.5 text-[#FF5A1F]" />
            {gridMode === "single" ? "Multi-View (2x Grid)" : "Single View"}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4 bg-[var(--bg-card)]/60">
        <div className={`grid gap-4 ${gridMode === "multi" ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"}`}>
          {displayedStreams.map((stream) => (
            <motion.div
              key={stream.channelId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] overflow-hidden flex flex-col group shadow-xl"
            >
              {/* Video Player Preview Canvas */}
              <div className="relative w-full aspect-video bg-[#060606] overflow-hidden flex items-center justify-center border-b border-[var(--border-subtle)]">
                {/* Simulated dynamic video waveform & background ambience */}
                <div className="absolute inset-0 bg-gradient-to-tr from-[#090909] via-[#16101c] to-[#1f100a] opacity-80 animate-pulse" />
                
                <div className="absolute inset-0 flex items-center justify-center gap-1.5 opacity-25 group-hover:opacity-50 transition-opacity">
                  {Array.from({ length: 32 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-1.5 bg-[#FF5A1F] rounded-full"
                      animate={{ height: [20, waveHeights[i] ?? 40, 20] }}
                      transition={{ duration: waveDurations[i] ?? 1.5, repeat: Infinity, ease: "easeInOut" }}
                    />
                  ))}
                </div>

                {/* Top-Left Overlays: LIVE Badge + Channel Title */}
                <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
                  <Badge variant="online" className="px-2.5 py-0.5 text-xs tracking-wider font-mono shadow-lg">
                    <Radio className="h-3 w-3 mr-1 animate-pulse" /> LIVE
                  </Badge>
                  <span className="text-xs font-bold text-white bg-[#090909]/80 px-2.5 py-1 rounded-lg border border-[#1C1C1C] backdrop-blur-sm truncate max-w-[220px] sm:max-w-sm">
                    {stream.title}
                  </span>
                </div>

                {/* Top-Right Overlays: Resolution & Audio icon */}
                <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
                  <span className="text-[10px] font-mono font-bold text-white bg-[#090909]/80 px-2 py-1 rounded border border-[#1C1C1C]">
                    1080p60 NVENC
                  </span>
                  <div className="p-1 rounded bg-[#090909]/80 border border-[#1C1C1C] text-[#10B981]">
                    <Volume2 className="h-3.5 w-3.5" />
                  </div>
                </div>

                {/* Center active playlist playback state */}
                <div className="z-10 text-center space-y-2 p-6 max-w-xl mx-auto">
                  <div className="h-14 w-14 rounded-2xl bg-[#FF5A1F]/20 border border-[#FF5A1F]/40 flex items-center justify-center mx-auto shadow-2xl">
                    <Tv className="h-7 w-7 text-[#FF5A1F]" />
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono text-[#10B981] border-[#10B981]/40 bg-[#090909]/80">
                    CURRENT VIDEO • LOOP #14 ACTIVE
                  </Badge>
                  <span className="text-base sm:text-lg font-bold text-white block truncate px-4">{stream.currentMedia}</span>
                  <span className="text-xs font-mono text-[#888888] block">
                    Up Next: <strong className="text-[#F5F5F5]">ep_103_chill_study_session.mp4</strong>
                  </span>
                </div>

                {/* Bottom Bar inside preview: Playlist Progress bar & RTMP destination */}
                <div className="absolute bottom-0 left-0 right-0 bg-[#090909]/90 border-t border-[#1C1C1C] p-2.5 z-10 space-y-1.5 backdrop-blur-md">
                  <div className="flex items-center justify-between text-[11px] font-mono text-[#888888] px-1">
                    <span>Playlist Progress ({clipProgressPct}%)</span>
                    <span className="text-[#10B981] font-bold">
                      {isMounted ? `${formatElapsed(clipCurrentSec)} / 01:15:12` : "--:-- / --:--"}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[#1F1F1F] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#FF5A1F] to-[#10B981] transition-all duration-300" style={{ width: `${clipProgressPct}%` }} />
                  </div>
                </div>
              </div>

              {/* High-Density Mission Control Active Playlist Metrics Grid */}
              <div className="p-3.5 grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono text-xs bg-[var(--bg-elevated)] border-t border-[var(--border-subtle)]">
                <div className="p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] flex flex-col justify-between">
                  <span className="text-[var(--text-muted)] text-[10px] flex items-center gap-1 uppercase">
                    <Activity className="h-3 w-3 text-[#FF5A1F]" /> Bitrate
                  </span>
                  <span className="text-sm font-bold text-[var(--text-primary)] mt-1">{stream.bitrate} Kbps</span>
                  <span className="text-[9px] text-[var(--text-muted)]">-bufsize 12000k</span>
                </div>

                <div className="p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] flex flex-col justify-between">
                  <span className="text-[var(--text-muted)] text-[10px] flex items-center gap-1 uppercase">
                    <Clock className="h-3 w-3 text-[#10B981]" /> Elapsed Time
                  </span>
                  <span className="text-sm font-bold text-[#10B981] mt-1">{renderElapsed(stream.elapsedSeconds)}</span>
                  <span className="text-[9px] text-[var(--text-muted)]">Continuous 24/7</span>
                </div>

                <div className="p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] flex flex-col justify-between">
                  <span className="text-[var(--text-muted)] text-[10px] flex items-center gap-1 uppercase">
                    <Eye className="h-3 w-3 text-[#3B82F6]" /> Loop Count
                  </span>
                  <span className="text-sm font-bold text-[var(--text-primary)] mt-1">Loop #14</span>
                  <span className="text-[9px] text-[#3B82F6]">Repeat Forever</span>
                </div>

                <div className="p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] flex flex-col justify-between">
                  <span className="text-[var(--text-muted)] text-[10px] flex items-center gap-1 uppercase">
                    <Tv className="h-3 w-3 text-[#F59E0B]" /> FPS &amp; Drops
                  </span>
                  <span className="text-sm font-bold text-[var(--text-primary)] mt-1">60.0 FPS</span>
                  <span className="text-[9px] text-[#10B981]">0 dropped (0.00%)</span>
                </div>

                <div className="p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] flex flex-col justify-between col-span-2 sm:col-span-1">
                  <span className="text-[var(--text-muted)] text-[10px] flex items-center gap-1 uppercase">
                    <ShieldCheck className="h-3 w-3 text-[#10B981]" /> Worker Health
                  </span>
                  <span className="text-sm font-bold text-[#10B981] mt-1">OPTIMAL 100%</span>
                  <span className="text-[9px] text-[var(--text-muted)] truncate">worker_us_east_1</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export const LiveStreamPreviewSection = React.memo(LiveStreamPreviewSectionComponent)
