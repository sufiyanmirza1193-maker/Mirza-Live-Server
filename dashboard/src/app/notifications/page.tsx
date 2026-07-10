"use client"

import * as React from "react"
import { Bell, CheckCircle2, AlertTriangle, ShieldAlert, Trash2 } from "lucide-react"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function NotificationsPage() {
  const [alerts, setAlerts] = React.useState([
    {
      id: 1,
      sev: "WARNING",
      title: "Corrupted Media Detected & Auto-Skipped",
      msg: "MediaDetector identified corrupted header in `corrupted_raw_clip_temp.mp4`. File excluded from `playlist.txt`.",
      time: "12m ago",
      resolved: false,
    },
    {
      id: 2,
      sev: "INFO",
      title: "Instance Lock Acquired Successfully",
      msg: "Orchestrator locked `logs/mirza.lock` (PID 14202). No collision detected on Windows OS.",
      time: "4h ago",
      resolved: true,
    },
    {
      id: 3,
      sev: "INFO",
      title: "FFmpeg Worker Auto-Restarted",
      msg: "Supervisor triggered exponential backoff recovery following socket reset. Reconnected in 2.0s.",
      time: "1d ago",
      resolved: true,
    },
  ])

  return (
    <DashboardShell>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] flex items-center gap-2">
            <Bell className="h-6 w-6 text-[#FF5A1F]" /> System Notifications &amp; Alert Center
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Audit log of hardware warnings, automated supervisor recoveries, and security events across all active workspaces.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setAlerts([])} disabled={alerts.length === 0}>
          <Trash2 className="h-4 w-4 mr-1.5" /> Mark All Resolved
        </Button>
      </div>

      <div className="space-y-4 font-mono text-xs">
        {alerts.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center text-[var(--text-muted)] border border-[var(--border-subtle)]">
            <CheckCircle2 className="w-10 h-10 text-[#22C55E] mx-auto mb-3 opacity-80" />
            <div className="text-sm font-bold font-sans text-[var(--text-primary)]">All Telemetry Alerts Resolved</div>
            <div className="text-xs mt-1">No pending warnings or incident logs for your active fleet.</div>
          </div>
        ) : (
          alerts.map((alert) => (
            <Card key={alert.id} className="glass-card">
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div className="flex items-center gap-2">
                  {alert.sev === "WARNING" ? (
                    <AlertTriangle className="h-4 w-4 text-[#F59E0B]" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 text-[#10B981]" />
                  )}
                  <CardTitle className="text-base text-[var(--text-primary)]">{alert.title}</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={alert.sev === "WARNING" ? "warning" : "outline"} className="text-[10px]">
                    {alert.sev}
                  </Badge>
                  <span className="text-[var(--text-muted)]">{alert.time}</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-[var(--text-secondary)] font-sans text-sm">{alert.msg}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </DashboardShell>
  )
}
