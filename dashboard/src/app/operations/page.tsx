"use client"

import * as React from "react"
import Link from "next/link"
import { Activity, BarChart2, Terminal, AlertTriangle, ArrowRight } from "lucide-react"
import { DashboardShell } from "@/components/layout/dashboard-shell"

const SUB_SECTIONS = [
  {
    id: "analytics",
    title: "Analytics",
    description: "Historical performance charts and audience metrics",
    icon: BarChart2,
    href: "/analytics",
    color: "#3B82F6",
  },
  {
    id: "logs",
    title: "System Logs",
    description: "Real-time FFmpeg stderr and supervisor audit trail",
    icon: Terminal,
    href: "/logs",
    color: "#22C55E",
  },
  {
    id: "notifications",
    title: "Incidents",
    description: "Alert history, recovery events, and triage center",
    icon: AlertTriangle,
    href: "/notifications",
    color: "#F59E0B",
  },
]

export default function OperationsPage() {
  return (
    <DashboardShell>
      {/* Page Header */}
      <div className="flex items-start gap-4 pb-8 border-b border-[#1A1A1A]">
        <div className="h-10 w-10 rounded-xl bg-[#111111] border border-[#1A1A1A] flex items-center justify-center shrink-0">
          <Activity className="h-5 w-5 text-[#FF5A1F]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#F2F2F2] tracking-tight">Operations Center</h1>
          <p className="text-sm text-[#5A5A5A] mt-1">
            Deep observability — performance history, live log tailing, and incident review.
          </p>
        </div>
      </div>

      {/* Current sections */}
      <div className="space-y-3">
        <p className="text-xs font-mono text-[#3A3A3A] uppercase tracking-wider">
          Available Now
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {SUB_SECTIONS.map((section) => {
            const Icon = section.icon
            return (
              <Link key={section.id} href={section.href}>
                <div className="glass-card glass-card-hover rounded-2xl p-5 cursor-pointer group">
                  <div
                    className="h-9 w-9 rounded-xl flex items-center justify-center mb-4"
                    style={{
                      backgroundColor: `${section.color}12`,
                      border: `1px solid ${section.color}25`,
                    }}
                  >
                    <Icon className="h-5 w-5" style={{ color: section.color }} />
                  </div>
                  <h3 className="text-sm font-semibold text-[#F2F2F2] group-hover:text-[#FF5A1F] transition-colors">
                    {section.title}
                  </h3>
                  <p className="text-xs text-[#5A5A5A] mt-1 leading-relaxed">
                    {section.description}
                  </p>
                  <div className="flex items-center gap-1 mt-4 text-xs font-mono text-[#3A3A3A] group-hover:text-[#FF5A1F] transition-colors">
                    <span>Open</span>
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Upcoming */}
      <div className="mt-6 p-6 rounded-2xl bg-[#111111] border border-[#1A1A1A] border-dashed">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-[10px] font-mono font-bold text-[#FF5A1F] bg-[#FF5A1F]/10 border border-[#FF5A1F]/20 px-2 py-0.5 rounded-md uppercase tracking-wider">
            Milestone 5
          </span>
          <span className="text-xs text-[#5A5A5A] font-mono">Coming soon</span>
        </div>
        <h3 className="text-sm font-semibold text-[#F2F2F2]">
          Full-Width Operations Surface
        </h3>
        <p className="text-xs text-[#5A5A5A] mt-1.5 leading-relaxed max-w-lg">
          Time-range selectable multi-metric charts (1h / 6h / 24h / 7d), real-time log console 
          with channel and level filtering, crash frequency heatmap, and mean time to recovery dashboard.
        </p>
      </div>
    </DashboardShell>
  )
}
