"use client"

import * as React from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  Zap,
  Command,
  ShieldCheck,
  ShieldAlert,
  Cpu,
  Wifi,
  WifiOff,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useShell } from "@/context/shell-context"
import { ProfileMenu } from "@/components/layout/profile-menu"
import { WorkspaceSwitcher } from "@/components/layout/workspace-switcher"
import { ThemeSelector } from "@/components/layout/theme-selector"

// ─────────────────────────────────────────────────────────────────────────────
// Sub-component: Status Pill
// ─────────────────────────────────────────────────────────────────────────────

function StatusPill({
  href,
  children,
  critical = false,
}: {
  href: string
  children: React.ReactNode
  critical?: boolean
}) {
  return (
    <Link href={href}>
      <div
        className={cn(
          "flex items-center gap-1.5 h-7 px-2.5 rounded-md text-[11px] font-mono font-semibold",
          "bg-[var(--bg-card)] border transition-all duration-200 cursor-pointer",
          "hover:bg-[var(--bg-elevated)] text-[var(--text-primary)]",
          critical
            ? "border-[#EF4444]/30 hover:border-[#EF4444]/50"
            : "border-[var(--border-subtle)] hover:border-[var(--border-default)]"
        )}
      >
        {children}
      </div>
    </Link>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Global Header
// ─────────────────────────────────────────────────────────────────────────────

function GlobalHeaderComponent() {
  const {
    liveChannelCount,
    totalChannelCount,
    criticalAlertCount,
    cpuPercent,
    wsConnected,
  } = useShell()

  const allLive = liveChannelCount === totalChannelCount && totalChannelCount > 0
  const anyLive = liveChannelCount > 0

  const channelColor = allLive
    ? "#22C55E"
    : anyLive
    ? "#F59E0B"
    : "#EF4444"

  const cpuColor =
    cpuPercent < 70 ? "#22C55E" : cpuPercent < 90 ? "#F59E0B" : "#EF4444"

  // Dispatch Ctrl+K to open CommandPalette (it listens via document.addEventListener)
  const openCommandPalette = React.useCallback(() => {
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true })
    )
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-12 flex items-center px-4 gap-3 bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] shadow-[0_1px_12px_rgba(0,0,0,0.03)] backdrop-blur-xl transition-all duration-300">
      {/* ── Signature Mirza Glass Pill Identity ──────────────────────────────── */}
      <Link
        href="/"
        className="flex items-center gap-2 shrink-0 group px-2.5 py-1 rounded-full mirza-glass-pill transition-transform hover:scale-[1.02]"
      >
        <div className="h-5 w-5 rounded-md bg-gradient-to-br from-[#FF5A1F] to-[#CC3E10] flex items-center justify-center shadow-sm shadow-[#FF5A1F]/30">
          <Zap className="h-3 w-3 text-white" />
        </div>
        <div className="flex items-baseline gap-1 font-sans">
          <span className="text-xs font-bold text-[var(--text-primary)] tracking-tight">MIRZA</span>
          <span className="text-[9px] font-mono font-bold text-[#FF5A1F] px-1 rounded bg-[#FF5A1F]/10 border border-[#FF5A1F]/30">
            OS
          </span>
        </div>
      </Link>

      {/* ── Workspace Switcher ────────────────────────────────── */}
      <WorkspaceSwitcher />

      {/* ── Dedicated Theme Switcher ───────────────────────────── */}
      <ThemeSelector />

      {/* ── Divider ───────────────────────────────────────────── */}
      <div className="h-5 w-px bg-[var(--border-subtle)] hidden lg:block" />

      {/* ── Status Pills ──────────────────────────────────────── */}
      <div className="hidden lg:flex items-center gap-2">
        {/* Channels live */}
        <StatusPill href="/channels" critical={!anyLive}>
          <span
            className="h-1.5 w-1.5 rounded-full shrink-0"
            style={{
              backgroundColor: channelColor,
              boxShadow: allLive ? `0 0 5px ${channelColor}` : "none",
            }}
          />
          <span style={{ color: channelColor }}>
            {liveChannelCount}/{totalChannelCount}
          </span>
          <span className="text-[var(--text-muted)]">LIVE</span>
        </StatusPill>

        {/* Alert status */}
        <StatusPill href="/notifications" critical={criticalAlertCount > 0}>
          {criticalAlertCount === 0 ? (
            <>
              <ShieldCheck className="h-3 w-3 text-[#22C55E]" />
              <span className="text-[#22C55E]">Nominal</span>
            </>
          ) : (
            <>
              <ShieldAlert className="h-3 w-3 text-[#EF4444]" />
              <AnimatePresence mode="wait">
                <motion.span
                  key={criticalAlertCount}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  className="text-[#EF4444]"
                >
                  {criticalAlertCount} Critical
                </motion.span>
              </AnimatePresence>
            </>
          )}
        </StatusPill>

        {/* CPU bar */}
        <div className="flex items-center gap-2 h-7 px-2.5 rounded-md text-[11px] font-mono bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)]">
          <Cpu className="h-3 w-3 text-[var(--text-muted)] shrink-0" />
          <div className="flex items-center gap-1.5">
            <div className="w-14 h-1 bg-[var(--border-subtle)] rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: cpuColor }}
                animate={{ width: `${Math.round(cpuPercent)}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
            <span style={{ color: cpuColor }} className="tabular-nums">
              {Math.round(cpuPercent)}%
            </span>
          </div>
        </div>
      </div>

      {/* ── Spacer ────────────────────────────────────────────── */}
      <div className="flex-1" />

      {/* ── WebSocket indicator ───────────────────────────────── */}
      <div
        className={cn(
          "flex items-center gap-1.5 text-[10px] font-mono",
          wsConnected ? "text-[#22C55E]" : "text-[var(--text-muted)]"
        )}
        title={wsConnected ? "Live WebSocket connected" : "Using fallback simulation"}
      >
        {wsConnected ? (
          <Wifi className="h-3 w-3" />
        ) : (
          <WifiOff className="h-3 w-3" />
        )}
        <span className="hidden sm:inline">{wsConnected ? "WS LIVE" : "FALLBACK"}</span>
      </div>

      {/* ── Divider ───────────────────────────────────────────── */}
      <div className="h-5 w-px bg-[var(--border-subtle)]" />

      {/* ── Command Palette trigger ───────────────────────────── */}
      <button
        onClick={openCommandPalette}
        className={cn(
          "hidden sm:flex items-center gap-2 h-7 px-3 rounded-md",
          "text-[11px] font-mono text-[var(--text-muted)] hover:text-[var(--text-primary)]",
          "bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--border-default)]",
          "transition-all duration-150 group shadow-sm"
        )}
        aria-label="Open command palette"
      >
        <Command className="h-3 w-3 shrink-0" />
        <span>Search or run command</span>
        <span className="flex items-center gap-0.5 ml-1 opacity-60">
          <kbd className="px-1 py-0.5 rounded text-[9px] bg-[var(--border-subtle)] border border-[var(--border-default)]">⌘</kbd>
          <kbd className="px-1 py-0.5 rounded text-[9px] bg-[var(--border-subtle)] border border-[var(--border-default)]">K</kbd>
        </span>
      </button>

      {/* ── Mobile ⌘K ─────────────────────────────────────────── */}
      <button
        onClick={openCommandPalette}
        className="sm:hidden flex items-center justify-center h-7 w-7 rounded-md bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--border-default)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all"
        aria-label="Open command palette"
      >
        <Command className="h-3.5 w-3.5" />
      </button>

      {/* ── User Profile Menu ─────────────────────────────────── */}
      <ProfileMenu />
    </header>
  )
}

export const GlobalHeader = React.memo(GlobalHeaderComponent)

