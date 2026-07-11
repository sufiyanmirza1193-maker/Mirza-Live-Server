"use client"

import * as React from "react"
import { Sparkles, UploadCloud, FileVideo, Plus, Trash2, ShieldCheck } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useOnboardingWizard } from "@/features/onboarding/context/onboarding-context"

export function StepUploadVideos() {
  const { state, addVideoFile, removeVideo } = useOnboardingWizard()

  return (
    <div role="tabpanel" aria-labelledby="step-upload-videos-heading" className="space-y-6">
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#FF5A1F]">
            <Sparkles className="w-4 h-4" />
            <span>Step 4 of 8</span>
          </div>
          <Badge variant="outline" className="font-mono text-xs text-[var(--text-secondary)] border-[var(--border-subtle)]">
            {state.videos.length} clips queued
          </Badge>
        </div>
        <h2 id="step-upload-videos-heading" className="text-2xl md:text-3xl font-black tracking-tight text-[var(--text-primary)]">
          Upload Videos
        </h2>
        <p className="text-sm md:text-base text-[var(--text-secondary)]">
          Drag & drop MP4/MKV assets or browse local folders. Mirza analyzes codec compatibility (`H.264 / AAC`) directly inside your browser.
        </p>
      </div>

      {/* Upload Box */}
      <div
        tabIndex={0}
        role="button"
        aria-label="Drag and drop MP4 or MKV videos to upload"
        onClick={() => addVideoFile(`ep_${104 + state.videos.length}_synthwave_sunset_${Math.floor(Math.random() * 90 + 10)}.mp4`)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            addVideoFile(`ep_${104 + state.videos.length}_synthwave_sunset_${Math.floor(Math.random() * 90 + 10)}.mp4`)
          }
        }}
        className="border-2 border-dashed border-[var(--border-subtle)] hover:border-[#FF5A1F] bg-[var(--bg-card)]/60 rounded-2xl p-8 md:p-10 text-center cursor-pointer transition-all hover:bg-[#FF5A1F]/[0.02] group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A1F] focus-visible:ring-offset-2"
      >
        <div className="w-14 h-14 rounded-2xl bg-[#FF5A1F]/10 text-[#FF5A1F] flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
          <UploadCloud className="w-7 h-7" />
        </div>
        <h3 className="font-bold text-base md:text-lg text-[var(--text-primary)]">
          Drop video files here, or <span className="text-[#FF5A1F] underline">browse files</span>
        </h3>
        <p className="text-xs text-[var(--text-muted)] mt-1 font-mono">
          Supports MP4, MOV, MKV up to 4K 60FPS • Automatic FFmpeg header verification
        </p>
        <div className="mt-4 flex items-center justify-center gap-2">
          <Badge variant="outline" className="text-[10px] font-mono border-[var(--border-subtle)]">
            Folder Upload Available
          </Badge>
          <Badge variant="outline" className="text-[10px] font-mono border-[var(--border-subtle)] text-emerald-500">
            <ShieldCheck className="w-3 h-3 mr-1 inline" /> Zero Cloud Upload Required (Local Pipe)
          </Badge>
        </div>
      </div>

      {/* Video Table */}
      <Card className="border-[var(--border-subtle)] bg-[var(--bg-card)] overflow-hidden">
        <CardHeader className="py-3 px-5 border-b border-[var(--border-subtle)] flex flex-row items-center justify-between bg-[var(--bg-elevated)]/30">
          <CardTitle className="text-xs font-bold font-mono uppercase text-[var(--text-secondary)]">
            Ingest Queue ({state.videos.length} files)
          </CardTitle>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => addVideoFile(`ep_${104 + state.videos.length}_lofi_bonus_track.mp4`)}
            className="h-8 text-xs font-mono border-[var(--border-subtle)] hover:border-[#FF5A1F] hover:text-[#FF5A1F]"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Add Test Clip
          </Button>
        </CardHeader>
        <div className="divide-y divide-[var(--border-subtle)]">
          {state.videos.map((clip) => (
            <div key={clip.id} className="p-4 flex items-center justify-between gap-4 hover:bg-[var(--bg-elevated)]/30 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
                  style={{ backgroundColor: clip.color }}
                >
                  <FileVideo className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[var(--text-primary)] truncate">{clip.filename}</p>
                  <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[var(--text-muted)] mt-0.5">
                    <span>
                      {Math.floor(clip.durationSec / 60)}m {clip.durationSec % 60}s
                    </span>
                    <span>•</span>
                    <span>{clip.resolution}</span>
                    <span>•</span>
                    <span>{clip.codec}</span>
                    <span>•</span>
                    <span>{clip.fps} FPS</span>
                    <span>•</span>
                    <span>{clip.size}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono text-[10px]">
                  ✓ {clip.status}
                </Badge>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeVideo(clip.id)}
                  aria-label={`Remove ${clip.filename}`}
                  className="h-8 w-8 p-0 text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
          {state.videos.length === 0 && (
            <div className="p-8 text-center text-[var(--text-muted)] font-mono text-xs">
              Queue is empty. Drop files above to populate playlist sequence.
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
