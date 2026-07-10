"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import {
  Radio,
  RotateCcw,
  Eye,
  Activity,
  Cpu,
  Database,
  Network,
  ShieldCheck,
  Tv,
  Play,
  AlertTriangle,
  Square,
  CheckCircle2,
  Settings,
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export type WorkerStatus = "LIVE" | "IDLE" | "ERROR" | "RECOVERING" | "OFFLINE"

export interface WorkerCardProps {
  id: string
  name: string
  rtmpUrl: string
  status: WorkerStatus
  currentVideo: string
  viewers: number
  bitrate: number
  fps: number
  resolution: string
  cpuUsage: number
  ramUsage: number
  networkSpeed: number
  healthScore: number
  thumbnailUrl?: string
  onRestart?: (id: string) => void
  onStop?: (id: string) => void
  onStart?: (id: string) => void
  onSettings?: (id: string) => void
}

const statusConfig: Record<
  WorkerStatus,
  { label: string; badgeStyle: string; borderStyle: string; icon: React.ReactNode }
> = {
  LIVE: {
    label: "LIVE",
    badgeStyle: "bg-[#10B981]/20 text-[#10B981] border-[#10B981]/40 animate-pulse",
    borderStyle: "border-[#1C1C1C] hover:border-[#FF5A1F]/50",
    icon: <Radio className="h-3.5 w-3.5 text-[#10B981] animate-pulse" />,
  },
  IDLE: {
    label: "IDLE STANDBY",
    badgeStyle: "bg-[#888888]/20 text-[#888888] border-[#888888]/40",
    borderStyle: "border-[#1C1C1C] opacity-90 hover:opacity-100",
    icon: <CheckCircle2 className="h-3.5 w-3.5 text-[#888888]" />,
  },
  ERROR: {
    label: "ERROR",
    badgeStyle: "bg-[#E53935]/20 text-[#E53935] border-[#E53935]/40",
    borderStyle: "border-[#E53935]/60 shadow-[0_0_20px_rgba(229,57,53,0.2)]",
    icon: <AlertTriangle className="h-3.5 w-3.5 text-[#E53935]" />,
  },
  RECOVERING: {
    label: "RECOVERING",
    badgeStyle: "bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/40 animate-pulse",
    borderStyle: "border-[#F59E0B]/60",
    icon: <RotateCcw className="h-3.5 w-3.5 text-[#F59E0B] animate-spin" />,
  },
  OFFLINE: {
    label: "OFFLINE",
    badgeStyle: "bg-[#181818] text-[#666666] border-[#1C1C1C]",
    borderStyle: "border-[#1C1C1C] opacity-75 hover:opacity-95",
    icon: <Square className="h-3.5 w-3.5 text-[#666666]" />,
  },
}

