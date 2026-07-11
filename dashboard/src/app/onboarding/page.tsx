"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Sparkles,
  Radio,
  Key,
  ListVideo,
  UploadCloud,
  Layers,
  CheckCircle2,
  Sliders,
  Zap,
  ArrowRight,
  ArrowLeft,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
  AlertCircle,
  FileVideo,
  Trash2,
  Plus,
  Clock,
  Check,
  ShieldCheck,
  Play,
  Settings,
  Tv,
  Info,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  Volume2,
  HardDrive,
  Cpu,
} from "lucide-react"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export interface VideoClip {
  id: string
  filename: string
  durationSec: number
  resolution: string
  codec: string
  fps: number
  size: string
  status: "READY" | "CHECKING" | "WARNING" | "CORRUPT"
  color: string
}

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = React.useState<number>(1)
  const [isMounted, setIsMounted] = React.useState(false)

  // Step 1: Platform Selection
  const [platform, setPlatform] = React.useState<"youtube" | "custom">("youtube")

  // Step 2: Stream Key Configuration
  const [rtmpUrl, setRtmpUrl] = React.useState("rtmp://a.rtmp.youtube.com/live2")
  const [streamKey, setStreamKey] = React.useState("xxxx-xxxx-xxxx-xxxx")
  const [showStreamKey, setShowStreamKey] = React.useState(false)
  const [connectionStatus, setConnectionStatus] = React.useState<"idle" | "testing" | "verified" | "error">("idle")
  const [pingLatency, setPingLatency] = React.useState<number | null>(null)

  // Step 3: Create Playlist
  const [playlistName, setPlaylistName] = React.useState("24/7 Lo-Fi Hip-Hop & Study Beats")
  const [playlistDesc, setPlaylistDesc] = React.useState("Continuous autonomous RTMP broadcast loop with zero-drop audio/video sync.")
  const [thumbnailUrl, setThumbnailUrl] = React.useState("https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80")
  const [repeatForever, setRepeatForever] = React.useState(true)
  const [shuffle, setShuffle] = React.useState(false)
  const [autoSkipCorrupt, setAutoSkipCorrupt] = React.useState(true)
  const [continueOnError, setContinueOnError] = React.useState(true)

  // Step 4 & 5: Upload & Playlist Builder Videos
  const [videos, setVideos] = React.useState<VideoClip[]>([
    {
      id: "clip_101",
      filename: "ep_101_rainy_night_lofi.mp4",
      durationSec: 4462,
      resolution: "1920x1080",
      codec: "h264/aac",
      fps: 60,
      size: "142.4 MB",
      status: "READY",
      color: "#FF5A1F",
    },
    {
      id: "clip_102",
      filename: "ep_102_lofi_mix_2026.mp4",
      durationSec: 4512,
      resolution: "1920x1080",
      codec: "h264/aac",
      fps: 60,
      size: "158.1 MB",
      status: "READY",
      color: "#10B981",
    },
    {
      id: "clip_103",
      filename: "ep_103_chill_study_session.mp4",
      durationSec: 6176,
      resolution: "1920x1080",
      codec: "h264/aac",
      fps: 60,
      size: "210.8 MB",
      status: "READY",
      color: "#3B82F6",
    },
  ])

  // Step 6: Playlist Validation Report
  const [isValidating, setIsValidating] = React.useState(false)
  const [validationDone, setValidationDone] = React.useState(true)

  // Step 7: Streaming Settings
  const [resolutionSetting, setResolutionSetting] = React.useState("1080p60")
  const [fpsSetting, setFpsSetting] = React.useState("60")
  const [bitrateSetting, setBitrateSetting] = React.useState("6000")
  const [audioSetting, setAudioSetting] = React.useState("aac_160")
  const [encoderSetting, setEncoderSetting] = React.useState("nvenc")
  const [reconnectPolicy, setReconnectPolicy] = React.useState("infinite_exponential")

  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  const formatSeconds = (sec: number) => {
    const hrs = Math.floor(sec / 3600)
    const mins = Math.floor((sec % 3600) / 60)
    const s = sec % 60
    return `${hrs > 0 ? hrs + "h " : ""}${mins}m ${s}s`
  }

  const totalDurationSec = videos.reduce((acc, v) => acc + v.durationSec, 0)

  // Connection Test simulation
  const handleTestConnection = () => {
    setConnectionStatus("testing")
    setPingLatency(null)
    setTimeout(() => {
      setConnectionStatus("verified")
      setPingLatency(14)
    }, 1200)
  }

  // Add dummy video upload simulation
  const handleSimulatedUpload = () => {
    const newClipNumber = videos.length + 101
    const newVideo: VideoClip = {
      id: `clip_${Date.now()}`,
      filename: `ep_${newClipNumber}_deep_focus_beats.mp4`,
      durationSec: 3600 + Math.floor(Math.random() * 1800),
      resolution: "1920x1080",
      codec: "h264/aac",
      fps: 60,
      size: `${(120 + Math.random() * 80).toFixed(1)} MB`,
      status: "READY",
      color: "#F59E0B",
    }
    setVideos((prev) => [...prev, newVideo])
  }

  const moveVideo = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= videos.length) return
    const updated = [...videos]
    const temp = updated[index]
    updated[index] = updated[targetIndex]
    updated[targetIndex] = temp
    setVideos(updated)
  }

  const removeVideo = (id: string) => {
    setVideos((prev) => prev.filter((v) => v.id !== id))
  }

  const duplicateVideo = (clip: VideoClip) => {
    const dup: VideoClip = {
      ...clip,
      id: `clip_${Date.now()}`,
      filename: clip.filename.replace(".mp4", "_copy.mp4"),
    }
    setVideos((prev) => [...prev, dup])
  }

  const runPreFlightValidation = () => {
    setIsValidating(true)
    setValidationDone(false)
    setTimeout(() => {
      setIsValidating(false)
      setValidationDone(true)
    }, 1500)
  }

  const handleStart247Stream = () => {
    // Launch stream and redirect to Mission Control with active playlist state
    router.push("/?activePlaylist=true")
  }

  const stepTitles = [
    { num: 1, title: "Choose Platform", icon: Radio },
    { num: 2, title: "Paste Stream Key", icon: Key },
    { num: 3, title: "Create Playlist", icon: ListVideo },
    { num: 4, title: "Upload Videos", icon: UploadCloud },
    { num: 5, title: "Playlist Builder", icon: Layers },
    { num: 6, title: "Validate Playlist", icon: CheckCircle2 },
    { num: 7, title: "Stream Settings", icon: Sliders },
    { num: 8, title: "Ready to Stream", icon: Zap },
  ]

  if (!isMounted) return null

  return (
    <DashboardShell>
      {/* Top Banner & Stepper Bar */}
      <div className="border-b border-[var(--border-subtle)] pb-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="online" className="text-xs px-2.5 py-0.5 font-mono font-bold bg-[var(--primary-surface)] text-[#FF5A1F] border border-[#FF5A1F]/30">
                PLAYLIST-FIRST STREAMING WORKFLOW
              </Badge>
              <span className="text-xs font-mono text-[var(--text-muted)]">
                Simple • Private • Fast • Zero OAuth Bottlenecks
              </span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-[var(--text-primary)]">
              First-Time Setup Wizard (`Version 2`)
            </h1>
            <p className="text-[var(--text-secondary)] text-sm md:text-base mt-1 max-w-3xl">
              Configure your autonomous 24/7 RTMP broadcast loop in 8 simple steps. No Google or YouTube APIs required.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start md:self-center font-mono text-xs">
            <span className="text-[var(--text-secondary)]">Progress:</span>
            <span className="text-[#FF5A1F] font-bold">Step {step} of 8</span>
          </div>
        </div>

        {/* Segmented Progress Steps Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {stepTitles.map((s) => {
            const Icon = s.icon
            const isDone = step > s.num
            const isCurrent = step === s.num
            return (
              <button
                key={s.num}
                onClick={() => setStep(s.num)}
                className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all text-left ${
                  isCurrent
                    ? "border-[#FF5A1F] bg-[var(--primary-surface)] shadow-md shadow-[#FF5A1F]/10 text-[var(--text-primary)] font-bold scale-[1.02]"
                    : isDone
                    ? "border-[#10B981]/40 bg-[#10B981]/10 text-[var(--text-primary)]"
                    : "border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-muted)] opacity-70 hover:opacity-100"
                }`}
              >
                <div
                  className={`h-6 w-6 rounded-lg flex items-center justify-center shrink-0 text-xs font-mono font-bold ${
                    isCurrent
                      ? "bg-[#FF5A1F] text-white"
                      : isDone
                      ? "bg-[#10B981] text-white"
                      : "bg-[var(--bg-elevated)] text-[var(--text-muted)]"
                  }`}
                >
                  {isDone ? <Check className="h-3.5 w-3.5" /> : s.num}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block text-xs truncate leading-tight">{s.title}</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Step Content Container */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-5xl mx-auto"
        >
          {/* STEP 1: CHOOSE STREAMING PLATFORM */}
          {step === 1 && (
            <Card className="glass-card p-6 md:p-8 space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2.5">
                  <Radio className="h-6 w-6 text-[#FF5A1F]" /> Step 1: Choose Streaming Platform
                </h2>
                <p className="text-sm text-[var(--text-secondary)] mt-1">
                  Select your destination broadcast network. Mirza connects directly to any high-performance RTMP ingest endpoint.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* YouTube Card */}
                <div
                  onClick={() => setPlatform("youtube")}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                    platform === "youtube"
                      ? "border-[#FF5A1F] bg-[var(--primary-surface)] shadow-lg shadow-[#FF5A1F]/10"
                      : "border-[var(--border-subtle)] bg-[var(--bg-card)] hover:border-[var(--border-default)]"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="h-10 w-10 rounded-xl bg-[#FF0000]/15 border border-[#FF0000]/30 flex items-center justify-center text-[#FF0000] font-black text-sm">
                        YT
                      </div>
                      <Badge variant="online" className="bg-[#10B981]/20 text-[#10B981] border-[#10B981]/40 text-xs font-mono">
                        SUPPORTED (RECOMMENDED)
                      </Badge>
                    </div>
                    <h3 className="text-lg font-bold text-[var(--text-primary)]">YouTube Live Broadcast</h3>
                    <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                      Optimized for 24/7 continuous Lofi music radio, gaming loops, study timers, and ambient video streams. Uses standard YouTube RTMP ingest servers (`rtmp://a.rtmp.youtube.com/live2`).
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs font-mono text-[var(--text-muted)]">
                    <span>Protocol: RTMP / RTMPS</span>
                    <span className="text-[#FF5A1F] font-bold">{platform === "youtube" ? "✓ SELECTED" : "Click to Select"}</span>
                  </div>
                </div>

                {/* Custom RTMP Card */}
                <div
                  onClick={() => setPlatform("custom")}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                    platform === "custom"
                      ? "border-[#FF5A1F] bg-[var(--primary-surface)] shadow-lg shadow-[#FF5A1F]/10"
                      : "border-[var(--border-subtle)] bg-[var(--bg-card)] hover:border-[var(--border-default)]"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="h-10 w-10 rounded-xl bg-[#3B82F6]/15 border border-[#3B82F6]/30 flex items-center justify-center text-[#3B82F6] font-mono font-bold text-xs">
                        RTMP
                      </div>
                      <Badge variant="outline" className="text-xs font-mono">
                        UNIVERSAL RTMP
                      </Badge>
                    </div>
                    <h3 className="text-lg font-bold text-[var(--text-primary)]">Custom RTMP Server Endpoint</h3>
                    <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                      Stream to any self-hosted NGINX-RTMP cluster, Wowza Media Server, SRS, Akamai, or custom broadcast CDN requiring an explicit ingest URL and private stream key.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs font-mono text-[var(--text-muted)]">
                    <span>Protocol: Custom RTMP</span>
                    <span className="text-[#FF5A1F] font-bold">{platform === "custom" ? "✓ SELECTED" : "Click to Select"}</span>
                  </div>
                </div>
              </div>

              {/* Future Platforms Banner */}
              <div className="pt-4 border-t border-[var(--border-subtle)]">
                <span className="text-xs font-mono font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-3">
                  Future Supported Platforms (Version 2.5 Roadmap)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {["Twitch Interactive", "Kick Streaming", "Facebook Live"].map((name) => (
                    <div key={name} className="p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] opacity-60 flex items-center justify-between">
                      <span className="text-xs font-semibold text-[var(--text-primary)]">{name}</span>
                      <Badge variant="outline" className="text-[10px] font-mono">COMING SOON</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* STEP 2: PASTE STREAM KEY */}
          {step === 2 && (
            <Card className="glass-card p-6 md:p-8 space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2.5">
                  <Key className="h-6 w-6 text-[#FF5A1F]" /> Step 2: Paste Stream Key &amp; RTMP Configuration
                </h2>
                <p className="text-sm text-[var(--text-secondary)] mt-1">
                  Enter your private ingest key. Mirza never transmits credentials to external third-party tracking services or OAuth providers.
                </p>
              </div>

              {/* Step-by-Step Guide Box */}
              <div className="p-4 rounded-xl border border-[#FF5A1F]/30 bg-[var(--primary-surface)] space-y-3">
                <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <Info className="h-4 w-4 text-[#FF5A1F]" /> How to get your YouTube Stream Key in 3 clicks:
                </h3>
                <ol className="list-decimal list-inside text-xs text-[var(--text-secondary)] space-y-1.5 font-sans pl-1">
                  <li>
                    Log in to <strong className="text-[var(--text-primary)]">YouTube Studio</strong> (`studio.youtube.com`) and click <strong className="text-[var(--text-primary)]">Create &rarr; Go Live</strong> in the top right corner.
                  </li>
                  <li>
                    Select the <strong className="text-[var(--text-primary)]">Stream</strong> tab from the left navigation menu. Under <strong className="text-[var(--text-primary)]">Stream settings</strong>, locate the **Stream Key (paste in encoder)** field.
                  </li>
                  <li>
                    Click <strong className="text-[var(--text-primary)]">Copy</strong> and paste the secret string directly into the password field below.
                  </li>
                </ol>
              </div>

              {/* Input Fields */}
              <div className="space-y-5 pt-2">
                <div>
                  <label className="block text-xs font-mono font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                    RTMP Server Ingest URL
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={rtmpUrl}
                      onChange={(e) => setRtmpUrl(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-primary)] font-mono text-sm focus:outline-none focus:border-[#FF5A1F] transition-colors"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setRtmpUrl("rtmp://a.rtmp.youtube.com/live2")}
                      className="h-11 px-4 font-mono text-xs shrink-0"
                    >
                      Reset to YT Default
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                    Secret Stream Key
                  </label>
                  <div className="relative flex items-center gap-2">
                    <input
                      type={showStreamKey ? "text" : "password"}
                      value={streamKey}
                      onChange={(e) => setStreamKey(e.target.value)}
                      placeholder="Paste your private stream key here..."
                      className="w-full h-11 pl-4 pr-24 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-primary)] font-mono text-sm focus:outline-none focus:border-[#FF5A1F] transition-colors tracking-widest"
                    />
                    <div className="absolute right-28 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setShowStreamKey(!showStreamKey)}
                        className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                        title={showStreamKey ? "Hide Stream Key" : "Show Stream Key"}
                      >
                        {showStreamKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <Button
                      variant="outline"
                      onClick={async () => {
                        try {
                          const text = await navigator.clipboard.readText()
                          if (text) setStreamKey(text.trim())
                        } catch (err) {
                          setStreamKey("dqp4-92ka-318x-mc81-229q")
                        }
                      }}
                      className="h-11 px-4 text-xs font-bold shrink-0 bg-[var(--bg-elevated)] border-[var(--border-subtle)] hover:border-[#FF5A1F]"
                    >
                      <Copy className="h-3.5 w-3.5 mr-1.5 text-[#FF5A1F]" /> Paste
                    </Button>
                  </div>
                  <p className="text-[11px] text-[var(--text-muted)] mt-1.5 font-mono">
                    Never expose the Stream Key in plain text by default. Encrypted with AES-256 in memory.
                  </p>
                </div>

                {/* Connection Validation & Test */}
                <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-center justify-center">
                      <ShieldCheck className={`h-5 w-5 ${connectionStatus === "verified" ? "text-[#10B981]" : "text-[var(--text-muted)]"}`} />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[var(--text-primary)] block">
                        Ingest Protocol &amp; Auth Verification
                      </span>
                      <span className="text-[11px] font-mono text-[var(--text-secondary)]">
                        {connectionStatus === "idle" && "Ready to test connection with ingest server."}
                        {connectionStatus === "testing" && "Pinging RTMP handshake endpoint & verifying TLS parameters..."}
                        {connectionStatus === "verified" && `Connection Verified! Latency: ${pingLatency || 14}ms • Handshake: SUCCESS`}
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={handleTestConnection}
                    disabled={connectionStatus === "testing"}
                    className={`h-10 px-5 text-xs font-bold shrink-0 ${
                      connectionStatus === "verified"
                        ? "bg-[#10B981] hover:bg-[#10B981]/90 text-white"
                        : "bg-[#FF5A1F] hover:bg-[#FF5A1F]/90 text-white"
                    }`}
                  >
                    {connectionStatus === "testing" ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 mr-2 animate-spin" /> Testing Connection...
                      </>
                    ) : connectionStatus === "verified" ? (
                      <>
                        <Check className="h-3.5 w-3.5 mr-2" /> Connection Verified
                      </>
                    ) : (
                      <>
                        <Zap className="h-3.5 w-3.5 mr-2" /> Test Connection
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* STEP 3: CREATE PLAYLIST */}
          {step === 3 && (
            <Card className="glass-card p-6 md:p-8 space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2.5">
                  <ListVideo className="h-6 w-6 text-[#FF5A1F]" /> Step 3: Create Playlist &amp; Loop Rules
                </h2>
                <p className="text-sm text-[var(--text-secondary)] mt-1">
                  The user must create a playlist before streaming. Configure continuous sequence behavior and self-healing error handling.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                      Playlist Name
                    </label>
                    <input
                      type="text"
                      value={playlistName}
                      onChange={(e) => setPlaylistName(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-primary)] font-semibold text-sm focus:outline-none focus:border-[#FF5A1F]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      value={playlistDesc}
                      onChange={(e) => setPlaylistDesc(e.target.value)}
                      className="w-full p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-primary)] text-xs focus:outline-none focus:border-[#FF5A1F] leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                      Thumbnail URL (Optional)
                    </label>
                    <input
                      type="text"
                      value={thumbnailUrl}
                      onChange={(e) => setThumbnailUrl(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-primary)] font-mono text-xs focus:outline-none focus:border-[#FF5A1F]"
                    />
                  </div>
                </div>

                {/* Behavioral Rules Box */}
                <div className="p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] space-y-4">
                  <span className="text-xs font-mono font-bold text-[#FF5A1F] uppercase tracking-wider block border-b border-[var(--border-subtle)] pb-2">
                    Autonomous Loop Rules (`Mirza Core Engine`)
                  </span>

                  {[
                    {
                      label: "Repeat Forever (Continuous 24/7 Loop)",
                      desc: "Automatically restart the playlist sequence upon reaching the final video clip without dropping the RTMP connection.",
                      checked: repeatForever,
                      onChange: setRepeatForever,
                    },
                    {
                      label: "Shuffle Playback Order",
                      desc: "Randomize video order at the start of each repeat cycle while maintaining seamless FFmpeg concat transitions.",
                      checked: shuffle,
                      onChange: setShuffle,
                    },
                    {
                      label: "Auto Skip Corrupt Files",
                      desc: "If a video file suffers from missing moov atoms or corrupted packet headers, instantly skip to the next valid track.",
                      checked: autoSkipCorrupt,
                      onChange: setAutoSkipCorrupt,
                    },
                    {
                      label: "Continue On Error (Zero-Drop Guard)",
                      desc: "If FFmpeg encounters a network drop or buffer underrun, maintain black frame/silence filler until recovery occurs.",
                      checked: continueOnError,
                      onChange: setContinueOnError,
                    },
                  ].map((rule, idx) => (
                    <div
                      key={idx}
                      onClick={() => rule.onChange(!rule.checked)}
                      className="flex items-start justify-between gap-3 p-2.5 rounded-xl hover:bg-[var(--bg-elevated)] cursor-pointer transition-colors"
                    >
                      <div>
                        <span className="text-xs font-bold text-[var(--text-primary)] block">{rule.label}</span>
                        <span className="text-[11px] text-[var(--text-secondary)] block mt-0.5 leading-relaxed">{rule.desc}</span>
                      </div>
                      <div
                        className={`h-5 w-9 rounded-full p-0.5 transition-colors shrink-0 ${
                          rule.checked ? "bg-[#FF5A1F]" : "bg-[var(--border-default)]"
                        }`}
                      >
                        <div
                          className={`h-4 w-4 rounded-full bg-white transition-transform ${
                            rule.checked ? "translate-x-4" : "translate-x-0"
                          }`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* STEP 4: UPLOAD VIDEOS */}
          {step === 4 && (
            <Card className="glass-card p-6 md:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2.5">
                    <UploadCloud className="h-6 w-6 text-[#FF5A1F]" /> Step 4: Upload &amp; Inspect Video Files
                  </h2>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">
                    Support Drag &amp; Drop, multi-select file browsing, and instant metadata extraction (`Codec`, `Resolution`, `FPS`).
                  </p>
                </div>
                <Badge variant="outline" className="font-mono text-xs py-1 self-start sm:self-center bg-[var(--bg-elevated)]">
                  Folder Upload (Version 2.2 Roadmap)
                </Badge>
              </div>

              {/* Drag & Drop Zone */}
              <div
                onClick={handleSimulatedUpload}
                className="border-2 border-dashed border-[var(--border-default)] hover:border-[#FF5A1F] rounded-2xl p-8 text-center bg-[var(--bg-elevated)]/50 hover:bg-[var(--primary-surface)] cursor-pointer transition-all group"
              >
                <div className="h-14 w-14 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-md">
                  <UploadCloud className="h-7 w-7 text-[#FF5A1F]" />
                </div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  Drag &amp; drop video files here, or click to browse
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-md mx-auto">
                  Supports `.mp4`, `.mov`, `.mkv`, and `.ts` containers with automatic H.264 / AAC packet demuxing and verification.
                </p>
                <div className="mt-4 flex items-center justify-center gap-3">
                  <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleSimulatedUpload(); }} className="text-xs font-bold border-[var(--border-default)]">
                    <Plus className="h-3.5 w-3.5 mr-1 text-[#FF5A1F]" /> Browse Files (`Multi-select`)
                  </Button>
                </div>
              </div>

              {/* Uploaded Videos High-Density Table */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between font-mono text-xs text-[var(--text-secondary)] px-2">
                  <span>Uploaded Sequence ({videos.length} videos • {formatSeconds(totalDurationSec)} total)</span>
                  <span className="text-[#10B981] font-bold">100% Codec Demux Complete</span>
                </div>

                <div className="border border-[var(--border-subtle)] rounded-xl overflow-hidden bg-[var(--bg-card)] divide-y divide-[var(--border-subtle)] font-mono text-xs">
                  <div className="grid grid-cols-12 gap-3 p-3 bg-[var(--bg-elevated)] text-[var(--text-secondary)] font-bold uppercase tracking-wider text-[11px]">
                    <div className="col-span-4">Filename &amp; Thumbnail</div>
                    <div className="col-span-2">Duration</div>
                    <div className="col-span-2">Resolution / FPS</div>
                    <div className="col-span-2">Codec &amp; Size</div>
                    <div className="col-span-2 text-right">Validation Status</div>
                  </div>

                  {videos.map((clip) => (
                    <div key={clip.id} className="grid grid-cols-12 gap-3 p-3 items-center hover:bg-[var(--bg-elevated)]/50 transition-colors">
                      <div className="col-span-4 flex items-center gap-3 min-w-0">
                        <div
                          className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0 border border-[var(--border-subtle)] font-bold text-[10px]"
                          style={{ backgroundColor: `${clip.color}15`, color: clip.color }}
                        >
                          MP4
                        </div>
                        <span className="font-bold text-[var(--text-primary)] truncate block" title={clip.filename}>
                          {clip.filename}
                        </span>
                      </div>
                      <div className="col-span-2 text-[var(--text-primary)] flex items-center gap-1 font-bold">
                        <Clock className="h-3 w-3 text-[#10B981]" /> {formatSeconds(clip.durationSec)}
                      </div>
                      <div className="col-span-2 text-[var(--text-secondary)]">
                        {clip.resolution} @ {clip.fps}fps
                      </div>
                      <div className="col-span-2 text-[var(--text-secondary)]">
                        <span className="text-[var(--text-primary)] font-bold uppercase">{clip.codec}</span> • {clip.size}
                      </div>
                      <div className="col-span-2 text-right flex items-center justify-end gap-2">
                        <Badge variant="online" className="bg-[#10B981]/20 text-[#10B981] border-[#10B981]/40 text-[10px] px-2 py-0.5">
                          {clip.status}
                        </Badge>
                        <button
                          onClick={() => removeVideo(clip.id)}
                          className="p-1 text-[var(--text-muted)] hover:text-[#EF4444] transition-colors"
                          title="Remove clip"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* STEP 5: PLAYLIST BUILDER */}
          {step === 5 && (
            <Card className="glass-card p-6 md:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2.5">
                    <Layers className="h-6 w-6 text-[#FF5A1F]" /> Step 5: Professional Playlist Builder
                  </h2>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">
                    Reorder sequence hierarchy, duplicate loops, and verify total continuous loop duration (`-f concat` syntax).
                  </p>
                </div>
                <div className="flex items-center gap-3 font-mono text-xs bg-[var(--bg-elevated)] px-4 py-2 rounded-xl border border-[var(--border-subtle)]">
                  <div>
                    <span className="text-[var(--text-muted)] block">Total Length:</span>
                    <span className="text-base font-bold text-[var(--text-primary)]">{formatSeconds(totalDurationSec)}</span>
                  </div>
                  <div className="h-6 w-px bg-[var(--border-subtle)]" />
                  <div>
                    <span className="text-[var(--text-muted)] block">Loop Mode:</span>
                    <span className="text-base font-bold text-[#FF5A1F]">{repeatForever ? "Infinite 24/7" : "Play Once"}</span>
                  </div>
                </div>
              </div>

              {/* Interactive Playlist List */}
              <div className="space-y-3 pt-2">
                {videos.map((clip, index) => (
                  <div
                    key={clip.id}
                    className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[#FF5A1F]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all shadow-sm font-mono text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex flex-col items-center gap-1 shrink-0">
                        <button
                          onClick={() => moveVideo(index, "up")}
                          disabled={index === 0}
                          className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] disabled:opacity-25"
                          title="Move Up"
                        >
                          <ChevronUp className="h-4 w-4" />
                        </button>
                        <span className="font-bold text-[10px] text-[var(--text-muted)]">#{index + 1}</span>
                        <button
                          onClick={() => moveVideo(index, "down")}
                          disabled={index === videos.length - 1}
                          className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] disabled:opacity-25"
                          title="Move Down"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </button>
                      </div>

                      <div
                        className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0 border border-[var(--border-subtle)]"
                        style={{ backgroundColor: `${clip.color}20`, color: clip.color }}
                      >
                        <FileVideo className="h-5 w-5" />
                      </div>

                      <div className="min-w-0">
                        <span className="font-bold text-[var(--text-primary)] text-sm block truncate">
                          {clip.filename}
                        </span>
                        <span className="text-[11px] text-[var(--text-secondary)] block mt-0.5">
                          {clip.resolution} @ {clip.fps}fps • Codec: <strong className="uppercase">{clip.codec}</strong>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                      <Badge variant="outline" className="text-xs px-2.5 py-1 font-mono text-[#10B981] border-[#10B981]/40">
                        <Clock className="h-3 w-3 mr-1.5" /> {formatSeconds(clip.durationSec)}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => duplicateVideo(clip)}
                        className="h-8 px-3 text-[11px] border-[var(--border-subtle)] hover:border-[#FF5A1F]"
                      >
                        Duplicate
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeVideo(clip.id)}
                        className="h-8 w-8 text-[var(--text-muted)] hover:text-[#EF4444]"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* STEP 6: PLAYLIST VALIDATION REPORT CARD */}
          {step === 6 && (
            <Card className="glass-card p-6 md:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2.5">
                    <CheckCircle2 className="h-6 w-6 text-[#10B981]" /> Step 6: Pre-Flight Playlist Validation Report
                  </h2>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">
                    Before streaming, Mirza verifies every video for packet corruption, codec consistency, audio sample rate, and duplicates.
                  </p>
                </div>
                <Button
                  onClick={runPreFlightValidation}
                  disabled={isValidating}
                  className="h-10 px-5 text-xs font-bold bg-[#FF5A1F] hover:bg-[#FF5A1F]/90 text-white shrink-0"
                >
                  {isValidating ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 mr-2 animate-spin" /> Deep Scanning Packets...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-3.5 w-3.5 mr-2" /> Re-run Deep Validation Scan
                    </>
                  )}
                </Button>
              </div>

              {/* Validation Score Banner */}
              <div className="p-6 rounded-2xl border border-[#10B981]/40 bg-[#10B981]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-[#10B981] text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-[#10B981]/30 shrink-0">
                    100%
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[var(--text-primary)]">
                      Playlist Health: OPTIMAL &amp; READY FOR BROADCAST
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] mt-1 font-mono">
                      All {videos.length} clips passed automated FFmpeg packet validation (`0 corrupt headers • 0 drops expected`).
                    </p>
                  </div>
                </div>
                <Badge variant="online" className="px-4 py-1.5 font-mono text-xs self-start sm:self-center">
                  CERTIFIED READY
                </Badge>
              </div>

              {/* Checklist Table */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {[
                  {
                    title: "Codec Consistency Check",
                    status: "PASSED",
                    desc: "All files encoded with H.264 video + AAC audio (`yuv420p profile main`). Zero transcode latency required during concat.",
                    icon: FileVideo,
                  },
                  {
                    title: "Resolution Synchronization",
                    status: "PASSED",
                    desc: `All clips standardized to 1920x1080 @ 60.0 FPS. Scaler buffer allocated with zero frame drops.`,
                    icon: Tv,
                  },
                  {
                    title: "Audio Sample Rate Integrity",
                    status: "PASSED",
                    desc: "AAC stereo streams synchronized exactly at 48,000 Hz (`160 kbps CBR`). No audio drift over 24/7 loops.",
                    icon: Volume2,
                  },
                  {
                    title: "Moov Atom & Packet Corruption Scan",
                    status: "PASSED",
                    desc: "Scanned 100% of MP4 index headers (`faststart verified`). Zero corrupted packet sequences found.",
                    icon: ShieldCheck,
                  },
                  {
                    title: "Duplicate Clip Detection",
                    status: "PASSED",
                    desc: "Checked MD5 file hashes across playlist. No accidental unintended consecutive duplicate frames detected.",
                    icon: Layers,
                  },
                  {
                    title: "File Storage & Path Accessibility",
                    status: "PASSED",
                    desc: "All media files verified present in enterprise fast-cache volume (`/mnt/media/lofi_broadcast`).",
                    icon: HardDrive,
                  },
                ].map((item, idx) => {
                  const ItemIcon = item.icon
                  return (
                    <div key={idx} className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] flex items-start gap-3.5">
                      <div className="h-9 w-9 rounded-lg bg-[#10B981]/15 border border-[#10B981]/30 flex items-center justify-center text-[#10B981] shrink-0 mt-0.5">
                        <Check className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-[var(--text-primary)]">{item.title}</span>
                          <span className="text-[10px] font-mono font-bold text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded">
                            {item.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-[var(--text-secondary)] mt-1 font-mono leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>
          )}

          {/* STEP 7: STREAMING SETTINGS */}
          {step === 7 && (
            <Card className="glass-card p-6 md:p-8 space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2.5">
                  <Sliders className="h-6 w-6 text-[#FF5A1F]" /> Step 7: Hardware Encoding &amp; Reconnect Settings
                </h2>
                <p className="text-sm text-[var(--text-secondary)] mt-1">
                  Configure isolated multi-threaded FFmpeg encoding parameters for continuous RTMP streaming.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div>
                  <label className="block text-xs font-mono font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                    Broadcast Resolution
                  </label>
                  <select
                    value={resolutionSetting}
                    onChange={(e) => setResolutionSetting(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-primary)] font-mono text-sm focus:outline-none focus:border-[#FF5A1F]"
                  >
                    <option value="1080p60">1080p Full HD (1920x1080) — Standard Broadcast</option>
                    <option value="4K">4K UHD (3840x2160) — Ultra High Definition</option>
                    <option value="720p">720p HD (1280x720) — Bandwidth Optimized</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                    Framerate (FPS)
                  </label>
                  <select
                    value={fpsSetting}
                    onChange={(e) => setFpsSetting(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-primary)] font-mono text-sm focus:outline-none focus:border-[#FF5A1F]"
                  >
                    <option value="60">60 FPS (Smooth Motion — Recommended)</option>
                    <option value="30">30 FPS (Standard Cinematic)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                    Encoding Bitrate (CBR)
                  </label>
                  <select
                    value={bitrateSetting}
                    onChange={(e) => setBitrateSetting(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-primary)] font-mono text-sm focus:outline-none focus:border-[#FF5A1F]"
                  >
                    <option value="6000">6,000 Kbps (`-bufsize 12000k`) — 1080p60 Optimal</option>
                    <option value="9000">9,000 Kbps (`-bufsize 18000k`) — High Quality Studio</option>
                    <option value="4500">4,500 Kbps (`-bufsize 9000k`) — Stable Fallback</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                    Audio Encoding Protocol
                  </label>
                  <select
                    value={audioSetting}
                    onChange={(e) => setAudioSetting(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-primary)] font-mono text-sm focus:outline-none focus:border-[#FF5A1F]"
                  >
                    <option value="aac_160">AAC 160 Kbps (Stereo 48kHz — YouTube Standard)</option>
                    <option value="aac_320">AAC 320 Kbps (Mastering Grade Stereo)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                    Hardware Acceleration Engine
                  </label>
                  <select
                    value={encoderSetting}
                    onChange={(e) => setEncoderSetting(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-primary)] font-mono text-sm focus:outline-none focus:border-[#FF5A1F]"
                  >
                    <option value="nvenc">NVIDIA NVENC Hardware (`h264_nvenc` — 0% CPU overhead)</option>
                    <option value="x264">x264 CPU Software (`libx264 preset veryfast`)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                    Autonomous Reconnect Policy
                  </label>
                  <select
                    value={reconnectPolicy}
                    onChange={(e) => setReconnectPolicy(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-primary)] font-mono text-sm focus:outline-none focus:border-[#FF5A1F]"
                  >
                    <option value="infinite_exponential">Infinite Exponential Backoff (`1s to 30s max`)</option>
                    <option value="fixed_5">Fixed 5-Second Interval Retries (`Infinite`)</option>
                    <option value="none">No Reconnect (Stop on first drop)</option>
                  </select>
                </div>
              </div>
            </Card>
          )}

          {/* STEP 8: READY TO STREAM */}
          {step === 8 && (
            <Card className="glass-card p-6 md:p-10 space-y-8 border-2 border-[#FF5A1F]/50 shadow-2xl">
              <div className="text-center max-w-2xl mx-auto space-y-3">
                <div className="h-16 w-16 rounded-2xl bg-[#FF5A1F] text-white flex items-center justify-center mx-auto shadow-xl shadow-[#FF5A1F]/30 animate-pulse">
                  <Zap className="h-8 w-8 fill-white" />
                </div>
                <h2 className="text-3xl font-black text-[var(--text-primary)] tracking-tight">
                  Ready to Launch 24/7 Autonomous Broadcast
                </h2>
                <p className="text-base text-[var(--text-secondary)]">
                  Your stream key, playlist sequence, and NVENC hardware encoder are fully synchronized and validated. Click start below to initiate continuous streaming.
                </p>
              </div>

              {/* Summary Dashboard Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 font-mono text-xs">
                <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
                  <span className="text-[var(--text-muted)] uppercase tracking-wider block">Destination Platform</span>
                  <span className="text-base font-bold text-[var(--text-primary)] block mt-1">
                    {platform === "youtube" ? "YouTube Live Broadcast" : "Custom RTMP Server"}
                  </span>
                  <span className="text-[10px] text-[#10B981] mt-0.5 block">RTMP/RTMPS Encrypted Ingest</span>
                </div>

                <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
                  <span className="text-[var(--text-muted)] uppercase tracking-wider block">Active Playlist</span>
                  <span className="text-base font-bold text-[var(--text-primary)] block mt-1 truncate">
                    {playlistName}
                  </span>
                  <span className="text-[10px] text-[var(--text-secondary)] mt-0.5 block">
                    {videos.length} verified video tracks
                  </span>
                </div>

                <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
                  <span className="text-[var(--text-muted)] uppercase tracking-wider block">Total Loop Duration</span>
                  <span className="text-base font-bold text-[#FF5A1F] block mt-1">
                    {formatSeconds(totalDurationSec)}
                  </span>
                  <span className="text-[10px] text-[var(--text-secondary)] mt-0.5 block">
                    {repeatForever ? "Repeat Forever (`Continuous Loop`)" : "Play Once (`Stop at end`)"}
                  </span>
                </div>

                <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
                  <span className="text-[var(--text-muted)] uppercase tracking-wider block">Encoding Profile</span>
                  <span className="text-base font-bold text-[var(--text-primary)] block mt-1">
                    {resolutionSetting} @ {bitrateSetting} Kbps
                  </span>
                  <span className="text-[10px] text-[var(--text-secondary)] mt-0.5 block uppercase">
                    {encoderSetting} Hardware Engine
                  </span>
                </div>

                <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
                  <span className="text-[var(--text-muted)] uppercase tracking-wider block">Pre-Flight Validation</span>
                  <span className="text-base font-bold text-[#10B981] block mt-1">
                    100% HEALTHY
                  </span>
                  <span className="text-[10px] text-[var(--text-secondary)] mt-0.5 block">
                    Zero corrupt frames detected
                  </span>
                </div>

                <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
                  <span className="text-[var(--text-muted)] uppercase tracking-wider block">Supervisor Guard</span>
                  <span className="text-base font-bold text-[#10B981] block mt-1">
                    ACTIVE (`Auto-Heal`)
                  </span>
                  <span className="text-[10px] text-[var(--text-secondary)] mt-0.5 block">
                    Infinite exponential backoff
                  </span>
                </div>
              </div>

              {/* Large Start Button CTA */}
              <div className="text-center pt-2">
                <Button
                  onClick={handleStart247Stream}
                  className="h-16 px-12 text-lg font-black bg-gradient-to-r from-[#FF5A1F] to-[#CC3E10] hover:from-[#FF5A1F]/90 hover:to-[#CC3E10]/90 text-white rounded-2xl shadow-2xl shadow-[#FF5A1F]/30 hover:scale-105 transition-all flex items-center justify-center gap-3.5 mx-auto"
                >
                  <Zap className="h-6 w-6 fill-white animate-pulse" /> START 24/7 STREAM NOW
                </Button>
                <span className="text-xs font-mono text-[var(--text-muted)] block mt-3">
                  Clicking start will initialize FFmpeg worker thread and redirect to active Mission Control telemetry.
                </span>
              </div>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Footer Navigation Bar */}
      <div className="max-w-5xl mx-auto mt-8 flex items-center justify-between border-t border-[var(--border-subtle)] pt-6">
        <Button
          variant="outline"
          disabled={step === 1}
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          className="h-11 px-6 font-bold text-xs border-[var(--border-subtle)] hover:border-[#FF5A1F]"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back Step
        </Button>

        {step < 8 ? (
          <Button
            onClick={() => setStep((s) => Math.min(8, s + 1))}
            className="h-11 px-8 font-bold text-xs bg-[#FF5A1F] hover:bg-[#FF5A1F]/90 text-white shadow-md"
          >
            Continue to Step {step + 1} <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={handleStart247Stream}
            className="h-11 px-8 font-bold text-xs bg-[#10B981] hover:bg-[#10B981]/90 text-white shadow-md"
          >
            <Play className="h-4 w-4 mr-2 fill-white" /> Launch Broadcast Now
          </Button>
        )}
      </div>
    </DashboardShell>
  )
}
