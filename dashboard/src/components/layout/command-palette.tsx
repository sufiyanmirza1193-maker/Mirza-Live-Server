"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Radio,
  Tv,
  ListVideo,
  FolderOpen,
  Calendar,
  BarChart2,
  Plug,
  Terminal,
  Bell,
  Settings,
  Play,
  RotateCcw,
  SunMoon,
  Search,
  ShieldAlert,
  Skull,
  Square,
  UploadCloud,
  PlusCircle,
  Activity,
} from "lucide-react"
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
} from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"

export function CommandPalette() {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false)
    command()
  }, [])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Open Command Palette"
        className="inline-flex items-center gap-2 rounded-xl border border-[#1C1C1C] bg-[#111111] px-3 py-1.5 text-xs text-[#888888] shadow-sm hover:border-[#FF5A1F]/50 hover:text-white transition-all w-full max-w-md justify-between group"
      >
        <span className="flex items-center gap-2 font-medium">
          <Search className="h-3.5 w-3.5 text-[#888888] group-hover:text-[#FF5A1F] transition-colors" />
          <span>Quick search or command...</span>
        </span>
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded bg-[#1C1C1C] px-1.5 font-mono text-[10px] font-medium text-[#888888] group-hover:text-white">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search sections..." />
        <CommandList className="max-h-[440px] scrollbar-thin">
          <CommandEmpty className="py-6 text-center text-xs font-mono text-[#888888]">
            No matching commands or navigation endpoints found.
          </CommandEmpty>
          
          <CommandGroup heading="Broadcast Actions">
            <CommandItem
              onSelect={() => runCommand(() => alert("Launching Mirza Main Channel stream..."))}
              className="group font-sans text-xs"
            >
              <Play className="h-4 w-4 mr-2 text-[#10B981]" />
              <span className="font-bold text-white">Start Channel Broadcast</span>
              <span className="text-[#888888] ml-2 text-[11px] font-mono truncate">(`channel_main` RTMP Output)</span>
              <Badge variant="online" className="ml-auto text-[10px] px-1.5 py-0 font-mono">INSTANT</Badge>
            </CommandItem>

            <CommandItem
              onSelect={() => runCommand(() => alert("Executing: Start Stream across active workers..."))}
              className="group font-sans text-xs"
            >
              <Play className="h-4 w-4 mr-2 text-[#10B981]" />
              <span>Start Stream</span>
              <CommandShortcut>⌘S</CommandShortcut>
            </CommandItem>

            <CommandItem
              onSelect={() => runCommand(() => alert("Executing: Stop Stream gracefully (`SIGTERM`)."))}
              className="group font-sans text-xs"
            >
              <Square className="h-4 w-4 mr-2 text-[#F59E0B]" />
              <span>Stop Stream</span>
              <CommandShortcut>Alt+S</CommandShortcut>
            </CommandItem>

            <CommandItem
              onSelect={() => runCommand(() => alert("Restarting FFmpeg encoder process..."))}
              className="group font-sans text-xs"
            >
              <RotateCcw className="h-4 w-4 mr-2 text-[#FF5A1F]" />
              <span>Restart FFmpeg Process</span>
              <CommandShortcut>⌘R</CommandShortcut>
            </CommandItem>

            <CommandItem
              onSelect={() => runCommand(() => alert("Executing: Restart Worker (`PID 14202`)."))}
              className="group font-sans text-xs"
            >
              <RotateCcw className="h-4 w-4 mr-2 text-[#FF5A1F]" />
              <span>Restart Worker</span>
              <CommandShortcut>Ctrl+R</CommandShortcut>
            </CommandItem>

            <CommandItem
              onSelect={() => runCommand(() => alert("Running media verification check..."))}
              className="group font-sans text-xs"
            >
              <ShieldAlert className="h-4 w-4 mr-2 text-[#3B82F6]" />
              <span>Validate Media Directory</span>
              <CommandShortcut>⌘V</CommandShortcut>
            </CommandItem>

            <CommandItem
              onSelect={() => runCommand(() => alert("CRITICAL: Sending SIGKILL to all FFmpeg sub-processes!"))}
              className="group font-sans text-xs text-[#E53935]"
            >
              <Skull className="h-4 w-4 mr-2 text-[#E53935]" />
              <span className="font-bold text-[#E53935]">Emergency Kill (`SIGKILL`)</span>
              <Badge variant="destructive" className="ml-auto text-[10px] px-1.5 py-0 font-mono">HIGH RISK</Badge>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Content & Media Tasks">
            <CommandItem
              onSelect={() => runCommand(() => router.push("/media"))}
              className="group font-sans text-xs"
            >
              <UploadCloud className="h-4 w-4 mr-2 text-[#3B82F6]" />
              <span>Upload Media</span>
              <CommandShortcut>G M</CommandShortcut>
            </CommandItem>

            <CommandItem
              onSelect={() => runCommand(() => router.push("/playlists"))}
              className="group font-sans text-xs"
            >
              <PlusCircle className="h-4 w-4 mr-2 text-[#10B981]" />
              <span>Create Playlist</span>
              <CommandShortcut>G P</CommandShortcut>
            </CommandItem>

            <CommandItem
              onSelect={() => runCommand(() => router.push("/scheduler"))}
              className="group font-sans text-xs"
            >
              <Calendar className="h-4 w-4 mr-2 text-[#F59E0B]" />
              <span>Open Scheduler</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Navigation">
            <CommandItem onSelect={() => runCommand(() => router.push("/"))} className="font-sans text-xs">
              <LayoutDashboard className="h-4 w-4 mr-2 text-[#888888]" />
              <span>Dashboard Overview</span>
              <CommandShortcut>G D</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/channels"))} className="font-sans text-xs">
              <Radio className="h-4 w-4 mr-2 text-[#888888]" />
              <span>Channels Management</span>
              <CommandShortcut>G C</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/streams"))} className="font-sans text-xs">
              <Tv className="h-4 w-4 mr-2 text-[#888888]" />
              <span>Live Streams &amp; Telemetry</span>
              <CommandShortcut>G S</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/playlists"))} className="font-sans text-xs">
              <ListVideo className="h-4 w-4 mr-2 text-[#888888]" />
              <span>Playlist Builder</span>
              <CommandShortcut>G P</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/media"))} className="font-sans text-xs">
              <FolderOpen className="h-4 w-4 mr-2 text-[#888888]" />
              <span>Media Library</span>
              <CommandShortcut>G M</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/scheduler"))} className="font-sans text-xs">
              <Calendar className="h-4 w-4 mr-2 text-[#888888]" />
              <span>Scheduler &amp; Cron</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/analytics"))} className="font-sans text-xs">
              <BarChart2 className="h-4 w-4 mr-2 text-[#888888]" />
              <span>Streaming Analytics</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/plugins"))} className="font-sans text-xs">
              <Plug className="h-4 w-4 mr-2 text-[#888888]" />
              <span>Plugins &amp; Webhooks</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/logs"))} className="font-sans text-xs">
              <Terminal className="h-4 w-4 mr-2 text-[#888888]" />
              <span>Real-time System Logs</span>
              <CommandShortcut>G L</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => alert("Opening real-time system logs tail..."))} className="font-sans text-xs">
              <Terminal className="h-4 w-4 mr-2 text-[#888888]" />
              <span className="font-bold text-white">Open Logs</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/notifications"))} className="font-sans text-xs">
              <Bell className="h-4 w-4 mr-2 text-[#888888]" />
              <span>Notifications &amp; Alerts</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/settings"))} className="font-sans text-xs">
              <Settings className="h-4 w-4 mr-2 text-[#888888]" />
              <span>Server Settings</span>
              <CommandShortcut>⌘,</CommandShortcut>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="System Preferences">
            <CommandItem
              onSelect={() => runCommand(() => alert("Toggling high-contrast enterprise theme..."))}
            >
              <SunMoon className="h-4 w-4 mr-2 text-[#888888]" />
              <span>Toggle High-Contrast Mode</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
