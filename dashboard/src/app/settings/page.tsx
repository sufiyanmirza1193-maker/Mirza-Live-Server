"use client"

import * as React from "react"
import { Settings, Save, Lock, Sliders, Shield, CheckCircle2, Sparkles, Layers, Moon, Sun } from "lucide-react"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { useTheme } from "@/context/theme-context"
import { useWorkspace } from "@/context/workspace-context"
import { cn } from "@/lib/utils"

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { activeWorkspace } = useWorkspace()
  const [saved, setSaved] = React.useState(false)
  const [bitrate, setBitrate] = React.useState("4500")
  const [maxRetries, setMaxRetries] = React.useState("5")

  return (
    <DashboardShell>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] flex items-center gap-2">
            <Settings className="h-6 w-6 text-[#FF5A1F]" /> OS Settings &amp; Configuration (`config.yaml`)
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Configure interface aesthetics, Pydantic validation boundaries, and supervisor exponential backoff caps.
          </p>
        </div>
        <Button
          variant="glow"
          size="sm"
          onClick={() => {
            setSaved(true)
            setTimeout(() => setSaved(false), 2500)
          }}
        >
          {saved ? (
            <>
              <CheckCircle2 className="h-4 w-4 mr-1.5 text-white" /> Saved to config.yaml!
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-1.5" /> Save Configuration
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-mono text-xs">
        {/* Interface Theme & OS Mode */}
        <Card className="glass-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base text-[var(--text-primary)] flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#FF5A1F]" /> Operating System Theme & Display Engine
            </CardTitle>
            <CardDescription className="text-xs text-[var(--text-secondary)]">
              Switch between Obsidian Dark, Engineering Light, and signature Apple Vision Pro / Vercel Frosted Glass mode.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 font-sans text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {(
                [
                  { id: "dark", title: "Obsidian Dark", desc: "High contrast solid black (#090909)", icon: Moon },
                  { id: "light", title: "Engineering Light", desc: "Crisp white & gray high visibility", icon: Sun },
                  { id: "glass", title: "Transparent Glass", desc: "Signature frosted depth + orange ambient glow", icon: Sparkles },
                ] as const
              ).map((m) => {
                const Icon = m.icon
                const isActive = theme === m.id
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setTheme(m.id)}
                    className={cn(
                      "p-4 rounded-xl border text-left transition-all flex flex-col justify-between h-28",
                      isActive
                        ? "bg-[#FF5A1F]/10 border-[#FF5A1F] ring-1 ring-[#FF5A1F]/50 shadow-md"
                        : "bg-[var(--bg-surface)] border-[var(--border-subtle)] hover:border-[var(--border-default)]"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <Icon className={cn("w-5 h-5", isActive ? "text-[#FF5A1F]" : "text-[var(--text-muted)]")} />
                      {isActive && (
                        <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-[#FF5A1F] text-white">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[var(--text-primary)]">{m.title}</div>
                      <div className="text-[10px] text-[var(--text-muted)] mt-0.5">{m.desc}</div>
                    </div>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Global Video & Audio Encoding Defaults */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-base text-[var(--text-primary)] flex items-center gap-2">
              <Sliders className="h-4 w-4 text-[#FF5A1F]" /> Global Video &amp; Audio Encoding Defaults
            </CardTitle>
            <CardDescription className="text-xs text-[var(--text-secondary)]">
              Strict CBR parameters verified by Pydantic models (`src/mirza/config/models.py`)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 font-sans text-sm">
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[var(--text-muted)]">Video Resolution Mask</label>
              <Input defaultValue="1920x1080" className="bg-[var(--bg-base)] border-[var(--border-subtle)] text-[var(--text-primary)]" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[var(--text-muted)]">Target Framerate (FPS)</label>
              <Input type="number" defaultValue="30" className="bg-[var(--bg-base)] border-[var(--border-subtle)] text-[var(--text-primary)]" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[var(--text-muted)]">Video Bitrate (Kbps)</label>
              <Input
                type="number"
                value={bitrate}
                onChange={(e) => setBitrate(e.target.value)}
                className="bg-[var(--bg-base)] border-[var(--border-subtle)] text-[var(--text-primary)]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[var(--text-muted)]">FFmpeg Encoder Preset</label>
              <Input defaultValue="veryfast" className="bg-[var(--bg-base)] border-[var(--border-subtle)] text-[var(--text-primary)]" />
            </div>
          </CardContent>
        </Card>

        {/* Supervisor Recovery Policy */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-base text-[var(--text-primary)] flex items-center gap-2">
              <Shield className="h-4 w-4 text-[#10B981]" /> Supervisor Recovery &amp; Backoff Policy
            </CardTitle>
            <CardDescription className="text-xs text-[var(--text-secondary)]">
              Automated exponential backoff timing (`2^n`) for network interruptions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 font-sans text-sm">
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[var(--text-muted)]">Max Consecutive Restart Attempts</label>
              <Input
                type="number"
                value={maxRetries}
                onChange={(e) => setMaxRetries(e.target.value)}
                className="bg-[var(--bg-base)] border-[var(--border-subtle)] text-[var(--text-primary)]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[var(--text-muted)]">Base Backoff Seconds (2^n)</label>
              <Input type="number" defaultValue="2" className="bg-[var(--bg-base)] border-[var(--border-subtle)] text-[var(--text-primary)]" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[var(--text-muted)]">Max Backoff Cap (Seconds)</label>
              <Input type="number" defaultValue="60" className="bg-[var(--bg-base)] border-[var(--border-subtle)] text-[var(--text-primary)]" />
            </div>
            <Separator className="my-2 bg-[var(--border-subtle)]" />
            <div className="flex items-center justify-between text-xs font-mono text-[var(--text-muted)]">
              <span>Active Workspace Lock</span>
              <span className="text-[#10B981] font-bold">{activeWorkspace?.name} · LOCKED</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}
