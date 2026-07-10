"use client"

import * as React from "react"
import { BarChart2, TrendingUp, Users, Eye } from "lucide-react"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function AnalyticsPage() {
  return (
    <DashboardShell>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1C1C1C] pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <BarChart2 className="h-6 w-6 text-[#FF5A1F]" /> Streaming Analytics &amp; Viewer Telemetry
          </h1>
          <p className="text-sm text-[#888888] mt-1">
            Aggregate YouTube Live API statistics and stream stability metrics over 30 days.
          </p>
        </div>
        <Badge variant="online">YOUTUBE API CONNECTED</Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 font-mono text-xs">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-base text-white">Current Concurrent Viewers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white flex items-center gap-2">
              <Users className="h-6 w-6 text-[#FF5A1F]" /> 1,420
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-base text-white">Total Watch Time (30d)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#10B981]">142,890 hrs</div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-base text-white">Peak Concurrent Viewers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#3B82F6]">3,840</div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-base text-white">Viewer Activity Chart (24h)</CardTitle>
          <CardDescription className="text-xs">
            Hourly telemetry snapshot aggregated from YouTube Live Chat &amp; Broadcast stats
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full rounded-xl bg-[#090909] border border-[#1C1C1C] p-6 flex flex-col justify-end gap-2">
            <div className="flex items-end justify-between gap-2 h-full pb-4 border-b border-[#1C1C1C]/60">
              {[800, 920, 1050, 1200, 1420, 1380, 1500, 1620, 1420, 1350, 1400, 1420].map((val, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    style={{ height: `${(val / 2000) * 100}%` }}
                    className="w-full bg-gradient-to-t from-[#FF5A1F] to-[#10B981] rounded-t-sm"
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between text-[11px] text-[#888888] font-mono">
              <span>00:00</span>
              <span>12:00</span>
              <span>24:00 (NOW)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </DashboardShell>
  )
}
