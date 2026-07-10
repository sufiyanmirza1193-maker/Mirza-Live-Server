"use client"

import * as React from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  User,
  Settings,
  Bell,
  LogOut,
  Moon,
  Sun,
  Sparkles,
  Layers,
  Check,
  Shield,
  ExternalLink,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/auth-context"
import { useTheme, ThemeMode } from "@/context/theme-context"
import { useWorkspace } from "@/context/workspace-context"

export function ProfileMenu() {
  const { user, logout, isAuthenticated } = useAuth()
  const { theme, setTheme } = useTheme()
  const { activeWorkspace } = useWorkspace()
  const [isOpen, setIsOpen] = React.useState(false)
  const menuRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const listener = (event: MouseEvent) => {
      if (!menuRef.current || menuRef.current.contains(event.target as Node)) {
        return
      }
      setIsOpen(false)
    }
    document.addEventListener("mousedown", listener)
    return () => document.removeEventListener("mousedown", listener)
  }, [])

  if (!isAuthenticated || !user) {
    return (
      <Link
        href="/login"
        className="flex items-center gap-1.5 h-7 px-3 rounded-md bg-[#FF5A1F] text-white text-[11px] font-semibold hover:bg-[#CC3E10] transition-colors"
      >
        <span>Sign In</span>
      </Link>
    )
  }

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  const themes: { id: ThemeMode; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "dark", label: "Dark", icon: Moon },
    { id: "light", label: "Light", icon: Sun },
    { id: "glass", label: "Glass", icon: Sparkles },
  ]

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "h-7 px-2 rounded-lg flex items-center gap-2",
          "text-[11px] font-bold font-mono",
          "bg-[var(--bg-card)] border border-[var(--border-subtle)]",
          "hover:border-[#FF5A1F]/40 hover:bg-[var(--bg-elevated)]",
          "transition-all duration-150"
        )}
        aria-label="User Profile Menu"
      >
        <div className="w-5 h-5 rounded bg-gradient-to-br from-[#FF5A1F] to-[#CC3E10] flex items-center justify-center text-white text-[9px] font-semibold">
          {initials}
        </div>
        <span className="hidden md:inline font-sans font-semibold text-[var(--text-primary)] truncate max-w-[100px]">
          {user.name.split(" ")[0]}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "absolute right-0 top-full mt-2 w-72 rounded-xl z-50 p-2.5",
              "bg-[var(--bg-card)] border border-[var(--border-default)] shadow-2xl",
              "backdrop-blur-2xl text-[var(--text-primary)]"
            )}
          >
            {/* User Header */}
            <div className="p-2 bg-[var(--bg-surface)] rounded-lg border border-[var(--border-subtle)] mb-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#FF5A1F] to-[#CC3E10] flex items-center justify-center text-white font-bold text-sm shadow-md">
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold truncate flex items-center gap-1.5">
                    <span>{user.name}</span>
                    <span title={user.role} className="inline-flex items-center">
                      <Shield className="w-3 h-3 text-[#FF5A1F] shrink-0" />
                    </span>
                  </div>
                  <div className="text-[10px] text-[var(--text-muted)] truncate">{user.email}</div>
                  <div className="text-[9px] font-mono text-[#22C55E] mt-0.5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                    <span>{user.organization}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Workspace Info */}
            <div className="px-2 py-1.5 rounded-lg bg-[var(--bg-elevated)]/50 text-[11px] mb-2 flex items-center justify-between border border-[var(--border-subtle)]">
              <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                <Layers className="w-3.5 h-3.5 text-[#FF5A1F]" />
                <span className="truncate max-w-[140px] font-medium">{activeWorkspace?.name}</span>
              </div>
              <Link
                href="/settings"
                onClick={() => setIsOpen(false)}
                className="text-[10px] text-[#FF5A1F] hover:underline font-semibold"
              >
                Manage →
              </Link>
            </div>

            {/* Theme Selector Section */}
            <div className="px-2 py-1">
              <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] mb-1.5 flex items-center justify-between">
                <span>Theme Mode</span>
                <span className="text-[9px] text-[#FF5A1F]">{theme.toUpperCase()}</span>
              </div>
              <div className="grid grid-cols-3 gap-1 p-1 bg-[var(--bg-base)] rounded-lg border border-[var(--border-subtle)]">
                {themes.map((t) => {
                  const Icon = t.icon
                  const isActive = theme === t.id
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id)}
                      className={cn(
                        "flex flex-col items-center justify-center gap-1 py-1.5 rounded-md text-[10px] font-medium transition-all",
                        isActive
                          ? "bg-[#FF5A1F] text-white shadow-sm font-semibold"
                          : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
                      )}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{t.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="h-px bg-[var(--border-subtle)] my-2" />

            {/* Navigation Links */}
            <div className="space-y-0.5">
              <Link
                href="/profile"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
              >
                <User className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                <span>My Profile</span>
              </Link>
              <Link
                href="/notifications"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Bell className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                  <span>Notifications</span>
                </div>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-[#FF5A1F]/20 text-[#FF5A1F] font-semibold">
                  New
                </span>
              </Link>
              <Link
                href="/settings"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
              >
                <Settings className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                <span>Account & OS Settings</span>
              </Link>
              <Link
                href="/landing"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                <span>Public Landing Page</span>
              </Link>
            </div>

            <div className="h-px bg-[var(--border-subtle)] my-2" />

            {/* Logout Action */}
            <button
              onClick={() => {
                logout()
                setIsOpen(false)
              }}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors font-medium"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out of Mirza OS</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
