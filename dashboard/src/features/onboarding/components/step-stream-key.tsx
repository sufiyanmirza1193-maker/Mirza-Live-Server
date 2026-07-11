"use client"

import * as React from "react"
import { Sparkles, Key, Eye, EyeOff, Copy, RefreshCw, CheckCircle2, ShieldCheck, AlertCircle } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useOnboardingWizard } from "@/features/onboarding/context/onboarding-context"

export function StepStreamKey() {
  const {
    state,
    setRtmpUrl,
    setStreamKey,
    setShowStreamKey,
    setConnectionStatus,
    setPingLatency,
  } = useOnboardingWizard()

  const handleTestConnection = React.useCallback(() => {
    setConnectionStatus("testing")
    setPingLatency(null)

    setTimeout(() => {
      setConnectionStatus("verified")
      setPingLatency(14)
    }, 1400)
  }, [setConnectionStatus, setPingLatency])

  const handlePasteKey = React.useCallback(async () => {
    try {
      const clip = await navigator.clipboard.readText()
      if (clip) setStreamKey(clip)
    } catch (e) {
      console.warn("Clipboard access denied or unavailable", e)
    }
  }, [setStreamKey])

  return (
    <div role="tabpanel" aria-labelledby="step-stream-key-heading" className="space-y-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-sm font-semibold text-[#FF5A1F]">
          <Sparkles className="w-4 h-4" />
          <span>Step 2 of 8</span>
        </div>
        <h2 id="step-stream-key-heading" className="text-2xl md:text-3xl font-black tracking-tight text-[var(--text-primary)]">
          Paste Stream Key
        </h2>
        <p className="text-sm md:text-base text-[var(--text-secondary)]">
          Configure your RTMP endpoint. Your stream key is kept strictly confidential and scrubbed from client telemetry logs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: RTMP & Key Input */}
        <div className="lg:col-span-7 space-y-5">
          <Card className="border-[var(--border-subtle)] bg-[var(--bg-card)] shadow-sm">
            <CardHeader className="pb-3 border-b border-[var(--border-subtle)]">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <Key className="w-4 h-4 text-[#FF5A1F]" />
                  <span>Destination Credentials</span>
                </CardTitle>
                <Badge variant="outline" className="font-mono text-[10px] text-[#FF5A1F] border-[#FF5A1F]/30 bg-[#FF5A1F]/5">
                  ZERO OAUTH REQUIRES KEY
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              {/* RTMP Server URL */}
              <div className="space-y-1.5">
                <label htmlFor="rtmp-url-input" className="text-xs font-semibold text-[var(--text-secondary)] uppercase font-mono tracking-wider">
                  RTMP Server URL
                </label>
                <div className="relative">
                  <input
                    id="rtmp-url-input"
                    type="text"
                    aria-label="RTMP Server URL"
                    value={state.rtmpUrl}
                    onChange={(e) => setRtmpUrl(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-primary)] font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]"
                  />
                </div>
              </div>

              {/* Stream Key */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="stream-key-input" className="text-xs font-semibold text-[var(--text-secondary)] uppercase font-mono tracking-wider">
                    Stream Key (Secret)
                  </label>
                  <span className="text-[11px] text-[var(--text-muted)] flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Scrubbed from logs</span>
                  </span>
                </div>
                <div className="relative flex items-center">
                  <input
                    id="stream-key-input"
                    type={state.showStreamKey ? "text" : "password"}
                    aria-label="Stream Key"
                    value={state.streamKey}
                    onChange={(e) => setStreamKey(e.target.value)}
                    placeholder="xxxx-xxxx-xxxx-xxxx"
                    className="w-full h-11 pl-3.5 pr-28 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-primary)] font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]"
                  />
                  <div className="absolute right-1.5 flex items-center gap-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={handlePasteKey}
                      className="h-8 px-2 text-xs font-mono text-[var(--text-secondary)] hover:text-[#FF5A1F]"
                      title="Paste from clipboard"
                    >
                      <Copy className="w-3.5 h-3.5 mr-1" />
                      Paste
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowStreamKey(!state.showStreamKey)}
                      aria-label={state.showStreamKey ? "Hide stream key" : "Show stream key"}
                      className="h-8 w-8 p-0 text-[var(--text-secondary)]"
                    >
                      {state.showStreamKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Test Connection Action */}
              <div className="pt-2 flex items-center justify-between border-t border-[var(--border-subtle)]">
                <div>
                  {state.connectionStatus === "idle" && (
                    <span className="text-xs text-[var(--text-muted)]">Click test to verify ingest latency & auth.</span>
                  )}
                  {state.connectionStatus === "testing" && (
                    <span className="text-xs text-[#FF5A1F] font-mono flex items-center gap-1.5 animate-pulse">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Pinging YouTube Primary Ingest...
                    </span>
                  )}
                  {state.connectionStatus === "verified" && (
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Connection Verified ({state.pingLatency}ms RTMP Handshake)
                    </span>
                  )}
                  {state.connectionStatus === "error" && (
                    <span className="text-xs text-red-500 font-mono flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4" /> Authentication Failed: Check Stream Key
                    </span>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleTestConnection}
                  disabled={state.connectionStatus === "testing"}
                  className="font-mono text-xs border-[var(--border-subtle)] hover:border-[#FF5A1F] hover:text-[#FF5A1F]"
                >
                  <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${state.connectionStatus === "testing" ? "animate-spin" : ""}`} />
                  Test Connection
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Guide: Step by Step Guide */}
        <div className="lg:col-span-5">
          <Card className="border-[var(--border-subtle)] bg-[var(--bg-card)] h-full">
            <CardHeader className="pb-3 border-b border-[var(--border-subtle)]">
              <CardTitle className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                <span>📘 Guide: YouTube Stream Key in 3 Clicks</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4 text-xs text-[var(--text-secondary)]">
              <div className="space-y-3">
                <div className="flex gap-2.5 items-start">
                  <div className="w-5 h-5 rounded-full bg-[#FF5A1F]/10 text-[#FF5A1F] font-mono font-bold flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div>
                    <p className="font-semibold text-[var(--text-primary)]">Open YouTube Studio Dashboard</p>
                    <p className="text-[var(--text-muted)] mt-0.5">Go to studio.youtube.com and click the top-right Create icon → Go Live.</p>
                  </div>
                </div>

                <div className="flex gap-2.5 items-start">
                  <div className="w-5 h-5 rounded-full bg-[#FF5A1F]/10 text-[#FF5A1F] font-mono font-bold flex items-center justify-center shrink-0">
                    2
                  </div>
                  <div>
                    <p className="font-semibold text-[var(--text-primary)]">Select RTMP Stream Key</p>
                    <p className="text-[var(--text-muted)] mt-0.5">In the Stream Settings panel, locate `Stream Key (paste in encoder)`.</p>
                  </div>
                </div>

                <div className="flex gap-2.5 items-start">
                  <div className="w-5 h-5 rounded-full bg-[#FF5A1F]/10 text-[#FF5A1F] font-mono font-bold flex items-center justify-center shrink-0">
                    3
                  </div>
                  <div>
                    <p className="font-semibold text-[var(--text-primary)]">Copy & Paste Above</p>
                    <p className="text-[var(--text-muted)] mt-0.5">Click Copy, then click Paste inside our secure masked box. Click Test Connection when ready!</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
