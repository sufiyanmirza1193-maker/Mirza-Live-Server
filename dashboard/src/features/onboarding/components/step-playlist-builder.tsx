"use client"

import * as React from "react"
import { Sparkles, Layers, ChevronUp, ChevronDown, Copy, Trash2, Eye, Clock } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useOnboardingWizard } from "@/features/onboarding/context/onboarding-context"

export function StepPlaylistBuilder() {
  const { state, moveVideo, duplicateVideo, removeVideo } = useOnboardingWizard()
  const [previewClip, setPreviewClip] = React.useState<string | null>(null)

  const totalDuration = React.useMemo(() => {
    return state.videos.reduce((acc, v) => acc + v.durationSec, 0)
  }, [state.videos])

  const hours = Math.floor(totalDuration / 3600)
  const minutes = Math.floor((totalDuration % 3600) / 60)
  const seconds = totalDuration % 60

  return (
    <div role="tabpanel" aria-labelledby="step-playlist-builder-heading" className="space-y-6">
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#FF5A1F]">
            <Sparkles className="w-4 h-4" />
            <span>Step 5 of 8</span>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs text-[var(--text-secondary)]">
            <Clock className="w-4 h-4 text-[#FF5A1F]" />
            <span>
              Loop Duration: <strong>{hours}h {minutes}m {seconds}s</strong>
            </span>
          </div>
        </div>
        <h2 id="step-playlist-builder-heading" className="text-2xl md:text-3xl font-black tracking-tight text-[var(--text-primary)]">
          Playlist Sequence Builder
        </h2>
        <p className="text-sm md:text-base text-[var(--text-secondary)]">
          Arrange your broadcast sequence. Reorder clips, duplicate bumpers/station IDs, and preview transitions.
        </p>
      </div>

      <Card className="border-[var(--border-subtle)] bg-[var(--bg-card)] overflow-hidden">
        <CardHeader className="py-3 px-5 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-elevated)]/30">
          <CardTitle className="text-xs font-bold font-mono uppercase text-[var(--text-secondary)] flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-[#FF5A1F]" />
            <span>Broadcast Sequence Order ({state.videos.length} items)</span>
          </CardTitle>
          <Badge className="bg-[#FF5A1F]/10 text-[#FF5A1F] border border-[#FF5A1F]/20 font-mono text-[10px]">
            {state.repeatForever ? "🔄 INFINITE LOOP ON" : "➡️ SINGLE PLAYBACK"}
          </Badge>
        </CardHeader>
        <div className="divide-y divide-[var(--border-subtle)]">
          {state.videos.map((clip, idx) => (
            <div
              key={clip.id}
              className="p-4 flex items-center justify-between gap-4 bg-[var(--bg-card)] hover:bg-[var(--bg-elevated)]/40 transition-colors"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                {/* Index / Drag Handle */}
                <div className="w-8 h-8 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center font-mono font-bold text-xs text-[var(--text-secondary)] shrink-0">
                  #{idx + 1}
                </div>
                <div
                  className="w-1.5 h-8 rounded-full shrink-0"
                  style={{ backgroundColor: clip.color }}
                />
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
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={idx === 0}
                  onClick={() => moveVideo(idx, "up")}
                  aria-label={`Move ${clip.filename} up`}
                  className="h-8 w-8 p-0 text-[var(--text-secondary)] disabled:opacity-30 hover:text-[#FF5A1F]"
                >
                  <ChevronUp className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={idx === state.videos.length - 1}
                  onClick={() => moveVideo(idx, "down")}
                  aria-label={`Move ${clip.filename} down`}
                  className="h-8 w-8 p-0 text-[var(--text-secondary)] disabled:opacity-30 hover:text-[#FF5A1F]"
                >
                  <ChevronDown className="w-4 h-4" />
                </Button>
                <div className="w-px h-5 bg-[var(--border-subtle)] mx-1" />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setPreviewClip(previewClip === clip.id ? null : clip.id)}
                  aria-label={`Preview ${clip.filename}`}
                  className="h-8 px-2.5 text-xs font-mono text-[var(--text-secondary)] hover:text-[#FF5A1F]"
                >
                  <Eye className="w-3.5 h-3.5 mr-1" />
                  {previewClip === clip.id ? "Close" : "Preview"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => duplicateVideo(clip.id)}
                  aria-label={`Duplicate ${clip.filename}`}
                  className="h-8 w-8 p-0 text-[var(--text-secondary)] hover:text-[#FF5A1F]"
                  title="Duplicate Clip"
                >
                  <Copy className="w-3.5 h-3.5" />
                </Button>
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
        </div>
      </Card>

      {previewClip && (
        <Card className="border-[#FF5A1F]/30 bg-[var(--bg-elevated)] p-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-[#FF5A1F] font-bold">🎬 INLINE PREVIEW SIMULATION</span>
            <Button size="sm" variant="ghost" onClick={() => setPreviewClip(null)} className="h-6 px-2 text-xs">
              Close
            </Button>
          </div>
          <div className="aspect-video w-full rounded-xl bg-black/80 border border-[var(--border-subtle)] flex flex-col items-center justify-center text-center p-6 text-white">
            <div className="w-12 h-12 rounded-full bg-[#FF5A1F]/20 text-[#FF5A1F] flex items-center justify-center mb-3 animate-pulse">
              ▶
            </div>
            <p className="font-mono text-sm font-bold">Previewing: {state.videos.find((v) => v.id === previewClip)?.filename}</p>
            <p className="text-xs text-neutral-400 mt-1 font-mono">
              Codec: H.264 High Profile • Audio: AAC 48kHz Stereo • 60.00 FPS
            </p>
          </div>
        </Card>
      )}
    </div>
  )
}
