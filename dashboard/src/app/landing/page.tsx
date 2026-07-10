"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  Zap,
  Radio,
  Layers,
  Cpu,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Globe,
  BarChart3,
  CheckCircle2,
  Play,
  Lock,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useTheme } from "@/context/theme-context"

export default function LandingPage() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] font-sans overflow-x-hidden selection:bg-[#FF5A1F]/30">
      {/* ── Landing Header ────────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/80 backdrop-blur-xl flex items-center justify-between px-6 md:px-12">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-[#FF5A1F] to-[#CC3E10] flex items-center justify-center shadow-lg shadow-[#FF5A1F]/30 group-hover:scale-105 transition-transform">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-extrabold tracking-tight">MIRZA</span>
            <span className="text-[10px] font-mono font-bold text-[#FF5A1F] px-1.5 py-0.5 rounded bg-[#FF5A1F]/10 border border-[#FF5A1F]/30">
              OS v3.0
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-[var(--text-secondary)]">
          <a href="#features" className="hover:text-[var(--text-primary)] transition-colors">Features</a>
          <a href="#architecture" className="hover:text-[var(--text-primary)] transition-colors">Edge Engine</a>
          <a href="#metrics" className="hover:text-[var(--text-primary)] transition-colors">Scale & SLA</a>
          <a href="#enterprise" className="hover:text-[var(--text-primary)] transition-colors">Security</a>
        </nav>

        <div className="flex items-center gap-3">
          {/* Theme switcher pill */}
          <div className="hidden sm:flex items-center rounded-lg p-0.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[10px] font-mono">
            <button
              onClick={() => setTheme("dark")}
              className={cn("px-2 py-1 rounded transition-colors", theme === "dark" && "bg-[#FF5A1F] text-white font-bold")}
            >
              DARK
            </button>
            <button
              onClick={() => setTheme("light")}
              className={cn("px-2 py-1 rounded transition-colors", theme === "light" && "bg-[#FF5A1F] text-white font-bold")}
            >
              LIGHT
            </button>
            <button
              onClick={() => setTheme("glass")}
              className={cn("px-2 py-1 rounded transition-colors", theme === "glass" && "bg-[#FF5A1F] text-white font-bold")}
            >
              GLASS
            </button>
          </div>

          <Link
            href="/login"
            className="h-8 px-3.5 rounded-lg border border-[var(--border-default)] hover:border-[#FF5A1F] text-xs font-semibold flex items-center gap-1.5 transition-all hover:bg-[var(--bg-elevated)]"
          >
            <span>Sign In</span>
          </Link>
          <Link
            href="/register"
            className="h-8 px-4 rounded-lg bg-gradient-to-r from-[#FF5A1F] to-[#CC3E10] text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#FF5A1F]/20 hover:shadow-[#FF5A1F]/40 hover:scale-[1.02] transition-all"
          >
            <span>Request Access</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* ── Hero Section ──────────────────────────────────────────────────── */}
      <section className="pt-36 pb-24 px-6 md:px-12 max-w-6xl mx-auto text-center relative">
        {/* Glow backdrop */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-[#FF5A1F]/15 blur-[120px] pointer-events-none -z-10 rounded-full" />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FF5A1F]/10 border border-[#FF5A1F]/30 text-[#FF5A1F] text-xs font-mono font-semibold mb-6 shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>INTRODUCING MIRZA LIVE OPERATING SYSTEM V3</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] max-w-4xl mx-auto font-sans"
        >
          The Operating System for{" "}
          <span className="bg-gradient-to-r from-[#FF5A1F] via-[#FF8050] to-[#E23B0D] bg-clip-text text-transparent">
            Enterprise Live Streaming.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-base sm:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed"
        >
          Orchestrate 24/7 autonomous YouTube channels, manage fleet bandwidth at edge scale, and inspect real-time FFMPEG telemetry from one single glass window.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <Link
            href="/register"
            className="h-12 px-8 rounded-xl bg-[#FF5A1F] hover:bg-[#CC3E10] text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-[#FF5A1F]/30 hover:scale-[1.02] transition-all"
          >
            <span>Deploy Enterprise Fleet</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/"
            className="h-12 px-8 rounded-xl bg-[var(--bg-card)] border border-[var(--border-default)] hover:border-[#FF5A1F] text-[var(--text-primary)] font-semibold text-sm flex items-center gap-2 transition-all hover:bg-[var(--bg-elevated)]"
          >
            <Play className="w-4 h-4 text-[#FF5A1F] fill-[#FF5A1F]" />
            <span>Launch Mission Control</span>
          </Link>
        </motion.div>

        {/* ── Live Telemetry Preview Card ────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.45 }}
          className="mt-16 rounded-2xl glass-card border border-[var(--border-default)] p-4 sm:p-6 shadow-2xl text-left max-w-5xl mx-auto relative overflow-hidden"
        >
          <div className="flex flex-wrap items-center justify-between pb-4 mb-4 border-b border-[var(--border-subtle)] gap-4">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#EF4444]" />
                <span className="w-3 h-3 rounded-full bg-[#F59E0B]" />
                <span className="w-3 h-3 rounded-full bg-[#22C55E]" />
              </div>
              <span className="text-xs font-mono font-bold text-[var(--text-muted)]">
                mirza-os-edge-cluster-us-east-1.internal
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/30 text-[#22C55E] text-xs font-mono font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
              <span>LIVE EDGE SYNC</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
              <div className="text-[11px] font-mono text-[var(--text-muted)] uppercase">Active Stream Fleet</div>
              <div className="text-2xl font-bold text-[var(--text-primary)] mt-1 tabular-nums">12 / 12 Channels</div>
              <div className="text-[10px] text-[#22C55E] font-mono mt-1">100% Core Online</div>
            </div>
            <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
              <div className="text-[11px] font-mono text-[var(--text-muted)] uppercase">Edge Throughput</div>
              <div className="text-2xl font-bold text-[#FF5A1F] mt-1 tabular-nums">14.8 Gbps</div>
              <div className="text-[10px] text-[var(--text-muted)] font-mono mt-1">HLS + RTMP Multi-Bitrate</div>
            </div>
            <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
              <div className="text-[11px] font-mono text-[var(--text-muted)] uppercase">System Health Score</div>
              <div className="text-2xl font-bold text-[#22C55E] mt-1 tabular-nums">99.98%</div>
              <div className="text-[10px] text-[var(--text-muted)] font-mono mt-1">Sub-second recovery</div>
            </div>
            <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
              <div className="text-[11px] font-mono text-[var(--text-muted)] uppercase">FFMPEG Worker Load</div>
              <div className="text-2xl font-bold text-[var(--text-primary)] mt-1 tabular-nums">42.4% CPU</div>
              <div className="text-[10px] text-[#22C55E] font-mono mt-1">Zero dropped frames</div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[var(--bg-base)] border border-[var(--border-subtle)] font-mono text-xs flex flex-wrap items-center justify-between text-[var(--text-secondary)]">
            <div className="flex items-center gap-2">
              <span className="text-[#FF5A1F]">✦ System Audit:</span>
              <span>Autonomous buffer switch triggered on [CH-04 — 24/7 Lo-Fi Radio]. Stream continuity preserved.</span>
            </div>
            <span className="text-[10px] text-[var(--text-muted)]">Latency: 11.2ms</span>
          </div>
        </motion.div>
      </section>

      {/* ── Statistics Bar ────────────────────────────────────────────────── */}
      <section id="metrics" className="py-12 border-y border-[var(--border-subtle)] bg-[var(--bg-surface)]">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)] font-mono">100M+</div>
            <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider mt-1">Monthly Stream Hours</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-[#FF5A1F] font-mono">99.999%</div>
            <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider mt-1">SLA Uptime Target</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)] font-mono">12ms</div>
            <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider mt-1">Global Edge Latency</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-[#22C55E] font-mono">0 Frame Drops</div>
            <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider mt-1">Autonomous Recovery</div>
          </div>
        </div>
      </section>

      {/* ── Bento Feature Grid ────────────────────────────────────────────── */}
      <section id="features" className="py-24 px-6 md:px-12 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Designed for 24/7 Autonomous Reliability.
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[var(--text-secondary)] max-w-2xl mx-auto">
            Everything you need to orchestrate mission-critical streaming networks without human intervention.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="md:col-span-2 rounded-2xl p-8 glass-card border border-[var(--border-default)] hover:border-[#FF5A1F]/50 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-[#FF5A1F]/10 border border-[#FF5A1F]/30 flex items-center justify-center text-[#FF5A1F] mb-6">
              <Radio className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-[var(--text-primary)]">Self-Healing Channel Fleet</h3>
            <p className="mt-2 text-sm text-[var(--text-secondary)] leading-relaxed">
              Our autonomous watchdog monitors FFMPEG process health every 500 milliseconds. If a bitrate drop or stream stall is detected, Mirza OS instantly hot-swaps to the redundant edge buffer before YouTube detects a drop.
            </p>
            <div className="mt-6 flex items-center gap-2 text-xs font-mono text-[#FF5A1F] group-hover:translate-x-1 transition-transform">
              <span>Inspect Fleet Architecture</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 2 */}
          <div className="rounded-2xl p-8 glass-card border border-[var(--border-default)] hover:border-[#FF5A1F]/50 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 flex items-center justify-center text-[#8B5CF6] mb-6">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-[var(--text-primary)]">Multi-Workspace RBAC</h3>
            <p className="mt-2 text-sm text-[var(--text-secondary)] leading-relaxed">
              Isolate channel fleets by brand or genre. Grant granular operator, stream engineer, or read-only viewer permissions across your organization.
            </p>
          </div>

          {/* Card 3 */}
          <div className="rounded-2xl p-8 glass-card border border-[var(--border-default)] hover:border-[#FF5A1F]/50 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-[#10B981]/10 border border-[#10B981]/30 flex items-center justify-center text-[#10B981] mb-6">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-[var(--text-primary)]">Edge Telemetry & Bitrate Sync</h3>
            <p className="mt-2 text-sm text-[var(--text-secondary)] leading-relaxed">
              Monitor exact FPS, encoding profiles, audio codecs, and CDN ingest speeds in sub-second fidelity across all active streams simultaneously.
            </p>
          </div>

          {/* Card 4 */}
          <div className="md:col-span-2 rounded-2xl p-8 glass-card border border-[var(--border-default)] hover:border-[#FF5A1F]/50 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-[#3B82F6]/10 border border-[#3B82F6]/30 flex items-center justify-center text-[#3B82F6] mb-6">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-[var(--text-primary)]">Apple Vision Pro / Vercel Glass Identity</h3>
            <p className="mt-2 text-sm text-[var(--text-secondary)] leading-relaxed">
              Experience the future of enterprise interfaces. Switch seamlessly between deep Obsidian Dark, clean Engineering Light, and our signature multi-layer Frosted Glass mode with ambient orange back-lighting.
            </p>
            <div className="mt-6 flex items-center gap-2 text-xs font-mono text-[#FF5A1F] group-hover:translate-x-1 transition-transform">
              <span>Try Glass Mode Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Enterprise Security Callout ────────────────────────────────────── */}
      <section id="enterprise" className="py-20 px-6 md:px-12 max-w-5xl mx-auto">
        <div className="rounded-2xl p-8 sm:p-12 bg-gradient-to-br from-[#111111] to-[#181818] border border-[var(--border-default)] flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#FF5A1F]/10 blur-[100px] pointer-events-none rounded-full" />
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#22C55E]/10 text-[#22C55E] text-xs font-mono font-semibold">
              <Lock className="w-3.5 h-3.5" />
              <span>SOC2 TYPE II READY & ISO 27001 COMPLIANT</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              Enterprise Grade Security for Global Creators & Studios.
            </h3>
            <p className="text-sm text-[#A0A0A0] leading-relaxed">
              All stream credentials and API tokens are encrypted with AES-256 GCM. Automated daily backups, two-factor authentication enforcement, and zero-trust edge workers ensure total isolation.
            </p>
          </div>
          <Link
            href="/register"
            className="shrink-0 h-12 px-6 rounded-xl bg-white text-[#090909] font-bold text-sm flex items-center gap-2 hover:bg-gray-200 transition-colors shadow-lg"
          >
            <span>Request Custom SLA</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="py-12 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] text-center sm:text-left">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-[#FF5A1F] flex items-center justify-center text-white font-bold text-xs">
              <Zap className="h-3.5 w-3.5" />
            </div>
            <span className="text-sm font-bold tracking-tight">MIRZA OS v3.0</span>
          </div>
          <p className="text-xs text-[var(--text-muted)] font-mono">
            © 2026 Mirza Streaming Global Ltd. Built for autonomous 24/7 high-availability infrastructure.
          </p>
          <div className="flex items-center gap-4 text-xs font-semibold text-[var(--text-secondary)]">
            <Link href="/" className="hover:text-[var(--text-primary)]">Dashboard</Link>
            <Link href="/login" className="hover:text-[var(--text-primary)]">Sign In</Link>
            <a href="#features" className="hover:text-[var(--text-primary)]">Features</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
