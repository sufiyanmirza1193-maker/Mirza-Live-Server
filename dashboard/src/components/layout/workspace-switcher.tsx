"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ChevronDown,
  Check,
  Plus,
  Gamepad2,
  Headphones,
  Music2,
  Mic,
  Building2,
  Folder,
  Layers,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useWorkspace } from "@/context/workspace-context"
import { Workspace } from "@/types/workspace"

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Gamepad2,
  Headphones,
  Music2,
  Mic,
  Building2,
  Folder,
}

export function WorkspaceSwitcher() {
  const { workspaces, activeWorkspace, switchWorkspace, createWorkspace } = useWorkspace()
  const [isOpen, setIsOpen] = React.useState(false)
  const [isCreating, setIsCreating] = React.useState(false)
  const [newWsName, setNewWsName] = React.useState("")
  const [newWsCategory, setNewWsCategory] = React.useState<Workspace["category"]>("Gaming")
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  useEffectClickOutside(dropdownRef, () => {
    setIsOpen(false)
    setIsCreating(false)
  })

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newWsName.trim()) return
    createWorkspace(newWsName.trim(), newWsCategory)
    setNewWsName("")
    setIsCreating(false)
    setIsOpen(false)
  }

  const ActiveIcon = ICON_MAP[activeWorkspace?.icon || "Folder"] || Layers

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 h-7 px-2.5 rounded-md text-[11px] font-medium transition-all duration-150",
          "bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--border-default)]",
          "text-[var(--text-primary)] shadow-sm"
        )}
      >
        <div
          className="w-4 h-4 rounded flex items-center justify-center shrink-0"
          style={{ backgroundColor: activeWorkspace?.color || "#FF5A1F" }}
        >
          <ActiveIcon className="w-2.5 h-2.5 text-white" />
        </div>
        <span className="truncate max-w-[120px] sm:max-w-[150px] font-sans font-semibold">
          {activeWorkspace?.name || "Select Workspace"}
        </span>
        <ChevronDown className={cn("w-3 h-3 text-[var(--text-muted)] transition-transform", isOpen && "rotate-180")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "absolute left-0 top-full mt-2 w-72 rounded-xl z-50 p-2",
              "bg-[var(--bg-card)] border border-[var(--border-default)] shadow-2xl",
              "backdrop-blur-xl"
            )}
          >
            <div className="px-2 py-1.5 text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] flex items-center justify-between">
              <span>Workspaces ({workspaces.length})</span>
              <span className="text-[#FF5A1F] font-semibold">Mirza Fleet</span>
            </div>

            <div className="space-y-1 my-1 max-h-56 overflow-y-auto scrollbar-thin">
              {workspaces.map((ws) => {
                const WsIcon = ICON_MAP[ws.icon || "Folder"] || Layers
                const isActive = ws.id === activeWorkspace?.id
                return (
                  <button
                    key={ws.id}
                    onClick={() => {
                      switchWorkspace(ws.id)
                      setIsOpen(false)
                    }}
                    className={cn(
                      "w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left transition-all",
                      isActive
                        ? "bg-[#FF5A1F]/10 border border-[#FF5A1F]/30 text-[var(--text-primary)] font-semibold"
                        : "hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                        style={{ backgroundColor: ws.color }}
                      >
                        <WsIcon className="w-3.5 h-3.5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs truncate">{ws.name}</div>
                        <div className="text-[10px] text-[var(--text-muted)] flex items-center gap-1.5">
                          <span>{ws.category}</span>
                          <span>•</span>
                          <span className="text-[#22C55E]">{ws.stats.activeChannels} Live</span>
                        </div>
                      </div>
                    </div>
                    {isActive && <Check className="w-4 h-4 text-[#FF5A1F] shrink-0" />}
                  </button>
                )
              })}
            </div>

            <div className="border-t border-[var(--border-subtle)] pt-1.5 mt-1.5">
              {!isCreating ? (
                <button
                  onClick={() => setIsCreating(true)}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium text-[#FF5A1F] hover:bg-[#FF5A1F]/10 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Workspace</span>
                </button>
              ) : (
                <form onSubmit={handleCreate} className="p-2 space-y-2 bg-[var(--bg-surface)] rounded-lg border border-[var(--border-subtle)]">
                  <div className="text-[11px] font-semibold text-[var(--text-primary)]">New Workspace</div>
                  <input
                    type="text"
                    placeholder="Workspace Name (e.g. Anime Radio)"
                    value={newWsName}
                    onChange={(e) => setNewWsName(e.target.value)}
                    className="w-full h-7 px-2 rounded bg-[var(--bg-base)] border border-[var(--border-default)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#FF5A1F]"
                    autoFocus
                  />
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsCreating(false)}
                      className="px-2 py-1 rounded text-[10px] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!newWsName.trim()}
                      className="px-3 py-1 rounded bg-[#FF5A1F] text-white text-[10px] font-semibold hover:bg-[#CC3E10] disabled:opacity-50 transition-colors"
                    >
                      Create
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function useEffectClickOutside(ref: React.RefObject<HTMLElement | null>, handler: () => void) {
  React.useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return
      }
      handler()
    }
    document.addEventListener("mousedown", listener)
    document.addEventListener("touchstart", listener)
    return () => {
      document.removeEventListener("mousedown", listener)
      document.removeEventListener("touchstart", listener)
    }
  }, [ref, handler])
}
