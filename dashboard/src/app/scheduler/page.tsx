"use client"

import * as React from "react"
import { Calendar, Plus, Clock, Tv, CheckCircle2, Play } from "lucide-react"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

export default function SchedulerPage() {
  const [schedules, setSchedules] = React.useState([
    {
      id: 1,
      title: "Daytime Study Lo-Fi Schedule",
      cron: "0 8 * * * (Every morning at 08:00 AM)",
      folder: "media/daytime/",
      ytTitle: "🔴 24/7 Rainy Day Study Lo-Fi Beats To Relax / Focus",
      ytDesc: "Enjoy our morning chill study session. Looped automatically by Mirza Live Server.",
      status: "ACTIVE",
    },
    {
      id: 2,
      title: "Nighttime Deep Focus Rotation",
      cron: "0 22 * * * (Every evening at 10:00 PM)",
      folder: "media/lofi_mix/",
      ytTitle: "🌙 Midnight Vibes — Deep Sleep & Chill Coding Beats",
      ytDesc: "Smooth late night beats. Zero drop CBR stream.",
      status: "ACTIVE",
    },
  ])
  const [open, setOpen] = React.useState(false)

  return (
    <DashboardShell>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1C1C1C] pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Calendar className="h-6 w-6 text-[#FF5A1F]" /> Automated Scheduler &amp; YouTube API Sync
          </h1>
          <p className="text-sm text-[#888888] mt-1">
            Schedule playlist directory transitions and dynamically update YouTube Live broadcast metadata via API v3.
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="glow" size="sm">
              <Plus className="h-4 w-4 mr-1.5" /> New Schedule Profile
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[#FF5A1F]" /> Create Cron Schedule Profile
              </DialogTitle>
              <DialogDescription>
                Automate playlist directory rotation and YouTube broadcast title updates.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-3 font-sans text-sm">
              <div className="space-y-1">
                <label className="text-xs font-mono text-[#888888]">Profile Title</label>
                <Input defaultValue="Weekend Gameplay Marathon" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-mono text-[#888888]">Cron Expression (Minute Hour Day Month Week)</label>
                <Input defaultValue="0 12 * * 6,0" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-mono text-[#888888]">Target Media Folder</label>
                <Input defaultValue="media/gameplay/" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-mono text-[#888888]">YouTube Broadcast Title (Data API v3)</label>
                <Input defaultValue="🎮 4K Gameplay & Chill Beats Marathon" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={() => {
                  setSchedules((prev) => [
                    ...prev,
                    {
                      id: prev.length + 1,
                      title: "Weekend Gameplay Marathon",
                      cron: "0 12 * * 6,0 (Every weekend at 12:00 PM)",
                      folder: "media/gameplay/",
                      ytTitle: "🎮 4K Gameplay & Chill Beats Marathon",
                      ytDesc: "Automated weekend streaming event.",
                      status: "ACTIVE",
                    },
                  ])
                  setOpen(false)
                }}
              >
                Save Cron Schedule
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-6 font-mono text-xs">
        {schedules.map((profile) => (
          <Card key={profile.id} className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base text-white">{profile.title}</CardTitle>
                <CardDescription className="text-xs text-[#888888] flex items-center gap-1.5 mt-1">
                  <Clock className="h-3.5 w-3.5 text-[#FF5A1F]" /> {profile.cron}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="online">{profile.status}</Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSchedules((prev) =>
                      prev.map((s) => (s.id === profile.id ? { ...s, status: s.status === "ACTIVE" ? "PAUSED" : "ACTIVE" } : s))
                    )
                  }}
                  className="text-xs"
                >
                  {profile.status === "ACTIVE" ? "Pause Cron" : "Resume Cron"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 font-sans text-xs">
              <div className="p-3 rounded-xl bg-[#090909] border border-[#1C1C1C] flex justify-between items-center font-mono">
                <span className="text-[#888888]">Target Directory</span>
                <span className="text-white font-bold">{profile.folder}</span>
              </div>

              <div className="p-3 rounded-xl bg-[#090909] border border-[#1C1C1C] space-y-1.5">
                <div className="flex items-center gap-1.5 text-[#FF0000] font-bold font-mono text-[11px]">
                  <Tv className="h-4 w-4 fill-current" /> YouTube Data API v3 Sync
                </div>
                <div className="text-white font-bold">{profile.ytTitle}</div>
                <div className="text-[#888888] text-[11px]">{profile.ytDesc}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardShell>
  )
}
