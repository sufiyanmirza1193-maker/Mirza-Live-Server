"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { TrendingUp, TrendingDown, Clock, HelpCircle } from "lucide-react"
import { AreaChart, Area, ResponsiveContainer } from "recharts"
import { Card } from "@/components/ui/card"
import { AnimatedCounter } from "@/components/ui/animated-counter"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export interface StatCardProps {
  title: string
  value: number
  prefix?: string
  suffix?: string
  decimals?: number
  trendPercent?: number
  trendLabel?: string
  statusColor?: "primary" | "success" | "warning" | "info" | "destructive" | "neutral"
  icon: React.ReactNode
  tooltip: string
  lastUpdated?: string
  sparklineData?: { val: number }[]
}

const colorMap = {
  primary: { text: "text-[#FF5A1F]", stroke: "#FF5A1F", fill: "rgba(255, 90, 31, 0.2)", badgeBg: "bg-[#FF5A1F]/10 border-[#FF5A1F]/30" },
  success: { text: "text-[#10B981]", stroke: "#10B981", fill: "rgba(16, 185, 129, 0.2)", badgeBg: "bg-[#10B981]/10 border-[#10B981]/30" },
  warning: { text: "text-[#F59E0B]", stroke: "#F59E0B", fill: "rgba(245, 158, 11, 0.2)", badgeBg: "bg-[#F59E0B]/10 border-[#F59E0B]/30" },
  info: { text: "text-[#3B82F6]", stroke: "#3B82F6", fill: "rgba(59, 130, 246, 0.2)", badgeBg: "bg-[#3B82F6]/10 border-[#3B82F6]/30" },
  destructive: { text: "text-[#E53935]", stroke: "#E53935", fill: "rgba(229, 57, 53, 0.2)", badgeBg: "bg-[#E53935]/10 border-[#E53935]/30" },
  neutral: { text: "text-[var(--text-secondary)]", stroke: "#888888", fill: "rgba(136, 136, 136, 0.15)", badgeBg: "bg-[var(--bg-elevated)] border-[var(--border-subtle)]" },
}

function StatCardComponent({
  title,
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  trendPercent,
  trendLabel = "vs last hr",
  statusColor = "primary",
  icon,
  tooltip,
  lastUpdated = "Just now",
  sparklineData = [],
}: StatCardProps) {
  const theme = colorMap[statusColor]
  const isPositive = (trendPercent ?? 0) >= 0

  return (
    <TooltipProvider>
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <Card className="relative overflow-hidden bg-[var(--bg-card)] border-[var(--border-subtle)] hover:border-[var(--border-default)] transition-all duration-200 shadow-md">
          {/* Subtle colored glow gradient in top corner */}
          <div
            className="absolute -top-12 -right-12 w-28 h-28 rounded-full blur-2xl pointer-events-none opacity-40 transition-opacity"
            style={{ backgroundColor: theme.stroke }}
          />

          <div className="p-4 sm:p-5 flex items-start justify-between gap-3">
            {/* Left Column: Metrics */}
            <div className="space-y-1 z-10 min-w-0">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)] tracking-wide uppercase">
                <span className="truncate">{title}</span>
                <Tooltip delayDuration={200}>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-3 w-3 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-help shrink-0" />
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    className="bg-[var(--bg-card)] border-[var(--border-default)] text-[var(--text-primary)] text-xs shadow-xl max-w-[220px]"
                  >
                    {tooltip}
                  </TooltipContent>
                </Tooltip>
              </div>

              {/* Big Animated Counter */}
              <div className="flex items-baseline gap-1 pt-0.5">
                {prefix && (
                  <span className="text-lg font-bold text-[var(--text-muted)] font-mono">
                    {prefix}
                  </span>
                )}
                <span className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-[var(--text-primary)]">
                  <AnimatedCounter value={value} decimals={decimals} />
                </span>
                {suffix && (
                  <span className="text-sm font-bold text-[var(--text-muted)] font-mono">
                    {suffix}
                  </span>
                )}
              </div>
            </div>

            {/* Right Column: Icon & Sparkline */}
            <div className="flex flex-col items-end gap-2 shrink-0">
              <div
                className={`p-2.5 rounded-xl border ${theme.badgeBg} ${theme.text} shadow-xs`}
              >
                {icon}
              </div>

              {/* Miniature Sparkline (Recharts) */}
              {sparklineData && sparklineData.length > 0 && (
                <div className="w-20 h-8 mt-1 pointer-events-none">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={sparklineData}
                      margin={{ top: 2, right: 0, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id={`grad-${title.replace(/\s+/g, "")}`}
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor={theme.stroke}
                            stopOpacity={0.4}
                          />
                          <stop
                            offset="95%"
                            stopColor={theme.stroke}
                            stopOpacity={0.0}
                          />
                        </linearGradient>
                      </defs>
                      <Area
                        type="monotone"
                        dataKey="val"
                        stroke={theme.stroke}
                        strokeWidth={1.5}
                        fillOpacity={1}
                        fill={`url(#grad-${title.replace(/\s+/g, "")})`}
                        isAnimationActive={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Card Footer: Trend & Timestamp */}
          <div className="px-4 sm:px-5 py-2.5 bg-[var(--bg-surface)]/60 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] font-mono">
            {trendPercent !== undefined ? (
              <div className="flex items-center gap-1.5">
                <span
                  className={`flex items-center font-bold ${
                    isPositive ? "text-[#10B981]" : "text-[#E53935]"
                  }`}
                >
                  {isPositive ? (
                    <TrendingUp className="h-3 w-3 mr-0.5 inline" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-0.5 inline" />
                  )}
                  {isPositive ? "+" : ""}
                  {trendPercent}%
                </span>
                <span className="text-[var(--text-muted)]">{trendLabel}</span>
              </div>
            ) : (
              <span className="text-[var(--text-secondary)]">Baseline Stable</span>
            )}

            <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
              <Clock className="h-3 w-3" />
              <span>{lastUpdated}</span>
            </div>
          </div>
        </Card>
      </motion.div>
    </TooltipProvider>
  )
}

export const StatCard = React.memo(StatCardComponent)
