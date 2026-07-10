"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Activity,
  RotateCcw,
  ListVideo,
  UploadCloud,
  HardDrive,
  Plug,
  Radio,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Info,
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ActivityItem } from "@/hooks/use-live-telemetry"

const iconMap: Record<ActivityItem["type"], { icon: React.ReactNode; bg: string; text: string }> = {
  RECOVERY: { icon: <ShieldCheck className="h-4 w-4" />, bg: "bg-[#10B981]/15 border-[#10B981]/30", text: "text-[#10B981]" },
  PLAYLIST: { icon: <ListVideo className="h-4 w-4" />, bg: "bg-[#3B82F6]/15 border-[#3B82F6]/30", text: "text-[#3B82F6]" },
  MEDIA: { icon: <UploadCloud className="h-4 w-4" />, bg: "bg-[#FF5A1F]/15 border-[#FF5A1F]/30", text: "text-[#FF5A1F]" },
  BACKUP: { icon: <HardDrive className="h-4 w-4" />, bg: "bg-[#10B981]/15 border-[#10B981]/30", text: "text-[#10B981]" },
  PLUGIN: { icon: <Plug className="h-4 w-4" />, bg: "bg-[#8B5CF6]/15 border-[#8B5CF6]/30", text: "text-[#8B5CF6]" },
  RESTART: { icon: <RotateCcw className="h-4 w-4" />, bg: "bg-[#F59E0B]/15 border-[#F59E0B]/30", text: "text-[#F59E0B]" },
  CHANNEL: { icon: <Radio className="h-4 w-4" />, bg: "bg-[#FF5A1F]/15 border-[#FF5A1F]/30", text: "text-[#FF5A1F]" },
}

export function RecentActivityFeed({ activities = [] }: { activities?: ActivityItem[] }) {
  const [filter, setFilter] = React.useState<"all" | "warning" | "success" | "info">("all")

  const filtered = activities.filter((a) => {
    if (filter === "all") return true
    return a.status === filter
  })

  return (
    <Card className="glass-card flex flex-col justify-between h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-[#1C1C1C]">
        <div>
          <CardTitle className="text-base font-bold text-white flex items-center gap-2">
            <Activity className="h-4 w-4 text-[#FF5A1F]" /> Recent Operational Activity
          </CardTitle>
          <CardDescription className="text-xs">
            Real-time audit log of worker lifecycles, media imports, and supervisor events
          </CardDescription>
        </div>

        <div className="flex items-center gap-1 bg-[#090909] p-1 rounded-lg border border-[#1C1C1C] font-mono text-[11px]">
          {(["all", "success", "warning", "info"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-2 py-0.5 rounded capitalize transition-all ${
                filter === tab
                  ? "bg-[#FF5A1F] text-white font-bold"
                  : "text-[#888888] hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-3 max-h-[380px] overflow-y-auto scrollbar-thin">
        <AnimatePresence initial={false}>
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-xs text-[#888888] font-mono">
              No activity logs matching current filter.
            </div>
          ) : (
            filtered.map((item) => {
              const cfg = iconMap[item.type]
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="p-3 rounded-xl bg-[#090909] border border-[#1C1C1C] hover:border-[#1C1C1C]/80 flex items-start gap-3.5 transition-all group font-sans text-xs"
                >
                  <div className={`p-2 rounded-xl border ${cfg.bg} ${cfg.text} shrink-0 mt-0.5`}>
                    {cfg.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-white truncate group-hover:text-[#FF5A1F] transition-colors">
                        {item.title}
                      </span>
                      <span className="text-[10px] font-mono text-[#888888] flex items-center gap-1 shrink-0">
                        <Clock className="h-2.5 w-2.5" /> {item.timestamp}
                      </span>
                    </div>
                    <p className="text-[#888888] text-xs mt-1 leading-relaxed font-mono">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              )
            })
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
