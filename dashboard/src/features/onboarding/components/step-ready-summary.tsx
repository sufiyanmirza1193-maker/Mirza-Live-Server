"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Sparkles, CheckCircle2, Zap, Radio, Tv } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useOnboardingWizard } from "@/features/onboarding/context/onboarding-context"

export function StepReadySummary() {
  const router = useRouter()
  const { state, resetWizard } = useOnboardingWizard()
  const [isLaunching, setIsLaunching] = React.useState(false)

  const handleLaunchStream = React.useCallback(() => {
    setIsLaunching(true)
    setTimeout(() => {
      resetWizard()
      router.push("/")
    }, 1200)
  }, [resetWizard, router])

  const totalDuration = React.useMemo(() => {
    return state.videos.reduce((acc, v) => acc + v.durationSec, 0)
  }, [state.videos])

  const hours = Math.floor(totalDuration / 3600)
  const minutes = Math.floor((totalDuration % 3600) / 60)
  const seconds = totalDuration % 60

  return (
    <div role="tabpanel" aria-labelledby="step-ready-summary-heading" className="space-y-6">
      <div className="space-y-1 text-center max-w-2xl mx-auto">
        <div className="flex items-center justify-center gap-2 text-sm font-semibold text-[#FF5A1F]">
          <Sparkles className="w-4 h-4" />
          <span>Step 8 of 8 • Pre-Flight Certified</span>
        </div>
        <h2 id="step-ready-summary-heading" className="text-3xl md:text-4xl font-black tracking-tight text-[var(--text-primary)]">
          Ready to Launch 24/7 Broadcast
        </h2>
        <p className="text-sm md:text-base text-[var(--text-secondary)]">
          Your active playlist loop, encoding pipeline, and reconnect policies are locked and certified.
        </p>
      </div>

      <Card className="max-w-3xl mx-auto border-2 border-[#FF5A1F] bg-[var(--bg-card)] shadow-xl shadow-[#FF5A1F]/10 overflow-hidden">
        <div className="bg-[#FF5A1F] px-6 py-3.5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2 font-mono font-bold text-sm">
            <CheckCircle2 className="w-5 h-5" />
            <span>FINAL LAUNCH SUMMARY CARD</span>
          </div>
          <Badge className="bg-black/30 text-white font-mono text-xs border-0">
            AUTONOMOUS PIPE V2
          </Badge>
        </div>
        <CardContent className="p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-mono uppercase text-[var(--text-muted)]">Destination Platform</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="bg-[#FF0000] text-white font-mono font-bold">▶ YouTube Live</Badge>
                  <span className="font-mono text-xs text-[var(--text-secondary)]">({state.rtmpUrl})</span>
                </div>
              </div>

              <div>
                <p className="text-xs font-mono uppercase text-[var(--text-muted)]">Playlist Configuration</p>
                <p className="font-bold text-base text-[var(--text-primary)] mt-0.5">{state.playlistName}</p>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">{state.videos.length} videos • {hours}h {minutes}m {seconds}s continuous loop</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs font-mono uppercase text-[var(--text-muted)]">Hardware Encoding</p>
                <p className="font-mono text-sm font-bold text-[var(--text-primary)] mt-0.5">
                  {state.resolutionSetting} • {state.fpsSetting} FPS • {state.encoderSetting.toUpperCase()}
                </p>
                <p className="text-xs text-[var(--text-secondary)] font-mono mt-0.5">Bitrate: {state.bitrateSetting} Kbps CBR • Audio: {state.audioSetting}</p>
              </div>

              <div>
                <p className="text-xs font-mono uppercase text-[var(--text-muted)]">Behavior & Reconnects</p>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  <Badge variant="outline" className="text-[10px] font-mono border-[var(--border-subtle)]">Repeat: {state.repeatForever ? "Infinite" : "Off"}</Badge>
                  <Badge variant="outline" className="text-[10px] font-mono border-[var(--border-subtle)]">Auto Skip: {state.autoSkipCorrupt ? "Active" : "Off"}</Badge>
                  <Badge variant="outline" className="text-[10px] font-mono border-[var(--border-subtle)]">Policy: {state.reconnectPolicy}</Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-[var(--text-muted)]">
              Clicking Start will spawn the autonomous FFmpeg supervisor process in the background.
            </div>
            <Button
              type="button"
              onClick={handleLaunchStream}
              disabled={isLaunching}
              className="w-full sm:w-auto px-8 h-12 rounded-xl bg-[#FF5A1F] hover:bg-[#FF5A1F]/90 text-white font-bold text-base shadow-lg shadow-[#FF5A1F]/25 flex items-center justify-center gap-2.5 transition-all hover:scale-[1.02]"
            >
              <Zap className={`w-5 h-5 ${isLaunching ? "animate-spin" : "animate-pulse"}`} />
              <span>{isLaunching ? "Starting FFmpeg Pipeline..." : "Start 24/7 Stream"}</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
