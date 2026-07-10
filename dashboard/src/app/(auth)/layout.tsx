"use client"

import * as React from "react"
import Link from "next/link"
import { Zap, ArrowLeft, Sparkles } from "lucide-react"
import { useTheme } from "@/context/theme-context"
import { cn } from "@/lib/utils"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useTheme()

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] font-sans flex flex-col justify-between p-6 relative overflow-hidden">
      {/* Ambient Orange & Violet Glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#FF5A1F]/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#8B5CF6]/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Navigation */}
      <header className="flex items-center justify-between z-10 max-w-6xl w-full mx-auto">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-[#FF5A1F] to-[#CC3E10] flex items-center justify-center shadow-lg shadow-[#FF5A1F]/30 group-hover:scale-105 transition-transform">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <div className="flex items-baseline gap-1.5 font-sans">
            <span className="text-sm font-extrabold tracking-tight">MIRZA</span>
            <span className="text-[10px] font-mono font-bold text-[#FF5A1F] px-1.5 py-0.5 rounded bg-[#FF5A1F]/10 border border-[#FF5A1F]/30">
              OS
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <div className="flex items-center rounded-lg p-0.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[10px] font-mono">
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
            href="/landing"
            className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Public Landing</span>
          </Link>
        </div>
      </header>

      {/* Main Form Center */}
      <main className="flex-1 flex items-center justify-center py-12 z-10">
        <div className="w-full max-w-md">{children}</div>
      </main>

      {/* Footer */}
      <footer className="text-center z-10 max-w-6xl w-full mx-auto text-xs text-[var(--text-muted)] font-mono flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#FF5A1F]" />
          <span>SOC2 Type II Protected Operating System</span>
        </div>
        <span>© 2026 Mirza Streaming Global Ltd.</span>
      </footer>
    </div>
  )
}
