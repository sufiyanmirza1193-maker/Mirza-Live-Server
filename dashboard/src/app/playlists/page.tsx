"use client"

import * as React from "react"
import { ListVideo, Plus } from "lucide-react"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PlaylistBuilder } from "@/components/playlists/playlist-builder"

export default function PlaylistsPage() {
  return (
    <DashboardShell>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1C1C1C] pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <ListVideo className="h-6 w-6 text-[#FF5A1F]" /> Interactive Playlist &amp; Concat Builder
          </h1>
          <p className="text-sm text-[#888888] mt-1">
            Drag and drop video clips to reorder loop sequences and verify exact Windows FFmpeg `-f concat` file syntax.
          </p>
        </div>
        <Badge variant="online" className="self-start sm:self-center">
          AUTO-LOOPING ACTIVE
        </Badge>
      </div>

      <PlaylistBuilder />
    </DashboardShell>
  )
}
