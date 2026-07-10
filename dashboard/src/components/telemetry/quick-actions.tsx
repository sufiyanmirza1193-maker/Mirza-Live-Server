"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import {
  Play,
  Square,
  RotateCcw,
  UploadCloud,
  ListVideo,
  Calendar,
  HardDrive,
  Terminal,
  Zap,
  ChevronRight,
} from "lucide-react"
import { Card } from "@/components/ui/card"

export interface QuickActionItem {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  color: string
  borderColor: string
  onClick?: () => void
  href?: string
}

export function QuickActionsSection({
  onStartAll,
  onStopAll,
  onRestartMain,
}: {
  onStartAll?: () => void
  onStopAll?: () => void
  onRestartMain?: () => void
}) {
  const router = useRouter()

  const actions: QuickActionItem[] = [
    {
      id: "start-stream",
      title: "Start Stream",
      description: "Initialize RTMP ingest handshake for channel_main (`-bufsize 9000k`)",
      icon: <Play className="h-5 w-5 text-[#10B981] fill-[#10B981]/20" />,
      color: "bg-[#10B981]/15 text-[#10B981]",
      borderColor: "hover:border-[#10B981]/50",
      onClick: onStartAll || (() => router.push("/streams")),
    },
    {
      id: "stop-stream",
      title: "Stop Stream",
      description: "Gracefully terminate FFmpeg encoding worker via `SIGTERM` signal",
      icon: <Square className="h-5 w-5 text-[#E53935] fill-[#E53935]/20" />,
      color: "bg-[#E53935]/15 text-[#E53935]",
      borderColor: "hover:border-[#E53935]/50",
      onClick: onStopAll || (() => router.push("/streams")),
    },
    {
      id: "restart-worker",
      title: "Restart Worker",
      description: "Perform sub-second worker pipeline restart and lock re-acquisition",
      icon: <RotateCcw className="h-5 w-5 text-[#FF5A1F]" />,
      color: "bg-[#FF5A1F]/15 text-[#FF5A1F]",
      borderColor: "hover:border-[#FF5A1F]/50",
      onClick: onRestartMain || (() => router.push("/channels")),
    },
    {
      id: "upload-media",
      title: "Upload Media",
      description: "Import MP4/MKV video assets with automatic `ffprobe` header validation",
      icon: <UploadCloud className="h-5 w-5 text-[#3B82F6]" />,
      color: "bg-[#3B82F6]/15 text-[#3B82F6]",
      borderColor: "hover:border-[#3B82F6]/50",
      href: "/media",
    },
    {
      id: "create-playlist",
      title: "Create Playlist",
      description: "Assemble drag-and-drop sequence loops and generate Windows `concat.txt`",
      icon: <ListVideo className="h-5 w-5 text-[#F59E0B]" />,
      color: "bg-[#F59E0B]/15 text-[#F59E0B]",
      borderColor: "hover:border-[#F59E0B]/50",
      href: "/playlists",
    },
    {
      id: "scheduler",
      title: "Scheduler",
      description: "Schedule automated recurring broadcast start/stop events (`cron`)",
      icon: <Calendar className="h-5 w-5 text-[#8B5CF6]" />,
      color: "bg-[#8B5CF6]/15 text-[#8B5CF6]",
      borderColor: "hover:border-[#8B5CF6]/50",
      href: "/scheduler",
    },
    {
      id: "backup",
      title: "Backup Config",
      description: "Create snapshot (`config.yaml.bak`) and export current configuration state",
      icon: <HardDrive className="h-5 w-5 text-[#10B981]" />,
      color: "bg-[#10B981]/15 text-[#10B981]",
      borderColor: "hover:border-[#10B981]/50",
      href: "/settings",
    },
    {
      id: "logs",
      title: "System Logs",
      description: "Open live tailing console for `mirza.log` and multi-threaded stderr output",
      icon: <Terminal className="h-5 w-5 text-[#FF5A1F]" />,
      color: "bg-[#FF5A1F]/15 text-[#FF5A1F]",
      borderColor: "hover:border-[#FF5A1F]/50",
      href: "/logs",
    },
  ]

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-mono font-bold tracking-wider text-[#888888] uppercase flex items-center gap-2">
          <Zap className="h-4 w-4 text-[#FF5A1F]" /> Enterprise Quick Actions Grid
        </h2>
        <span className="text-xs font-mono text-[#888888]">
          1-Click Operations &amp; System Provisioning
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((act) => (
          <motion.div
            key={act.id}
            whileHover={{ y: -3 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <Card
              onClick={() => {
                if (act.onClick) act.onClick()
                else if (act.href) router.push(act.href)
              }}
              className={`glass-card glass-card-hover p-4 cursor-pointer flex flex-col justify-between h-36 ${act.borderColor} group relative overflow-hidden transition-all`}
            >
              <div className="flex items-start justify-between z-10">
                <div className={`p-2.5 rounded-xl border border-white/5 ${act.color}`}>
                  {act.icon}
                </div>
                <div className="h-7 w-7 rounded-lg bg-[#090909] border border-[#1C1C1C] flex items-center justify-center text-[#888888] group-hover:text-white group-hover:border-[#FF5A1F]/50 transition-colors">
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>

              <div className="z-10 mt-3">
                <h3 className="text-sm font-bold text-white tracking-tight font-sans group-hover:text-[#FF5A1F] transition-colors">
                  {act.title}
                </h3>
                <p className="text-[11px] text-[#888888] font-mono mt-1 line-clamp-2 leading-relaxed">
                  {act.description}
                </p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
