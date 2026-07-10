"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Radio,
  Layers,
  Activity,
  Settings2,
  ChevronLeft,
  ChevronRight,
  Circle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useShell } from "@/context/shell-context"
import { useWorkspace } from "@/context/workspace-context"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// ─────────────────────────────────────────────────────────────────────────────
// Experience Center definitions
// ─────────────────────────────────────────────────────────────────────────────

interface ExperienceCenter {
  id: string
  title: string
  description: string
  icon: React.ElementType
  href: string
  /** Exact match vs prefix match for active state */
  exact?: boolean
}

const EXPERIENCE_CENTERS: ExperienceCenter[] = [
  {
    id: "mission-control",
    title: "Mission Control",
    description: "Global health & real-time status",
    icon: LayoutDashboard,
    href: "/",
    exact: true,
  },
  {
    id: "channel-fleet",
    title: "Channel Fleet",
    description: "Manage all streaming workers",
    icon: Radio,
    href: "/channels",
  },
  {
    id: "content-studio",
    title: "Content Studio",
    description: "Media, playlists & scheduling",
    icon: Layers,
    href: "/content",
  },
  {
    id: "operations",
    title: "Operations",
    description: "Metrics, logs & incidents",
    icon: Activity,
    href: "/operations",
  },
  {
    id: "system",
    title: "System",
    description: "Configuration & integrations",
    icon: Settings2,
    href: "/system",
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// Nav Item — single experience center link
// ─────────────────────────────────────────────────────────────────────────────

function NavItem({
  center,
  isActive,
  collapsed,
}: {
  center: ExperienceCenter
  isActive: boolean
  collapsed: boolean
}) {
  const Icon = center.icon

  const inner = (
    <Link
      href={center.href}
      className={cn(
        "relative flex items-center rounded-xl transition-all duration-200 group",
        collapsed
          ? "h-10 w-10 justify-center mx-auto"
          : "h-10 px-3 gap-3 w-full",
        isActive
          ? "bg-[var(--bg-elevated)] text-[var(--text-primary)] font-semibold shadow-sm"
          : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]"
      )}
    >
      {/* Active left accent bar */}
      {isActive && (
        <span className="absolute left-0 top-2.5 bottom-2.5 w-[3px] rounded-r-full bg-[#FF5A1F]" />
      )}

      <Icon
        className={cn(
          "h-4 w-4 shrink-0 transition-colors",
          isActive
            ? "text-[#FF5A1F]"
            : "text-[var(--text-muted)] group-hover:text-[var(--text-primary)]"
        )}
      />

      {!collapsed && (
        <span
          className={cn(
            "text-sm font-medium truncate transition-colors",
            isActive ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]"
          )}
        >
          {center.title}
        </span>
      )}
    </Link>
  )

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{inner}</TooltipTrigger>
        <TooltipContent
          side="right"
          sideOffset={8}
          className="bg-[var(--bg-card)] border border-[var(--border-default)] px-3 py-2 rounded-xl shadow-xl text-[var(--text-primary)] backdrop-blur-xl"
        >
          <p className="text-xs font-semibold leading-none">{center.title}</p>
          <p className="text-[10px] text-[var(--text-muted)] mt-1">{center.description}</p>
        </TooltipContent>
      </Tooltip>
    )
  }

  return inner
}

// ─────────────────────────────────────────────────────────────────────────────
// Sidebar
// ─────────────────────────────────────────────────────────────────────────────

export function Sidebar() {
  const pathname = usePathname()
  const { sidebarCollapsed, toggleSidebar, systemHealthScore } = useShell()
  const { activeWorkspace } = useWorkspace()

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "fixed top-12 left-0 bottom-0 z-40 flex flex-col",
          "bg-[var(--bg-surface)] border-r border-[var(--border-subtle)] backdrop-blur-xl",
          "transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          sidebarCollapsed ? "w-14" : "w-[220px]"
        )}
      >
        {/* ── Section label ─────────────────────────────────── */}
        {!sidebarCollapsed && (
          <div className="px-5 pt-5 pb-2 flex items-center justify-between">
            <span className="text-[10px] font-semibold tracking-[0.12em] text-[var(--text-muted)] uppercase font-mono">
              Experience
            </span>
            <span className="text-[9px] font-mono text-[#FF5A1F] px-1.5 py-0.5 rounded bg-[#FF5A1F]/10 border border-[#FF5A1F]/20">
              v3.0
            </span>
          </div>
        )}

        {/* ── Navigation Centers ────────────────────────────── */}
        <nav
          className={cn(
            "flex-1 overflow-y-auto overflow-x-hidden space-y-0.5 no-scrollbar",
            sidebarCollapsed ? "px-2 pt-4" : "px-2"
          )}
        >
          {EXPERIENCE_CENTERS.map((center) => {
            const isActive = center.exact
              ? pathname === center.href
              : pathname === center.href || pathname.startsWith(center.href + "/")

            return (
              <NavItem
                key={center.id}
                center={center}
                isActive={isActive}
                collapsed={sidebarCollapsed}
              />
            )
          })}
        </nav>

        {/* ── Footer ────────────────────────────────────────── */}
        <div className="p-2 border-t border-[var(--border-subtle)] space-y-2">
          {/* System health & Workspace indicator (expanded only) */}
          {!sidebarCollapsed && (
            <div className="px-3 py-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider truncate max-w-[110px]">
                  {activeWorkspace?.name || "System"}
                </span>
                <span
                  className="h-1.5 w-1.5 rounded-full shrink-0"
                  style={{
                    backgroundColor:
                      systemHealthScore >= 95
                        ? "#22C55E"
                        : systemHealthScore >= 80
                        ? "#F59E0B"
                        : "#EF4444",
                    boxShadow: `0 0 5px ${
                      systemHealthScore >= 95
                        ? "rgba(34, 197, 94, 0.5)"
                        : systemHealthScore >= 80
                        ? "rgba(245, 158, 11, 0.5)"
                        : "rgba(239, 68, 68, 0.5)"
                    }`,
                  }}
                />
              </div>
              <div className="flex items-center justify-between mt-1.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Circle className="h-2.5 w-2.5 text-[#22C55E] fill-[#22C55E] shrink-0" />
                  <span className="text-[10px] font-mono text-[var(--text-secondary)] truncate">
                    mirza.lock · SECURED
                  </span>
                </div>
                <span className="text-[9px] font-mono text-[var(--text-muted)] tabular-nums">
                  {systemHealthScore}%
                </span>
              </div>
            </div>
          )}

          {/* Collapse toggle */}
          <button
            onClick={toggleSidebar}
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn(
              "flex items-center rounded-xl h-8 border border-[var(--border-subtle)]",
              "bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-primary)]",
              "hover:border-[var(--border-default)] hover:bg-[var(--bg-elevated)]",
              "transition-all duration-150",
              sidebarCollapsed ? "w-10 mx-auto justify-center" : "w-full px-3 gap-2"
            )}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 shrink-0" />
                <span className="text-xs font-mono">Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </TooltipProvider>
  )
}
