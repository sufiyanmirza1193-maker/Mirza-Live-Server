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
  neutral: { text: "text-[#888888]", stroke: "#888888", fill: "rgba(136, 136, 136, 0.15)", badgeBg: "bg-[#181818] border-[#1C1C1C]" },
}

export function StatCard({
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
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <Card className="glass-card glass-card-hover p-4 relative overflow-hidden group flex flex-col justify-between h-36">
          {/* Subtle top border accent line */}
          <div
            className="absolute top-0 left-0 right-0 h-[2px] opacity-40 group-hover:opacity-100 transition-opacity"
            style={{ backgroundColor: theme.stroke }}
          />

          {/* Header row: Title + Tooltip + Icon */}
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-mono font-bold text-[#888888] tracking-wider uppercase truncate">
                {title}
              </span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="text-[#555555] hover:text-[#888888] transition-colors focus:outline-none">
                    <HelpCircle className="h-3 w-3" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs text-xs font-sans">
                  {tooltip}
                </TooltipContent>
              </Tooltip>
            </div>
            <div className={`p-1.5 rounded-lg ${theme.badgeBg} ${theme.text}`}>
              {icon}
            </div>
          </div>

          {/* Middle row: Big Animated Number + Sparkline */}
          <div className="flex items-end justify-between gap-3 my-2 z-10">
            <div className="text-2xl lg:text-3xl font-bold font-mono text-white tracking-tight leading-none">
              <AnimatedCounter
                value={value}
                prefix={prefix}
                suffix={suffix}
                decimals={decimals}
              />
            </div>

            {/* Recharts Sparkline */}
            {sparklineData.length > 0 && (
              <div className="w-24 h-10 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sparklineData} margin={{ top: 2, right: 2, left: 2, bottom: 0 }}>
                    <defs>
                      <linearGradient id={`grad_${title.replace(/\s+/g, "_")}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={theme.stroke} stopOpacity={0.6} />
                        <stop offset="95%" stopColor={theme.stroke} stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="val"
                      stroke={theme.stroke}
                      strokeWidth={1.8}
                      fillOpacity={1}
                      fill={`url(#grad_${title.replace(/\s+/g, "_")})`}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Footer row: Trend badge + Last Updated timestamp */}
          <div className="flex items-center justify-between text-[10px] font-mono pt-2 border-t border-[#1C1C1C]/60 z-10">
            {trendPercent !== undefined ? (
              <div
                className={`flex items-center gap-1 font-bold ${
                  isPositive ? "text-[#10B981]" : "text-[#E53935]"
                }`}
              >
                {isPositive ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                <span>
                  {isPositive ? "+" : ""}
                  {trendPercent.toFixed(1)}% {trendLabel}
                </span>
              </div>
            ) : (
              <span className="text-[#888888]">Baseline Stable</span>
            )}

            <div className="flex items-center gap-1 text-[#666666]">
              <Clock className="h-2.5 w-2.5" />
              <span>Updated {lastUpdated}</span>
            </div>
          </div>
        </Card>
      </motion.div>
    </TooltipProvider>
  )
}
