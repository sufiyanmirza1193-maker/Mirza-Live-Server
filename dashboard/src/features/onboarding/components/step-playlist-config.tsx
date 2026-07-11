"use client"

import * as React from "react"
import { Sparkles, ListVideo, RefreshCw, ShieldCheck } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { useOnboardingWizard } from "@/features/onboarding/context/onboarding-context"

export function StepPlaylistConfig() {
  const {
    state,
    setPlaylistName,
    setPlaylistDesc,
    setThumbnailUrl,
    setRepeatForever,
    setShuffle,
    setAutoSkipCorrupt,
    setContinueOnError,
  } = useOnboardingWizard()

  return (
    <div role="tabpanel" aria-labelledby="step-playlist-config-heading" className="space-y-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-sm font-semibold text-[#FF5A1F]">
          <Sparkles className="w-4 h-4" />
          <span>Step 3 of 8</span>
        </div>
        <h2 id="step-playlist-config-heading" className="text-2xl md:text-3xl font-black tracking-tight text-[var(--text-primary)]">
          Create Playlist
        </h2>
        <p className="text-sm md:text-base text-[var(--text-secondary)]">
          Define your 24/7 autonomous loop metadata and progression policies.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-5">
          <Card className="border-[var(--border-subtle)] bg-[var(--bg-card)]">
            <CardHeader className="pb-3 border-b border-[var(--border-subtle)]">
              <CardTitle className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                <ListVideo className="w-4 h-4 text-[#FF5A1F]" />
                <span>Playlist Metadata</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="playlist-name-input" className="text-xs font-semibold text-[var(--text-secondary)] uppercase font-mono tracking-wider">
                  Playlist Name
                </label>
                <input
                  id="playlist-name-input"
                  type="text"
                  value={state.playlistName}
                  onChange={(e) => setPlaylistName(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-primary)] font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="playlist-desc-input" className="text-xs font-semibold text-[var(--text-secondary)] uppercase font-mono tracking-wider">
                  Description
                </label>
                <textarea
                  id="playlist-desc-input"
                  rows={2}
                  value={state.playlistDesc}
                  onChange={(e) => setPlaylistDesc(e.target.value)}
                  className="w-full p-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-primary)] text-xs focus:outline-none focus:ring-2 focus:ring-[#FF5A1F] resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="thumbnail-url-input" className="text-xs font-semibold text-[var(--text-secondary)] uppercase font-mono tracking-wider">
                  Cover Thumbnail URL (Optional)
                </label>
                <input
                  id="thumbnail-url-input"
                  type="text"
                  value={state.thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-primary)] font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Toggles */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border-[var(--border-subtle)] bg-[var(--bg-card)]">
            <CardHeader className="pb-3 border-b border-[var(--border-subtle)]">
              <CardTitle className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-[#FF5A1F]" />
                <span>Loop Behavioral Rules</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {[
                {
                  id: "repeat-forever",
                  label: "Repeat Forever (Infinite Loop)",
                  desc: "Automatically restart playlist at item #1 seamlessly when sequence finishes.",
                  state: state.repeatForever,
                  toggle: () => setRepeatForever(!state.repeatForever),
                },
                {
                  id: "shuffle-playlist",
                  label: "Shuffle Playback Order",
                  desc: "Randomize video sequence for viewers on every loop cycle.",
                  state: state.shuffle,
                  toggle: () => setShuffle(!state.shuffle),
                },
                {
                  id: "auto-skip-corrupt",
                  label: "Auto Skip Corrupt Files",
                  desc: "If an MP4 has broken atoms or missing keyframes, jump directly to next item instantly.",
                  state: state.autoSkipCorrupt,
                  toggle: () => setAutoSkipCorrupt(!state.autoSkipCorrupt),
                },
                {
                  id: "continue-on-error",
                  label: "Continue On Error",
                  desc: "Never stop encoder supervisor during network packet drops or RTMP hiccups.",
                  state: state.continueOnError,
                  toggle: () => setContinueOnError(!state.continueOnError),
                },
              ].map((item) => (
                <div
                  key={item.id}
                  onClick={item.toggle}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      item.toggle()
                    }
                  }}
                  tabIndex={0}
                  role="checkbox"
                  aria-checked={item.state}
                  className="p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/50 cursor-pointer flex items-start justify-between gap-3 hover:border-[#FF5A1F]/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A1F]"
                >
                  <div>
                    <p className="text-xs font-bold text-[var(--text-primary)]">{item.label}</p>
                    <p className="text-[11px] text-[var(--text-muted)] mt-0.5 leading-snug">{item.desc}</p>
                  </div>
                  <div
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors shrink-0 ${
                      item.state ? "bg-[#FF5A1F]" : "bg-[var(--border-subtle)]"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                        item.state ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
