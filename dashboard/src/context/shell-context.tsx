"use client"

import * as React from "react"
import { useLiveTelemetry, AlertItem } from "@/hooks/use-live-telemetry"

// ─── Types ───────────────────────────────────────────────────────────────────

interface ShellContextValue {
  // Sidebar
  sidebarCollapsed: boolean
  toggleSidebar: () => void
  setSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>

  // Global system status (for the persistent header)
  cpuPercent: number
  criticalAlertCount: number
  wsConnected: boolean
  systemHealthScore: number
  liveChannelCount: number
  totalChannelCount: number
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ShellContext = React.createContext<ShellContextValue | null>(null)

// ─── Provider ────────────────────────────────────────────────────────────────

export function ShellProvider({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false)

  // Single telemetry instance shared across the global shell
  // Individual pages may run their own instance for richer data
  const { data, connected, systemHealth, alerts } = useLiveTelemetry(30)

  const cpuPercent = data[data.length - 1]?.cpu ?? systemHealth.cpu
  const criticalAlertCount = alerts.filter(
    (a: AlertItem) => a.level === "CRITICAL"
  ).length

  const toggleSidebar = React.useCallback(() => {
    setSidebarCollapsed((prev) => !prev)
  }, [])

  const value: ShellContextValue = React.useMemo(() => ({
    sidebarCollapsed,
    setSidebarCollapsed,
    toggleSidebar,
    cpuPercent,
    criticalAlertCount,
    wsConnected: connected,
    systemHealthScore: systemHealth.healthScore,
    liveChannelCount: 1,
    totalChannelCount: 2,
  }), [sidebarCollapsed, toggleSidebar, cpuPercent, criticalAlertCount, connected, systemHealth.healthScore])

  return <ShellContext.Provider value={value}>{children}</ShellContext.Provider>
}

// ─── Consumer Hook ────────────────────────────────────────────────────────────

export function useShell(): ShellContextValue {
  const ctx = React.useContext(ShellContext)
  if (!ctx) {
    throw new Error("useShell() must be called within <ShellProvider>.")
  }
  return ctx
}
