"use client"

import * as React from "react"
import { Sparkles, Radio, Tv } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useOnboardingWizard } from "@/features/onboarding/context/onboarding-context"

export function StepPlatform() {
  const { state, setPlatform } = useOnboardingWizard()

  return (
    <div role="tabpanel" aria-labelledby="step-platform-heading" className="space-y-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-sm font-semibold text-[#FF5A1F]">
          <Sparkles className="w-4 h-4" />
          <span>Step 1 of 8</span>
        </div>
        <h2 id="step-platform-heading" className="text-2xl md:text-3xl font-black tracking-tight text-[var(--text-primary)]">
          Choose Streaming Platform
        </h2>
        <p className="text-sm md:text-base text-[var(--text-secondary)]">
          Select your destination broadcast platform. Mirza V2 enforces a private, zero-API-key workflow (`Simple • Private • Fast`).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2" role="radiogroup" aria-label="Available streaming platforms">
        {/* YouTube Live */}
        <Card
          onClick={() => setPlatform("youtube")}
          role="radio"
          aria-checked={state.platform === "youtube"}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              setPlatform("youtube")
            }
          }}
          className={`cursor-pointer transition-all border-2 relative overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A1F] focus-visible:ring-offset-2 ${
            state.platform === "youtube"
              ? "border-[#FF5A1F] bg-[#FF5A1F]/[0.04] shadow-md shadow-[#FF5A1F]/10"
              : "border-[var(--border-subtle)] hover:border-[var(--border-default)] bg-[var(--bg-card)]"
          }`}
        >
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-sm ${
                  state.platform === "youtube"
                    ? "bg-[#FF0000] text-white shadow-[#FF0000]/20"
                    : "bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border-subtle)]"
                }`}
              >
                ▶
              </div>
              <Badge
                variant={state.platform === "youtube" ? "default" : "secondary"}
                className={state.platform === "youtube" ? "bg-[#FF5A1F] text-white font-mono" : "font-mono"}
              >
                {state.platform === "youtube" ? "SELECTED (DEFAULT)" : "AVAILABLE"}
              </Badge>
            </div>
            <div>
              <h3 className="font-bold text-lg text-[var(--text-primary)]">YouTube Live</h3>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                Continuous 24/7 RTMP stream to YouTube. High-density bitrate control and zero Google OAuth friction.
              </p>
            </div>
            <div className="pt-2 flex items-center gap-2 text-xs font-mono text-[var(--text-muted)]">
              <span>Protocol: RTMP / RTMPS</span>
              <span>•</span>
              <span>Hardware NVENC</span>
            </div>
          </CardContent>
        </Card>

        {/* Custom RTMP Server */}
        <Card
          onClick={() => setPlatform("custom")}
          role="radio"
          aria-checked={state.platform === "custom"}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              setPlatform("custom")
            }
          }}
          className={`cursor-pointer transition-all border-2 relative overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A1F] focus-visible:ring-offset-2 ${
            state.platform === "custom"
              ? "border-[#FF5A1F] bg-[#FF5A1F]/[0.04] shadow-md shadow-[#FF5A1F]/10"
              : "border-[var(--border-subtle)] hover:border-[var(--border-default)] bg-[var(--bg-card)]"
          }`}
        >
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-sm ${
                  state.platform === "custom"
                    ? "bg-[#FF5A1F] text-white shadow-[#FF5A1F]/20"
                    : "bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border-subtle)]"
                }`}
              >
                <Radio className="w-6 h-6" />
              </div>
              <Badge
                variant={state.platform === "custom" ? "default" : "secondary"}
                className={state.platform === "custom" ? "bg-[#FF5A1F] text-white font-mono" : "font-mono"}
              >
                {state.platform === "custom" ? "SELECTED" : "AVAILABLE"}
              </Badge>
            </div>
            <div>
              <h3 className="font-bold text-lg text-[var(--text-primary)]">Custom RTMP Destination</h3>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                Broadcast to any self-hosted RTMP relay, NGINX ingest, or custom enterprise CDN target.
              </p>
            </div>
            <div className="pt-2 flex items-center gap-2 text-xs font-mono text-[var(--text-muted)]">
              <span>Custom URL</span>
              <span>•</span>
              <span>Multi-codec H.264 / AV1</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Future Platforms */}
      <div className="pt-4 border-t border-[var(--border-subtle)]">
        <div className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] mb-3">
          Coming Soon (Next Minor Release)
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {["Twitch Live (Ingest)", "Kick Streaming", "Facebook Live RTMP"].map((futureName) => (
            <div
              key={futureName}
              className="p-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/50 flex items-center justify-between opacity-60"
            >
              <div className="flex items-center gap-2">
                <Tv className="w-4 h-4 text-[var(--text-muted)]" />
                <span className="text-xs font-semibold text-[var(--text-secondary)]">{futureName}</span>
              </div>
              <Badge variant="outline" className="text-[9px] font-mono border-[var(--border-subtle)]">
                SOON
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
