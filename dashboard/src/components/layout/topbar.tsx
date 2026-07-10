"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import {
  Bell,
  ShieldCheck,
  Zap,
  AlertTriangle,
  Play,
  Square,
  Skull,
  User,
  CheckCircle2,
  ChevronDown,
  Layers,
  Moon,
  Radio,
  PlusCircle,
  ExternalLink,
} from "lucide-react"
import { CommandPalette } from "@/components/layout/command-palette"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

export function TopBar() {
  const pathname = usePathname()
  const [emergencyOpen, setEmergencyOpen] = React.useState(false)
  const [notificationsOpen, setNotificationsOpen] = React.useState(false)
  const [quickActionsOpen, setQuickActionsOpen] = React.useState(false)
  const [workspaceOpen, setWorkspaceOpen] = React.useState(false)
  const [currentWorkspace, setCurrentWorkspace] = React.useState("Production (24/7 CBR Strict)")
  const [unreadCount, setUnreadCount] = React.useState(3)

  const formatPathname = (path: string) => {
    if (path === "/") return "Enterprise Command Center"
    const cleaned = path.replace("/", "").split("/")[0]
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
  }

  return (
    <TooltipProvider>
      <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-[#1C1C1C] bg-[#090909]/85 px-4 md:px-8 backdrop-blur-md">
        {/* Left Side: Mobile Menu + Breadcrumb & Workspace Selector */}
        <div className="flex items-center gap-4">
          <Sidebar />
          
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold text-[#888888] uppercase tracking-wider hidden sm:inline">
                MIRZA PLATFORM V2 •
              </span>
              
              {/* Workspace / Environment Selector */}
              <div className="relative">
                <button
                  onClick={() => setWorkspaceOpen(!workspaceOpen)}
                  className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#FF5A1F] hover:text-white transition-colors bg-[#111111] px-2.5 py-0.5 rounded-md border border-[#1C1C1C]"
                >
                  <Layers className="h-3 w-3" />
                  <span className="truncate max-w-[150px] sm:max-w-[200px]">{currentWorkspace}</span>
                  <ChevronDown className="h-3 w-3 text-[#888888]" />
                </button>

                {workspaceOpen && (
                  <div className="absolute left-0 mt-2 w-64 rounded-xl border border-[#1C1C1C] bg-[#111111] p-2 shadow-2xl z-50 space-y-1 font-mono text-xs animate-in fade-in-50 zoom-in-95">
                    {[
                      { name: "Production (24/7 CBR Strict)", status: "ACTIVE", color: "text-[#10B981]" },
                      { name: "Staging Mirror (1080p Test)", status: "STANDBY", color: "text-[#3B82F6]" },
                      { name: "Local Sandbox (`--dry-run`)", status: "READY", color: "text-[#F59E0B]" },
                    ].map((ws) => (
                      <button
                        key={ws.name}
                        onClick={() => {
                          setCurrentWorkspace(ws.name)
                          setWorkspaceOpen(false)
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#1C1C1C] text-left transition-colors ${
                          currentWorkspace === ws.name ? "bg-[#1C1C1C] text-white font-bold" : "text-[#888888]"
                        }`}
                      >
                        <span className="truncate">{ws.name}</span>
                        <span className={`text-[10px] ${ws.color}`}>{ws.status}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              {formatPathname(pathname)}
            </h1>
          </div>
        </div>

        {/* Center: Global Command Palette (Ctrl+K like Raycast / VS Code) */}
        <div className="flex-1 max-w-md mx-4 hidden xl:block">
          <CommandPalette />
        </div>

        {/* Right Side: Status indicators & Actions */}
        <div className="flex items-center gap-2.5">
          <div className="xl:hidden">
            <CommandPalette />
          </div>

          {/* Server Status Indicator Pill */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#1C1C1C] bg-[#111111] text-xs font-mono text-[#10B981] shadow-inner">
                <span className="h-2 w-2 rounded-full bg-[#10B981] animate-ping" />
                <span className="font-bold tracking-wider">SERVER ONLINE</span>
                <span className="text-[#666666] border-l border-[#1C1C1C] pl-2 text-[10px]">1Hz Sync</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="font-mono text-xs">
              <p>Active supervisor (`ws://127.0.0.1:8000/ws/telemetry`) healthy</p>
            </TooltipContent>
          </Tooltip>

          {/* Quick Actions Popover */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuickActionsOpen(!quickActionsOpen)}
              className="text-xs font-mono h-9 border-[#1C1C1C] bg-[#111111] hover:border-[#FF5A1F]/50"
            >
              <Zap className="h-3.5 w-3.5 mr-1.5 text-[#FF5A1F]" /> Quick Actions
              <ChevronDown className="h-3 w-3 ml-1 text-[#888888]" />
            </Button>

            {quickActionsOpen && (
              <div className="absolute right-0 mt-2 w-60 rounded-xl border border-[#1C1C1C] bg-[#111111] p-2 shadow-2xl z-50 space-y-1 font-mono text-xs animate-in fade-in-50 zoom-in-95">
                <button
                  onClick={() => setQuickActionsOpen(false)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#1C1C1C] text-[#10B981] text-left transition-colors font-bold"
                >
                  <PlusCircle className="h-3.5 w-3.5 text-[#10B981]" /> Launch New Channel Worker
                </button>
                <button
                  onClick={() => setQuickActionsOpen(false)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#1C1C1C] text-[#F5F5F5] text-left transition-colors"
                >
                  <Play className="h-3.5 w-3.5 text-[#3B82F6]" /> Resume All Active Streams
                </button>
                <button
                  onClick={() => setQuickActionsOpen(false)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#1C1C1C] text-[#F5E0B] text-left transition-colors"
                >
                  <Square className="h-3.5 w-3.5 text-[#F59E0B]" /> Graceful Stop (`SIGTERM`)
                </button>
                <div className="border-t border-[#1C1C1C] my-1 pt-1">
                  <button
                    onClick={() => {
                      setQuickActionsOpen(false)
                      setEmergencyOpen(true)
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#E53935]/20 text-[#E53935] text-left transition-colors font-bold"
                  >
                    <Skull className="h-3.5 w-3.5" /> Emergency Kill (`SIGKILL`)
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Notifications Dropdown / Alert Center Preview */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative h-9 w-9 text-[#888888] hover:text-white bg-[#111111] border border-[#1C1C1C]"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[#FF5A1F] text-[10px] text-white flex items-center justify-center font-bold font-mono animate-bounce" />
              )}
              <span className="sr-only">Notifications</span>
            </Button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-84 rounded-xl border border-[#1C1C1C] bg-[#111111] p-4 shadow-2xl z-50 space-y-3 font-sans animate-in fade-in-50 zoom-in-95">
                <div className="flex items-center justify-between border-b border-[#1C1C1C] pb-2">
                  <span className="text-xs font-bold text-white font-mono uppercase flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-[#10B981]" /> Enterprise Alert Center ({unreadCount})
                  </span>
                  <button
                    onClick={() => {
                      setUnreadCount(0)
                      setNotificationsOpen(false)
                    }}
                    className="text-[11px] text-[#FF5A1F] hover:underline font-mono"
                  >
                    Clear All
                  </button>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-[#090909] border border-[#1C1C1C] space-y-1">
                    <div className="flex items-center justify-between font-mono">
                      <span className="text-[#F59E0B] font-bold flex items-center gap-1 text-[11px]">
                        <AlertTriangle className="h-3 w-3" /> FFmpeg Buffer Stabilization
                      </span>
                      <span className="text-[10px] text-[#888888]">12m ago</span>
                    </div>
                    <p className="text-[#888888] text-[11px] leading-relaxed">
                      `-bufsize 9000k` maintained strict CBR boundary during transition.
                    </p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#090909] border border-[#1C1C1C] space-y-1">
                    <div className="flex items-center justify-between font-mono">
                      <span className="text-[#10B981] font-bold flex items-center gap-1 text-[11px]">
                        <CheckCircle2 className="h-3 w-3" /> Auto-Recovery Handshake
                      </span>
                      <span className="text-[10px] text-[#888888]">1h ago</span>
                    </div>
                    <p className="text-[#888888] text-[11px] leading-relaxed">
                      Supervisor re-established RTMP connection to `a.rtmp.youtube.com`.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Theme Indicator & User Menu Pill */}
          <div className="flex items-center gap-2 pl-2 border-l border-[#1C1C1C]">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="h-9 w-9 rounded-xl bg-[#111111] border border-[#1C1C1C] flex items-center justify-center text-[#FF5A1F] font-mono text-xs font-bold shadow-sm">
                  SU
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="font-mono text-xs">
                <p>sufiy • Lead Systems Architect (Dark Theme #090909)</p>
              </TooltipContent>
            </Tooltip>
            <div className="hidden xl:flex flex-col text-left">
              <span className="text-xs font-bold text-white leading-none">sufiy (Lead)</span>
              <span className="text-[10px] font-mono text-[#10B981] leading-tight flex items-center gap-1 mt-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" /> Enterprise Admin
              </span>
            </div>
          </div>
        </div>

        {/* Emergency Kill Confirmation Dialog */}
        <Dialog open={emergencyOpen} onOpenChange={setEmergencyOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-[#E53935]">
                <Skull className="h-5 w-5" /> Confirm Emergency Kill (`SIGKILL`)
              </DialogTitle>
              <DialogDescription>
                This action immediately sends `SIGTERM` and `SIGKILL` to all running FFmpeg sub-processes and releases `mirza.lock`. All active live streams will drop instantly.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 font-mono text-xs text-[#888888] bg-[#090909] p-4 rounded-xl border border-[#1C1C1C] space-y-2">
              <div className="flex justify-between">
                <span>Target Processes:</span>
                <span className="text-white font-bold">channel_main (PID 14202)</span>
              </div>
              <div className="flex justify-between">
                <span>Lock File Action:</span>
                <span className="text-[#E53935] font-bold">FORCE UNLOCK</span>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setEmergencyOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => setEmergencyOpen(false)}
              >
                Execute Emergency Kill
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>
    </TooltipProvider>
  )
}
