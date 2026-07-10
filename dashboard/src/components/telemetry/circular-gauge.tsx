"use client"

import * as React from "react"
import { motion } from "framer-motion"

export interface CircularGaugeProps {
  label: string
  value: number // 0 to 100
  unit?: string
  color?: string
  sublabel?: string
  size?: number
  strokeWidth?: number
}

function CircularGaugeComponent({
  label,
  value,
  unit = "%",
  color = "#FF5A1F",
  sublabel,
  size = 110,
  strokeWidth = 10,
}: CircularGaugeProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const clampedValue = Math.min(100, Math.max(0, value))
  const strokeDashoffset = circumference - (clampedValue / 100) * circumference

  return (
    <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--border-default)] transition-all">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        {/* Background circle */}
        <svg width={size} height={size} className="rotate-[-90deg]">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="var(--border-subtle)"
            strokeWidth={strokeWidth}
          />
          {/* Animated Foreground circle */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            strokeLinecap="round"
          />
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center font-mono">
          <span className="text-lg font-bold text-[var(--text-primary)] tracking-tighter">
            {value.toFixed(0)}
            <span className="text-xs font-normal text-[var(--text-muted)]">{unit}</span>
          </span>
          <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider leading-none mt-0.5">
            {label}
          </span>
        </div>
      </div>

      {sublabel && (
        <span className="mt-2 text-[11px] font-mono text-[var(--text-secondary)] truncate max-w-full">
          {sublabel}
        </span>
      )}
    </div>
  )
}

export const CircularGauge = React.memo(CircularGaugeComponent)
