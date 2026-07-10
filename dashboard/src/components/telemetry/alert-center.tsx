"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import {
  AlertTriangle,
  ShieldAlert,
  Info,
  CheckCircle2,
  RotateCcw,
  EyeOff,
  Terminal,
  ExternalLink,
  Bell,
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertItem } from "@/hooks/use-live-telemetry"

export function AlertCenterPanel({
  alerts = [],
  onDismiss,
  onResolve,
}: {
  alerts?: AlertItem[]
  onDismiss?: (id: string) => void
  onResolve?: (id: string) => void
}) {
  const router = useRouter()
  const [tab, setTab] = React.useState<"ALL" | "CRITICAL" | "WARNING" | "INFORMATION" | "RESOLVED">("ALL")

  const filtered = alerts.filter((a) => {
    if (tab === "ALL") return true
    return a.level === tab
  })

  const getBadgeStyle = (level: AlertItem["level"]) => {
    switch (level) {
      case "CRITICAL":
        return "bg-[#E53935]/20 text-[#E53935] border-[#E53935]/40"
      case "WARNING":
        return "bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/40"
      case "INFORMATION":
        return "bg-[#3B82F6]/20 text-[#3B82F6] border-[#3B82F6]/40"
      case "RESOLVED":
        return "bg-[#10B981]/20 text-[#10B981] border-[#10B981]/40"
    }
  }

  const getIcon = (level: AlertItem["level"]) => {
    switch (level) {
      case "CRITICAL":
        return <ShieldAlert className="h-4 w-4 text-[#E53935]" />
      case "WARNING":
        return <AlertTriangle className="h-4 w-4 text-[#F59E0B]" />
      case "INFORMATION":
        return <Info className="h-4 w-4 text-[#3B82F6]" />
      case "RESOLVED":
        return <CheckCircle2 className="h-4 w-4 text-[#10B981]" />
    }
  }

  return (
    <Card className="glass-card flex flex-col justify-between h-full">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1C1C1C]">
        <div>
          <CardTitle className="text-base font-bold text-white flex items-center gap-2">
            <Bell className="h-4 w-4 text-[#FF5A1F]" /> Enterprise Alert Center
            <Badge variant="outline" className="ml-1 text-[10px] font-mono">
              {alerts.filter((a) => a.level !== "RESOLVED").length} Active
            </Badge>
          </CardTitle>
          <CardDescription className="text-xs">
            Automated FFmpeg stderr and supervisor exception triage with 1-click remediation actions
          </CardDescription>
        </div>

        <div className="flex flex-wrap items-center gap-1 bg-[#090909] p-1 rounded-lg border border-[#1C1C1C] font-mono text-[10px]">
          {(["ALL", "CRITICAL", "WARNING", "INFORMATION", "RESOLVED"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-2 py-1 rounded transition-all ${
                tab === t
                  ? "bg-[#FF5A1F] text-white font-bold"
                  : "text-[#888888] hover:text-white"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-3 max-h-[380px] overflow-y-auto scrollbar-thin">
        <AnimatePresence initial={false}>
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-xs text-[#888888] font-mono">
              Zero active alerts matching level `{tab}`. System operating normally.
            </div>
          ) : (
            filtered.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="p-3.5 rounded-xl bg-[#090909] border border-[#1C1C1C] space-y-3 font-sans text-xs group hover:border-[#1C1C1C]/80 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    {getIcon(item.level)}
                    <span className="font-bold text-white truncate text-sm">
                      {item.title}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${getBadgeStyle(item.level)}`}>
                      {item.level}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[#888888] shrink-0">
                    {item.time}
                  </span>
                </div>

                <p className="text-[#888888] text-xs font-mono pl-6 leading-relaxed">
                  {item.message}
                </p>

                {/* Remediation Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#1C1C1C]/60 pl-6 font-mono text-xs">
                  <div className="flex items-center gap-2">
                    {item.workerId && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/channels/${item.workerId}`)}
                        className="h-7 px-2.5 text-[11px]"
                      >
                        <RotateCcw className="h-3 w-3 mr-1 text-[#FF5A1F]" /> Restart Worker
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push("/logs")}
                      className="h-7 px-2.5 text-[11px] text-[#888888] hover:text-white"
                    >
                      <Terminal className="h-3 w-3 mr-1" /> Open Logs
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push("/notifications")}
                      className="h-7 px-2.5 text-[11px] text-[#888888] hover:text-white"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" /> View Details
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.level !== "RESOLVED" && onResolve && (
                      <button
                        onClick={() => onResolve(item.id)}
                        className="text-[11px] text-[#10B981] hover:underline flex items-center gap-1 font-bold"
                      >
                        <CheckCircle2 className="h-3 w-3" /> Mark Resolved
                      </button>
                    )}
                    {onDismiss && (
                      <button
                        onClick={() => onDismiss(item.id)}
                        className="text-[11px] text-[#666666] hover:text-[#E53935] flex items-center gap-1 transition-colors"
                      >
                        <EyeOff className="h-3 w-3" /> Ignore
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
