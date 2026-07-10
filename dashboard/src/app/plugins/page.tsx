"use client"

import * as React from "react"
import { Plug, Plus, ShieldCheck, Send, CheckCircle2 } from "lucide-react"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

export default function PluginsPage() {
  const [plugins, setPlugins] = React.useState([
    { id: 1, name: "Discord Webhook Notifier", version: "v1.2.0", status: "ACTIVE", desc: "Sends rich embed cards to Discord when streams drop or restart." },
    { id: 2, name: "Telegram Alert Bot", version: "v1.0.1", status: "ACTIVE", desc: "Instantly alerts server admins via Telegram API on hardware CPU > 85%." },
    { id: 3, name: "Auto-Title Synchronizer", version: "v0.9.4", status: "INACTIVE", desc: "Updates YouTube stream title based on current playing MP4 filename." },
  ])
  const [discordUrl, setDiscordUrl] = React.useState("https://discord.com/api/webhooks/123456/abcdef...")
  const [sent, setSent] = React.useState(false)

  const togglePlugin = (id: number) => {
    setPlugins((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: p.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" } : p))
    )
  }

  return (
    <DashboardShell>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1C1C1C] pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Plug className="h-6 w-6 text-[#FF5A1F]" /> Event-Driven Plugins &amp; Webhooks
          </h1>
          <p className="text-sm text-[#888888] mt-1">
            Hook into `on_stream_start`, `on_error`, and `on_playlist_loop` events via custom Python plugins or JSON webhooks.
          </p>
        </div>
        <Button variant="glow" size="sm">
          <Plus className="h-4 w-4 mr-1.5" /> Install Custom Plugin (.py)
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
        {plugins.map((plugin) => (
          <Card key={plugin.id} className="glass-card flex flex-col justify-between">
            <CardHeader>
              <div className="flex justify-between items-center">
                <Badge variant={plugin.status === "ACTIVE" ? "online" : "outline"}>
                  {plugin.status}
                </Badge>
                <span className="text-[#888888]">{plugin.version}</span>
              </div>
              <CardTitle className="mt-2 text-base text-white">{plugin.name}</CardTitle>
              <CardDescription className="text-xs">{plugin.desc}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 rounded-xl bg-[#090909] border border-[#1C1C1C] flex justify-between">
                <span className="text-[#888888]">Event Hooks</span>
                <span className="text-[#10B981] font-bold">on_error, on_restart</span>
              </div>
            </CardContent>
            <CardFooter className="pt-2 border-t border-[#1C1C1C]/60">
              <Button
                variant={plugin.status === "ACTIVE" ? "outline" : "default"}
                size="sm"
                onClick={() => togglePlugin(plugin.id)}
                className="w-full text-xs"
              >
                {plugin.status === "ACTIVE" ? "Disable Plugin" : "Enable Plugin"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Card className="glass-card font-sans text-sm">
        <CardHeader>
          <CardTitle className="text-base text-white flex items-center gap-2">
            <Send className="h-4 w-4 text-[#FF5A1F]" /> Global Webhook Notification Configurator
          </CardTitle>
          <CardDescription className="text-xs font-mono">
            Direct JSON POST payloads dispatched asynchronously by `Orchestrator` on critical errors
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5 md:col-span-2 font-mono text-xs">
              <label className="text-[#888888]">Discord / Slack Webhook URL</label>
              <Input
                value={discordUrl}
                onChange={(e) => setDiscordUrl(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button
                variant="secondary"
                onClick={() => {
                  setSent(true)
                  setTimeout(() => setSent(false), 2500)
                }}
                className="w-full text-xs font-mono"
              >
                {sent ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-1.5 text-[#10B981]" /> Test Payload Sent!
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5 mr-1.5" /> Send Test Alert
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </DashboardShell>
  )
}
