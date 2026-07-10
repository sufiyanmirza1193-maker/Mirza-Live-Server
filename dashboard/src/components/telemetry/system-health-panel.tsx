"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Cpu, HardDrive, Zap, Thermometer, Network, Clock, ShieldCheck, Activity } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CircularGauge } from "@/components/telemetry/circular-gauge"

export interface SystemHealthProps {
  cpu: number
  ram: number
  gpu: number
  disk: number
  temperature: number
  networkSpeed: number // in Mbps
  uptimeSec: number
  healthScore: number
}

export function SystemHealthPanel({
  health = {
    cpu: 24.2,
    ram: 13.1,
    gpu: 18.4,
    disk: 58.2,
    temperature: 48.5,
    networkSpeed: 45.2,
    uptimeSec: 3679800, // ~42d 14h
    healthScore: 100,
  },
}: {
  health?: SystemHealthProps
}) {
  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / (3600 * 24))
    const hrs = Math.floor((seconds % (3600 * 24)) / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    return `${days}d ${hrs}h ${mins}m`
  }

  const getHealthColor = (score: number) => {
    if (score >= 95) return "#10B981"
    if (score >= 80) return "#F59E0B"
    return "#E53935"
  }

  return (
    <Card className="glass-card flex flex-col justify-between h-full">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1C1C1C]">
        <div>
          <CardTitle className="text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#10B981]" /> Physical Host Hardware &amp; System Health
          </CardTitle>
          <CardDescription className="text-xs">
            Continuous polling of Windows NT telemetry (`psutil` / NVENC engine load)
          </CardDescription>
        </div>

        <div className="flex items-center gap-2 bg-[#090909] px-3 py-1.5 rounded-xl border border-[#1C1C1C] text-xs font-mono">
          <span className="text-[#888888]">Overall Health:</span>
          <span className="font-bold tracking-tight" style={{ color: getHealthColor(health.healthScore) }}>
            {health.healthScore} / 100
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* 4 Circular Gauges Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <CircularGauge
            label="CPU LOAD"
            value={health.cpu}
            unit="%"
            color={health.cpu > 80 ? "#E53935" : "#3B82F6"}
            sublabel="12 physical cores"
          />
          <CircularGauge
            label="RAM USAGE"
            value={health.ram}
            unit="%"
            color={health.ram > 85 ? "#E53935" : "#10B981"}
            sublabel="4.2 / 32.0 GB"
          />
          <CircularGauge
            label="GPU ENGINE"
            value={health.gpu}
            unit="%"
            color="#FF5A1F"
            sublabel="NVENC Active"
          />
          <CircularGauge
            label="DISK ARRAY"
            value={health.disk}
            unit="%"
            color="#10B981"
            sublabel="NVMe M.2 Free"
          />
        </div>

        {/* 4 Bottom Metric Pills Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs pt-2 border-t border-[#1C1C1C]/60">
          <div className="p-2.5 rounded-xl bg-[#090909] border border-[#1C1C1C] flex flex-col justify-between">
            <span className="text-[#888888] text-[10px] flex items-center gap-1">
              <Thermometer className="h-3 w-3 text-[#F59E0B]" /> TEMPERATURE
            </span>
            <span className="text-sm font-bold text-white mt-1">{health.temperature.toFixed(1)}°C</span>
            <span className="text-[10px] text-[#10B981]">Optimal Thermal</span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#090909] border border-[#1C1C1C] flex flex-col justify-between">
            <span className="text-[#888888] text-[10px] flex items-center gap-1">
              <Network className="h-3 w-3 text-[#3B82F6]" /> NETWORK I/O
            </span>
            <span className="text-sm font-bold text-white mt-1">{health.networkSpeed.toFixed(1)} Mbps</span>
            <span className="text-[10px] text-[#888888]">Full Duplex</span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#090909] border border-[#1C1C1C] flex flex-col justify-between">
            <span className="text-[#888888] text-[10px] flex items-center gap-1">
              <Clock className="h-3 w-3 text-[#10B981]" /> HOST UPTIME
            </span>
            <span className="text-sm font-bold text-white mt-1">{formatUptime(health.uptimeSec)}</span>
            <span className="text-[10px] text-[#10B981]">mirza.lock ok</span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#090909] border border-[#1C1C1C] flex flex-col justify-between">
            <span className="text-[#888888] text-[10px] flex items-center gap-1">
              <Activity className="h-3 w-3 text-[#FF5A1F]" /> DIAGNOSTIC
            </span>
            <span className="text-sm font-bold text-[#10B981] mt-1">HEALTHY</span>
            <span className="text-[10px] text-[#888888]">0 Hardware Faults</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
