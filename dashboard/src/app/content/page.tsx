"use client"

import * as React from "react"
import Link from "next/link"
import { Layers, FolderOpen, ListVideo, Calendar, ArrowRight } from "lucide-react"
import { DashboardShell } from "@/components/layout/dashboard-shell"

const SUB_SECTIONS = [
  {
    id: "media",
    title: "Media Library",
    description: "Upload, validate, and organize your video assets",
    icon: FolderOpen,
    href: "/media",
    color: "#FF5A1F",
  },
  {
    id: "playlists",
    title: "Playlists",
    description: "Build and sequence your broadcast playlists",
    icon: ListVideo,
    href: "/playlists",
    color: "#3B82F6",
  },
  {
    id: "scheduler",
    title: "Scheduler",
    description: "Automate broadcast schedules with cron expressions",
    icon: Calendar,
    href: "/scheduler",
    color: "#8B5CF6",
  },
]

export default function ContentStudioPage() {
  return (
    <DashboardShell>
      {/* Page Header */}
      <div className="flex items-start gap-4 pb-8 border-b border-[var(--border-subtle)]">
        <div className="h-11 w-11 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center shrink-0 shadow-sm">
          <Layers className="h-5.5 w-5.5 text-[#FF5A1F]" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-[var(--text-primary)] tracking-tight">Content Studio</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1.5 font-medium max-w-2xl leading-relaxed">
            Unified content management — media library, playlists, and broadcast scheduling.
          </p>
        </div>
      </div>

      {/* Current sections */}
      <div className="space-y-4 pt-2">
        <p className="text-xs font-mono font-bold text-[var(--text-secondary)] uppercase tracking-wider">
          Available Now (`Content Centers`)
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {SUB_SECTIONS.map((section) => {
            const Icon = section.icon
            return (
              <Link key={section.id} href={section.href}>
                <div className="glass-card rounded-2xl p-6 cursor-pointer group border border-[var(--border-subtle)] bg-[var(--bg-card)] shadow-[var(--card-shadow)] hover:border-[#FF5A1F]/50 transition-all duration-200">
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-105"
                    style={{
                      backgroundColor: `${section.color}18`,
                      border: `1px solid ${section.color}35`,
                    }}
                  >
                    <Icon className="h-5 w-5" style={{ color: section.color }} />
                  </div>
                  <h3 className="text-base font-bold text-[var(--text-primary)] group-hover:text-[#FF5A1F] transition-colors">
                    {section.title}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed">
                    {section.description}
                  </p>
                  <div className="flex items-center gap-1.5 mt-5 text-xs font-mono font-semibold text-[var(--text-secondary)] group-hover:text-[#FF5A1F] transition-colors">
                    <span>Launch Studio</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Upcoming unified experience */}
      <div className="mt-8 p-6 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] border-dashed shadow-xs">
        <div className="flex items-center gap-3 mb-2.5">
          <span className="text-[10px] font-mono font-bold text-[#FF5A1F] bg-[var(--primary-surface)] border border-[#FF5A1F]/30 px-2.5 py-0.5 rounded-md uppercase tracking-wider">
            Milestone 4 Preview
          </span>
          <span className="text-xs text-[var(--text-muted)] font-mono">In Active Engineering</span>
        </div>
        <h3 className="text-base font-bold text-[var(--text-primary)]">
          Three-Panel Unified Experience Studio
        </h3>
        <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed max-w-xl">
          Drag-and-drop media browser alongside real-time playlist timeline editor and live RTMP preview monitor. Integrated directly into the core supervisor pipeline.
        </p>
      </div>
    </DashboardShell>
  )
}
