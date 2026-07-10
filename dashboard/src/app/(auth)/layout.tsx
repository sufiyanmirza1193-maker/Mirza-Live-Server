"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Zap, ArrowLeft, Sparkles, Radio, ShieldCheck, Activity, Cpu } from "lucide-react"
import { ThemeSelector } from "@/components/layout/theme-selector"
import { cn } from "@/lib/utils"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] font-sans flex flex-col justify-between p-4 md:p-8 relative overflow-hidden transition-colors duration-300">
      {/* Ambient Orange & Violet Edge Glows */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-[#FF5A1F]/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-[#8B5CF6]/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Navigation Bar */}
      <header className="flex items-center justify-between z-10 max-w-7xl w-full mx-auto">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#FF5A1F] to-[#CC3E10] flex items-center justify-center shadow-lg shadow-[#FF5A1F]/30 group-hover:scale-105 transition-transform">
            <Zap className="h-4.5 w-4.5 text-white" />
          </div>
          <div className="flex items-baseline gap-1.5 font-sans">
            <span className="text-base font-black tracking-tight text-[var(--text-primary)]">MIRZA</span>
            <span className="text-[10px] font-mono font-bold text-[#FF5A1F] px-1.5 py-0.5 rounded bg-[#FF5A1F]/10 border border-[#FF5A1F]/30">
              OS V3
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <ThemeSelector />

          <Link
            href="/landing"
            className="hidden sm:flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors font-semibold px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] hover:border-[var(--border-default)] shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#FF5A1F]" />
            <span>Public Overview</span>
          </Link>
        </div>
      </header>

      {/* Split-Screen Main Center */}
      <main className="flex-1 flex items-center justify-center z-10 max-w-7xl w-full mx-auto py-8 md:py-12">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
          
          {/* Left Column: Brand Identity & Autonomous Architecture Preview */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="hidden lg:flex flex-col justify-center space-y-8 col-span-7 pr-4"
          >
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--primary-surface)] border border-[#FF5A1F]/30 text-[#FF5A1F] text-xs font-mono font-bold">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span>ENTERPRISE STREAMING OPERATING SYSTEM</span>
              </div>

              <h1 className="text-4xl xl:text-[48px] font-black tracking-tight leading-[1.12] text-[var(--text-primary)]">
                Orchestrate Hundreds of 24/7 Live RTMP Channels with Zero Drops.
              </h1>

              <p className="text-base text-[var(--text-secondary)] font-medium max-w-xl leading-relaxed">
                Autonomous FFmpeg thread management, hardware-accelerated NVENC encoding pipelines, and sub-second anomaly detection built for scale.
              </p>
            </div>

            {/* Live Pipeline Telemetry Preview Card */}
            <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-[0_4px_20px_rgba(0,0,0,0.06)] space-y-4 font-mono">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
                  <span className="text-xs font-bold text-[var(--text-primary)]">cluster_us_east_prod_1</span>
                </div>
                <span className="text-[10px] text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded border border-[#10B981]/20 font-bold">
                  99.999% SLA LOCKED
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
                  <span className="text-[10px] text-[var(--text-muted)] block uppercase font-sans font-semibold">Active Workers</span>
                  <span className="text-base font-bold text-[var(--text-primary)] mt-0.5 block">128 / 128 LIVE</span>
                </div>
                <div className="p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
                  <span className="text-[10px] text-[var(--text-muted)] block uppercase font-sans font-semibold">CBR Bitrate Sync</span>
                  <span className="text-base font-bold text-[#FF5A1F] mt-0.5 block">576.0 Mbps</span>
                </div>
                <div className="p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
                  <span className="text-[10px] text-[var(--text-muted)] block uppercase font-sans font-semibold">Dropped Frames</span>
                  <span className="text-base font-bold text-[#10B981] mt-0.5 block">0 (0.000%)</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)] font-sans pt-1">
                <div className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-[#3B82F6]" />
                  <span>Sub-second Supervisor Loop: <strong className="text-[var(--text-primary)] font-mono font-bold">1.000x Clock</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-[#FF5A1F]" />
                  <span>NVENC Hardware Engine Active</span>
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center gap-6 text-xs font-mono text-[var(--text-muted)] pt-2 border-t border-[var(--border-subtle)]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#10B981]" />
                <span>SOC2 Type II Certified</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#FF5A1F]" />
                <span>E2E Encrypted Telemetry</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Interactive Authentication Card (`{children}`) */}
          <div className="col-span-1 lg:col-span-5 w-full max-w-md mx-auto">
            {children}
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="z-10 max-w-7xl w-full mx-auto text-xs text-[var(--text-muted)] font-mono flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-[var(--border-subtle)] pt-4">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
          <span>Mirza Supervisor Daemon • Version 3.4.0-Enterprise</span>
        </div>
        <span>© 2026 Mirza Streaming Global Ltd. All rights reserved.</span>
      </footer>
    </div>
  )
}
