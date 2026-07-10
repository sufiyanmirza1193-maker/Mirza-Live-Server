"use client"

import * as React from "react"
import Link from "next/link"
import { Layers, FolderOpen, ListVideo, Calendar, ArrowRight } from "lucide-react"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { cn } from "@/lib/utils"

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
      <div className="flex items-start gap-4 pb-8 border-b border-[#1A1A1A]">
        <div className="h-10 w-10 rounded-xl bg-[#111111] border border-[#1A1A1A] flex items-center justify-center shrink-0">
          <Layers className="h-5 w-5 text-[#FF5A1F]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#F2F2F2] tracking-tight">Content Studio</h1>
          <p className="text-sm text-[#5A5A5A] mt-1">
            Unified content management — media library, playlists, and broadcast scheduling.
          </p>
        </div>
      </div>

      {/* Current sections (accessible during build-out) */}
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

      {/* Upcoming unified experience */}
      <div className="mt-6 p-6 rounded-2xl bg-[#111111] border border-[#1A1A1A] border-dashed">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-[10px] font-mono font-bold text-[#FF5A1F] bg-[#FF5A1F]/10 border border-[#FF5A1F]/20 px-2 py-0.5 rounded-md uppercase tracking-wider">
            Milestone 4
          </span>
          <span className="text-xs text-[#5A5A5A] font-mono">Coming soon</span>
        </div>
        <h3 className="text-sm font-semibold text-[#F2F2F2]">
          Three-Panel Unified Experience
        </h3>
        <p className="text-xs text-[#5A5A5A] mt-1.5 leading-relaxed max-w-lg">
          Folder tree navigation, drag-and-drop media grid, inline ffprobe inspector, 
          playlist builder with visual timeline, and calendar-based scheduler — all in one surface.
        </p>
      </div>
    </DashboardShell>
  )
}
