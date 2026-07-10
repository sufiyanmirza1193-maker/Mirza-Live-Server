"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Moon, Sun, Sparkles } from "lucide-react"
import { useTheme, ThemeMode } from "@/context/theme-context"
import { cn } from "@/lib/utils"

const THEMES: { id: ThemeMode; label: string; icon: React.ElementType }[] = [
  { id: "dark", label: "Dark", icon: Moon },
  { id: "light", label: "Light", icon: Sun },
  { id: "glass", label: "Glass", icon: Sparkles },
]

function ThemeSelectorComponent() {
  const { theme, setTheme, isMounted } = useTheme()

  if (!isMounted) {
    return (
      <div className="flex items-center h-8 p-0.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] w-[164px]">
        <div className="w-full h-full rounded-md bg-[var(--bg-elevated)] animate-pulse" />
      </div>
    )
  }

  return (
    <div
      className={cn(
        "relative flex items-center h-8 p-0.5 rounded-lg select-none",
        "bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-sm"
      )}
      role="radiogroup"
      aria-label="Select color theme"
    >
      {THEMES.map((item) => {
        const Icon = item.icon
        const isActive = theme === item.id

        return (
          <button
            key={item.id}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => setTheme(item.id)}
            className={cn(
              "relative z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors duration-150",
              isActive
                ? "text-[var(--text-primary)] font-bold"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            )}
            title={`Switch to ${item.label} Theme`}
          >
            {isActive && (
              <motion.div
                layoutId="theme-selector-active-tab"
                className={cn(
                  "absolute inset-0 rounded-md shadow-xs border border-[#FF5A1F]/40",
                  theme === "light"
                    ? "bg-[#FFFFFF] shadow-[0_1px_3px_rgba(17,24,39,0.1)]"
                    : "bg-[var(--bg-elevated)]"
                )}
                transition={{
                  type: "spring",
                  stiffness: 450,
                  damping: 30,
                }}
              />
            )}

            <Icon
              className={cn(
                "relative z-10 h-3 w-3 shrink-0 transition-colors",
                isActive ? "text-[#FF5A1F]" : "text-[var(--text-muted)]"
              )}
            />
            <span className="relative z-10 hidden sm:inline">{item.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export const ThemeSelector = React.memo(ThemeSelectorComponent)
