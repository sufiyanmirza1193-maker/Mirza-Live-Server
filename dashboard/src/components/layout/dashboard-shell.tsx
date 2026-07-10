"use client"

import * as React from "react"
import { ShellProvider, useShell } from "@/context/shell-context"
import { GlobalHeader } from "@/components/layout/global-header"
import { Sidebar } from "@/components/layout/sidebar"
import { CommandPalette } from "@/components/layout/command-palette"
import { cn } from "@/lib/utils"

// ─────────────────────────────────────────────────────────────────────────────
// Inner shell — reads sidebar state from context
// ─────────────────────────────────────────────────────────────────────────────

const ShellContent = React.memo(function ShellContent({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed } = useShell()

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] font-sans transition-colors duration-200">
      {/* Fixed top header — always visible, z-50 */}
      <GlobalHeader />

      {/* Fixed left sidebar — below header, z-40 */}
      <Sidebar />

      {/* Global command palette — portal, z-[200] */}
      <CommandPalette />

      {/* Main content area — offset by header height (pt-12) and sidebar width */}
      <main
        className={cn(
          "min-h-screen pt-12 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          sidebarCollapsed ? "pl-14" : "pl-[220px]"
        )}
      >
        <div className="p-6 md:p-8 lg:p-10 max-w-[1680px] mx-auto space-y-8">
          {children}
        </div>
      </main>
    </div>
  )
})

// ─────────────────────────────────────────────────────────────────────────────
// DashboardShell — wraps ShellProvider, then renders ShellContent
// ─────────────────────────────────────────────────────────────────────────────

function DashboardShellComponent({ children }: { children: React.ReactNode }) {
  return (
    <ShellProvider>
      <ShellContent>{children}</ShellContent>
    </ShellProvider>
  )
}

export const DashboardShell = React.memo(DashboardShellComponent)
