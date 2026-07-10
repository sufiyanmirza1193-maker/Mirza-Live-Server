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
    borderStyle: "border-[var(--border-subtle)] hover:border-[#FF5A1F]/50",
    icon: <Radio className="h-3.5 w-3.5 text-[#10B981] animate-pulse" />,
  },
  IDLE: {
    label: "IDLE STANDBY",
    badgeStyle: "bg-[#888888]/20 text-[var(--text-secondary)] border-[#888888]/40",
    borderStyle: "border-[var(--border-subtle)] opacity-90 hover:opacity-100",
    icon: <CheckCircle2 className="h-3.5 w-3.5 text-[var(--text-muted)]" />,
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
    badgeStyle: "bg-[var(--bg-elevated)] text-[var(--text-muted)] border-[var(--border-subtle)]",
    borderStyle: "border-[var(--border-subtle)] opacity-75 hover:opacity-95",
    icon: <Square className="h-3.5 w-3.5 text-[var(--text-muted)]" />,
  },
}

function WorkerCardComponent({
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
        <div className="relative w-full h-32 bg-[var(--bg-elevated)] border-b border-[var(--border-subtle)] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-[var(--bg-card)] via-[var(--bg-surface)] to-[var(--primary-surface)] opacity-85 group-hover:scale-105 transition-transform duration-500" />
          
          <div className="z-10 flex items-center gap-3.5 px-5 w-full justify-between">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-center justify-center shadow-lg group-hover:border-[#FF5A1F]/50 transition-colors">
                <Tv className="h-5 w-5 text-[#FF5A1F]" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-[var(--text-primary)] tracking-tight leading-none group-hover:text-[#FF5A1F] transition-colors">
                  {name}
                </CardTitle>
                <span className="text-[11px] font-mono text-[var(--text-secondary)] block mt-1">
                  Worker ID: <span className="text-[var(--text-primary)] font-bold">{id}</span>
                </span>
              </div>
            </div>

            <Badge variant="outline" className={`px-3 py-1 text-[10px] font-mono font-bold flex items-center gap-1.5 shadow-md shrink-0 ${cfg.badgeStyle}`}>
              {cfg.icon}
              {cfg.label}
            </Badge>
          </div>

          <div className="absolute bottom-2.5 left-4 right-4 flex items-center justify-between z-10 text-[10px] font-mono text-[var(--text-secondary)] bg-[var(--bg-card)]/90 px-3 py-1 rounded-lg border border-[var(--border-subtle)] backdrop-blur-md">
            <span className="truncate max-w-[200px] sm:max-w-[260px] text-[var(--text-secondary)]">{rtmpUrl}</span>
            <span className="font-bold text-[#10B981] shrink-0 flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" /> Health: {healthScore}/100
            </span>
          </div>
        </div>

        {/* Card Content: High Density Metric Grid with Clean Spacing */}
        <CardContent className="p-5 space-y-4 font-mono text-xs">
          <div className="p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex justify-between items-center font-sans">
            <span className="text-[var(--text-secondary)] text-xs">Current Active Media Loop</span>
            <span className="text-[var(--text-primary)] font-bold text-xs font-mono truncate max-w-[190px] sm:max-w-[240px]">
              {currentVideo || "No active media in queue"}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--border-default)] transition-colors">
              <span className="text-[9px] text-[var(--text-muted)] block uppercase font-bold tracking-wider">Concurrent Viewers</span>
              <span className="text-sm font-bold text-[#3B82F6] mt-0.5 block">{viewers.toLocaleString()}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--border-default)] transition-colors">
              <span className="text-[9px] text-[var(--text-muted)] block uppercase font-bold tracking-wider">Bitrate (`-maxrate`)</span>
              <span className="text-sm font-bold text-[var(--text-primary)] mt-0.5 block">{bitrate} kbps</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--border-default)] transition-colors">
              <span className="text-[9px] text-[var(--text-muted)] block uppercase font-bold tracking-wider">Framerate (FPS)</span>
              <span className="text-sm font-bold text-[#10B981] mt-0.5 block">{fps.toFixed(1)}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--border-default)] transition-colors">
              <span className="text-[9px] text-[var(--text-muted)] block uppercase font-bold tracking-wider">Resolution Sync</span>
              <span className="text-sm font-bold text-[var(--text-primary)] mt-0.5 block">{resolution}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center pt-1">
            <div className="p-2.5 rounded-xl bg-[var(--bg-elevated)]/80 border border-[var(--border-subtle)] flex items-center justify-center gap-2 text-xs">
              <Cpu className="h-3.5 w-3.5 text-[#3B82F6]" />
              <span className="text-[var(--text-secondary)]">CPU:</span>
              <span className="text-[var(--text-primary)] font-bold">{cpuUsage}%</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[var(--bg-elevated)]/80 border border-[var(--border-subtle)] flex items-center justify-center gap-2 text-xs">
              <Database className="h-3.5 w-3.5 text-[#10B981]" />
              <span className="text-[var(--text-secondary)]">RAM:</span>
              <span className="text-[var(--text-primary)] font-bold">{ramUsage}%</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[var(--bg-elevated)]/80 border border-[var(--border-subtle)] flex items-center justify-center gap-2 text-xs">
              <Network className="h-3.5 w-3.5 text-[#FF5A1F]" />
              <span className="text-[var(--text-secondary)]">Net:</span>
              <span className="text-[var(--text-primary)] font-bold">{networkSpeed} Mb/s</span>
            </div>
          </div>
        </CardContent>

        {/* Card Footer: Remediation & Deep-Dive Actions */}
        <CardFooter className="p-4 pt-3 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)]/30 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            {status !== "LIVE" && status !== "RECOVERING" && onStart && (
              <Button
                variant="glow"
                size="sm"
                onClick={() => onStart(id)}
                className="text-xs font-bold h-9 px-3.5"
              >
                <Play className="h-3.5 w-3.5 mr-1.5 fill-white" /> Start
              </Button>
            )}

            {(status === "LIVE" || status === "ERROR" || status === "RECOVERING") && onRestart && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRestart(id)}
                className="text-xs h-9 px-3 bg-[var(--bg-card)] hover:bg-[var(--bg-elevated)] border-[var(--border-default)]"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1.5 text-[var(--text-secondary)]" /> Restart
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
              variant="outline"
              size="sm"
              onClick={() => onSettings?.(id)}
              className="text-xs h-9 px-3 bg-[var(--bg-card)] hover:bg-[var(--bg-elevated)] border-[var(--border-default)]"
            >
              <Settings className="h-3.5 w-3.5 mr-1.5 text-[var(--text-secondary)]" /> Config
            </Button>
          </div>

          <Button
            size="sm"
            onClick={() => router.push(`/channels/${id}`)}
            className="text-xs font-bold h-9 px-4 bg-[#FF5A1F] hover:bg-[#FF5A1F]/90 text-white shadow-sm shrink-0"
          >
            <Eye className="h-3.5 w-3.5 mr-1.5" /> Open Dashboard
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

export const WorkerCard = React.memo(WorkerCardComponent)
