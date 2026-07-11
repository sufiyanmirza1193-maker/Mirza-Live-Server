"use client"

import * as React from "react"
import { ResponsiveContainer } from "recharts"
import { useHydrationGuard } from "@/hooks/use-hydration-guard"

export interface BaseChartProps {
  height?: number
  children: React.ReactNode
}

export const COMMON_TOOLTIP_STYLE: React.CSSProperties = {
  backgroundColor: "var(--bg-card)",
  borderColor: "var(--border-default)",
  borderRadius: "8px",
  fontSize: "12px",
  fontFamily: "monospace",
  color: "var(--text-primary)",
}

/**
 * BaseTelemetryChart
 * 
 * Reusable Recharts wrapper handling standard height, ResponsiveContainer sizing,
 * SSR/CSR hydration safety (`useHydrationGuard`), and fallback loading skeleton.
 */
export const BaseTelemetryChart = React.memo(function BaseTelemetryChart({
  height = 240,
  children,
}: BaseChartProps) {
  const isMounted = useHydrationGuard()

  if (!isMounted) {
    return (
      <div
        style={{ height }}
        className="w-full rounded-xl bg-[var(--bg-elevated)]/40 border border-[var(--border-subtle)] animate-pulse flex items-center justify-center text-xs font-mono text-[var(--text-muted)]"
      >
        <span>Loading Telemetry Canvas...</span>
      </div>
    )
  }

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  )
})
