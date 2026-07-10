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

export function LiveStreamPreviewSection({
  streams = [
    {
      channelId: "channel_main",
      title: "Mirza Primary YouTube Broadcast (24/7 Lo-Fi)",
      currentMedia: "ep_102_lofi_mix.mp4",
      elapsedSeconds: 4462,
      viewers: 1420,
      bitrate: 4512,
      qualityScore: 100,
      rtmpUrl: "rtmp://a.rtmp.youtube.com/live2/xxxx-••••",
    },
    {
      channelId: "channel_secondary",
      title: "Mirza Backup Stream (1080p60 Mirror)",
      currentMedia: "ep_103_chill_study_session.mp4",
      elapsedSeconds: 1840,
      viewers: 312,
      bitrate: 3500,
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

  const displayedStreams = (gridMode === "single" ? [streams[activeStreamIndex] || streams[0]] : streams).filter(
    (s): s is StreamPreviewProps => Boolean(s)
  )

  return (
    <Card className="glass-card overflow-hidden">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1C1C1C] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#10B981] animate-ping" />
            <span className="text-[11px] font-mono font-bold text-[#10B981] uppercase tracking-wider">
              REAL-TIME BROADCAST MONITORING
            </span>
          </div>
          <CardTitle className="text-lg font-bold text-white mt-1 flex items-center gap-2">
            <Tv className="h-5 w-5 text-[#FF5A1F]" /> Live Stream Multi-Destination Preview
          </CardTitle>
          <CardDescription className="text-xs">
            Direct RTMP output telemetry and simulated video buffer inspection across active FFmpeg pipelines
          </CardDescription>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          {gridMode === "single" && streams.length > 1 && (
            <div className="flex bg-[#090909] p-1 rounded-lg border border-[#1C1C1C] text-xs font-mono">
              {streams.map((s, idx) => (
                <button
                  key={s.channelId}
                  onClick={() => setActiveStreamIndex(idx)}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    activeStreamIndex === idx
                      ? "bg-[#FF5A1F] text-white font-bold"
                      : "text-[#888888] hover:text-white"
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
            className="text-xs font-mono h-8"
          >
            <Grid className="h-3.5 w-3.5 mr-1.5 text-[#FF5A1F]" />
            {gridMode === "single" ? "Multi-View (2x Grid)" : "Single View"}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4 bg-[#090909]/60">
        <div className={`grid gap-4 ${gridMode === "multi" ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"}`}>
          {displayedStreams.map((stream) => (
            <motion.div
              key={stream.channelId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="rounded-2xl border border-[#1C1C1C] bg-[#111111] overflow-hidden flex flex-col group shadow-xl"
            >
              {/* Video Player Preview Canvas */}
              <div className="relative w-full aspect-video bg-[#050505] overflow-hidden flex items-center justify-center border-b border-[#1C1C1C]">
                {/* Simulated dynamic video waveform & background ambience */}
                <div className="absolute inset-0 bg-gradient-to-tr from-[#090909] via-[#16101c] to-[#1f100a] opacity-80 animate-pulse" />
                
                <div className="absolute inset-0 flex items-center justify-center gap-1.5 opacity-20 group-hover:opacity-40 transition-opacity">
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
                    1080p60 CBR
                  </span>
                  <div className="p-1 rounded bg-[#090909]/80 border border-[#1C1C1C] text-[#10B981]">
                    <Volume2 className="h-3.5 w-3.5" />
                  </div>
                </div>

                {/* Center watermark/logo preview state */}
                <div className="z-10 text-center space-y-1 p-6">
                  <div className="h-14 w-14 rounded-2xl bg-[#FF5A1F]/20 border border-[#FF5A1F]/40 flex items-center justify-center mx-auto shadow-2xl">
                    <Tv className="h-7 w-7 text-[#FF5A1F]" />
                  </div>
                  <span className="text-xs font-mono text-[#888888] block">Active Encoding Pipeline (`-f flv`)</span>
                  <span className="text-sm font-bold text-white block">{stream.currentMedia}</span>
                </div>

                {/* Bottom Bar inside preview: RTMP destination & time */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-10 text-xs font-mono bg-[#090909]/85 px-3 py-1.5 rounded-xl border border-[#1C1C1C] backdrop-blur-md">
                  <div className="flex items-center gap-2 text-[#888888] truncate max-w-[200px] sm:max-w-xs">
                    <span>Dest:</span>
                    <span className="text-[#F5F5F5] truncate">{stream.rtmpUrl}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#10B981] font-bold shrink-0">
                    <Clock className="h-3 w-3" />
                    <span>{renderElapsed(stream.elapsedSeconds)}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Metrics Bar */}
              <div className="p-3.5 grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs bg-[#111111]">
                <div className="p-2.5 rounded-xl bg-[#090909] border border-[#1C1C1C] flex flex-col justify-between">
                  <span className="text-[#888888] text-[10px] flex items-center gap-1">
                    <Eye className="h-3 w-3 text-[#3B82F6]" /> VIEWERS
                  </span>
                  <span className="text-base font-bold text-white mt-1">{stream.viewers.toLocaleString()}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#090909] border border-[#1C1C1C] flex flex-col justify-between">
                  <span className="text-[#888888] text-[10px] flex items-center gap-1">
                    <Activity className="h-3 w-3 text-[#FF5A1F]" /> BITRATE
                  </span>
                  <span className="text-base font-bold text-white mt-1">{stream.bitrate} kbps</span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#090909] border border-[#1C1C1C] flex flex-col justify-between">
                  <span className="text-[#888888] text-[10px] flex items-center gap-1">
                    <Clock className="h-3 w-3 text-[#10B981]" /> ELAPSED TIME
                  </span>
                  <span className="text-base font-bold text-[#10B981] mt-1">{renderElapsed(stream.elapsedSeconds)}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#090909] border border-[#1C1C1C] flex flex-col justify-between">
                  <span className="text-[#888888] text-[10px] flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3 text-[#10B981]" /> QUALITY
                  </span>
                  <span className="text-base font-bold text-[#10B981] mt-1">{stream.qualityScore}% Excellent</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