export function WorkerCard({
  id,
  name,
  rtmpUrl,
  status,
  currentVideo,
  viewers,
  bitrate,
  fps,
  resolution,
  cpuUsage,
  ramUsage,
  networkSpeed,
  healthScore,
  onRestart,
  onStop,
  onStart,
  onSettings,
}: WorkerCardProps) {
  const router = useRouter()
  const cfg = statusConfig[status]

  return (
    <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}>
      <Card className={`glass-card flex flex-col justify-between overflow-hidden shadow-xl ${cfg.borderStyle} group`}>
        {/* Channel Thumbnail Header Banner */}
        <div className="relative w-full h-32 bg-[#050505] border-b border-[#1C1C1C] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-[#090909] via-[#111111] to-[#20100a] opacity-85 group-hover:scale-105 transition-transform duration-500" />
          
          <div className="z-10 flex items-center gap-3.5 px-5 w-full justify-between">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-[#090909] border border-[#1C1C1C] flex items-center justify-center shadow-lg group-hover:border-[#FF5A1F]/50 transition-colors">
                <Tv className="h-5 w-5 text-[#FF5A1F]" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-white tracking-tight leading-none group-hover:text-[#FF5A1F] transition-colors">
                  {name}
                </CardTitle>
                <span className="text-[11px] font-mono text-[#888888] block mt-1">
                  Worker ID: <span className="text-[#F5F5F5] font-bold">{id}</span>
                </span>
              </div>
            </div>

            <Badge variant="outline" className={`px-3 py-1 text-[10px] font-mono font-bold flex items-center gap-1.5 shadow-md shrink-0 ${cfg.badgeStyle}`}>
              {cfg.icon}
              {cfg.label}
            </Badge>
          </div>

          <div className="absolute bottom-2.5 left-4 right-4 flex items-center justify-between z-10 text-[10px] font-mono text-[#888888] bg-[#090909]/85 px-3 py-1 rounded-lg border border-[#1C1C1C]">
            <span className="truncate max-w-[200px] sm:max-w-[260px] text-[#888888]">{rtmpUrl}</span>
            <span className="font-bold text-[#10B981] shrink-0 flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" /> Health: {healthScore}/100
            </span>
          </div>
        </div>

        {/* Card Content: High Density Metric Grid with Clean Spacing */}
        <CardContent className="p-5 space-y-4 font-mono text-xs">
          <div className="p-3 rounded-xl bg-[#090909] border border-[#1C1C1C] flex justify-between items-center font-sans">
            <span className="text-[#888888] text-xs">Current Active Media Loop</span>
            <span className="text-white font-bold text-xs font-mono truncate max-w-[190px] sm:max-w-[240px]">
              {currentVideo || "No active media in queue"}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-2.5 rounded-xl bg-[#090909] border border-[#1C1C1C] hover:border-[#1C1C1C]/80 transition-colors">
              <span className="text-[9px] text-[#888888] block uppercase font-bold tracking-wider">Concurrent Viewers</span>
              <span className="text-sm font-bold text-[#3B82F6] mt-0.5 block">{viewers.toLocaleString()}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#090909] border border-[#1C1C1C] hover:border-[#1C1C1C]/80 transition-colors">
              <span className="text-[9px] text-[#888888] block uppercase font-bold tracking-wider">Bitrate (`-maxrate`)</span>
              <span className="text-sm font-bold text-white mt-0.5 block">{bitrate} kbps</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#090909] border border-[#1C1C1C] hover:border-[#1C1C1C]/80 transition-colors">
              <span className="text-[9px] text-[#888888] block uppercase font-bold tracking-wider">Framerate (FPS)</span>
              <span className="text-sm font-bold text-[#10B981] mt-0.5 block">{fps.toFixed(1)}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#090909] border border-[#1C1C1C] hover:border-[#1C1C1C]/80 transition-colors">
              <span className="text-[9px] text-[#888888] block uppercase font-bold tracking-wider">Resolution Sync</span>
              <span className="text-sm font-bold text-white mt-0.5 block">{resolution}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center pt-1">
            <div className="p-2.5 rounded-xl bg-[#090909]/80 border border-[#1C1C1C] flex items-center justify-center gap-2 text-xs">
              <Cpu className="h-3.5 w-3.5 text-[#3B82F6]" />
              <span className="text-[#888888]">CPU:</span>
              <span className="text-white font-bold">{cpuUsage}%</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#090909]/80 border border-[#1C1C1C] flex items-center justify-center gap-2 text-xs">
              <Database className="h-3.5 w-3.5 text-[#10B981]" />
              <span className="text-[#888888]">RAM:</span>
              <span className="text-white font-bold">{ramUsage}%</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#090909]/80 border border-[#1C1C1C] flex items-center justify-center gap-2 text-xs">
              <Network className="h-3.5 w-3.5 text-[#FF5A1F]" />
              <span className="text-[#888888]">Net:</span>
              <span className="text-white font-bold">{networkSpeed} Mb/s</span>
            </div>
          </div>
        </CardContent>

        {/* Card Footer: Remediation & Deep-Dive Actions */}
        <CardFooter className="p-5 pt-0 flex flex-wrap gap-2.5 justify-end bg-[#111111]/40 border-t border-[#1C1C1C]/50 mt-1">
          {status !== "LIVE" && status !== "RECOVERING" && onStart && (
            <Button
              variant="glow"
              size="sm"
              onClick={() => onStart(id)}
              className="text-xs font-bold h-9 px-3.5"
            >
              <Play className="h-3.5 w-3.5 mr-1.5 fill-white" /> Start Worker
            </Button>
          )}

          {(status === "LIVE" || status === "ERROR" || status === "RECOVERING") && onRestart && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRestart(id)}
              className="text-xs h-9 px-3 border-[#1C1C1C] hover:border-[#FF5A1F]/50"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1.5 text-[#FF5A1F]" /> Restart
            </Button>
          )}

          {(status === "LIVE" || status === "RECOVERING") && onStop && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onStop(id)}
              className="text-xs h-9 px-3"
            >
              <Square className="h-3.5 w-3.5 mr-1.5 fill-white" /> Stop
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (onSettings) onSettings(id)
              else router.push(`/channels/${id}`)
            }}
            className="text-xs h-9 px-3 text-[#888888] hover:text-white border border-[#1C1C1C] bg-[#090909]"
          >
            <Settings className="h-3.5 w-3.5 mr-1.5 text-[#888888]" /> Quick Settings
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={() => router.push(`/channels/${id}`)}
            className="text-xs font-bold h-9 px-4 bg-[#FF5A1F] hover:bg-[#FF5A1F]/90 text-white"
          >
            <Eye className="h-3.5 w-3.5 mr-1.5" /> Open Dashboard
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

