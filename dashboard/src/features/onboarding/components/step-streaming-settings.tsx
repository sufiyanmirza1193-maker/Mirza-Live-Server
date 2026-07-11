"use client"

import * as React from "react"
import { Sparkles, Sliders, Cpu, Volume2, HardDrive } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { useOnboardingWizard } from "@/features/onboarding/context/onboarding-context"
import {
  ResolutionSetting,
  FpsSetting,
  BitrateSetting,
  AudioSetting,
  EncoderSetting,
  ReconnectPolicy,
} from "@/types/onboarding"

export function StepStreamingSettings() {
  const {
    state,
    setResolutionSetting,
    setFpsSetting,
    setBitrateSetting,
    setAudioSetting,
    setEncoderSetting,
    setReconnectPolicy,
  } = useOnboardingWizard()

  return (
    <div role="tabpanel" aria-labelledby="step-streaming-settings-heading" className="space-y-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-sm font-semibold text-[#FF5A1F]">
          <Sparkles className="w-4 h-4" />
          <span>Step 7 of 8</span>
        </div>
        <h2 id="step-streaming-settings-heading" className="text-2xl md:text-3xl font-black tracking-tight text-[var(--text-primary)]">
          Streaming & Encoding Settings
        </h2>
        <p className="text-sm md:text-base text-[var(--text-secondary)]">
          Fine-tune hardware acceleration (`NVIDIA NVENC`) and autonomous reconnect policies for zero-drop uptime.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-[var(--border-subtle)] bg-[var(--bg-card)]">
          <CardHeader className="pb-3 border-b border-[var(--border-subtle)]">
            <CardTitle className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#FF5A1F]" />
              <span>Video Pipeline & Hardware Acceleration</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="resolution-select" className="text-xs font-semibold text-[var(--text-secondary)] uppercase font-mono tracking-wider">
                Target Broadcast Resolution
              </label>
              <select
                id="resolution-select"
                value={state.resolutionSetting}
                onChange={(e) => setResolutionSetting(e.target.value as ResolutionSetting)}
                className="w-full h-11 px-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-primary)] font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]"
              >
                <option value="1080p60">1920x1080p Full HD (`Recommended for YouTube`)</option>
                <option value="4k">3840x2160p 4K Ultra HD (`Requires 15Mbps+ Upload`)</option>
                <option value="720p">1280x720p HD (`Low bandwidth conservation`)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="fps-select" className="text-xs font-semibold text-[var(--text-secondary)] uppercase font-mono tracking-wider">
                Target Framerate
              </label>
              <select
                id="fps-select"
                value={state.fpsSetting}
                onChange={(e) => setFpsSetting(e.target.value as FpsSetting)}
                className="w-full h-11 px-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-primary)] font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]"
              >
                <option value="60">60 FPS (`Smooth gameplay / Lo-Fi animation`)</option>
                <option value="30">30 FPS (`Standard cinematic / talk show`)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="encoder-select" className="text-xs font-semibold text-[var(--text-secondary)] uppercase font-mono tracking-wider">
                Hardware Encoder Backend
              </label>
              <select
                id="encoder-select"
                value={state.encoderSetting}
                onChange={(e) => setEncoderSetting(e.target.value as EncoderSetting)}
                className="w-full h-11 px-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-primary)] font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]"
              >
                <option value="nvenc">NVIDIA NVENC Hardware (`h264_nvenc • Ultra Low CPU`)</option>
                <option value="x264">Software CPU (`libx264 • Fallback mode`)</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Right Bitrate & Audio */}
        <Card className="border-[var(--border-subtle)] bg-[var(--bg-card)]">
          <CardHeader className="pb-3 border-b border-[var(--border-subtle)]">
            <CardTitle className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#FF5A1F]" />
              <span>Bitrate Control & Reconnect Policy</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="bitrate-select" className="text-xs font-semibold text-[var(--text-secondary)] uppercase font-mono tracking-wider">
                Video Bitrate (CBR Strict Target)
              </label>
              <select
                id="bitrate-select"
                value={state.bitrateSetting}
                onChange={(e) => setBitrateSetting(e.target.value as BitrateSetting)}
                className="w-full h-11 px-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-primary)] font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]"
              >
                <option value="6000">6,000 Kbps CBR (`Optimal for 1080p60 YouTube`)</option>
                <option value="9000">9,000 Kbps CBR (`High bitrate quality target`)</option>
                <option value="4500">4,500 Kbps CBR (`Bandwidth conservation mode`)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="audio-select" className="text-xs font-semibold text-[var(--text-secondary)] uppercase font-mono tracking-wider">
                Audio Codec & Bitrate
              </label>
              <select
                id="audio-select"
                value={state.audioSetting}
                onChange={(e) => setAudioSetting(e.target.value as AudioSetting)}
                className="w-full h-11 px-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-primary)] font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]"
              >
                <option value="aac_160">AAC 160 Kbps Stereo (`Standard high-fidelity`)</option>
                <option value="aac_320">AAC 320 Kbps Stereo (`Studio master lossless`)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="reconnect-select" className="text-xs font-semibold text-[var(--text-secondary)] uppercase font-mono tracking-wider">
                Autonomous Reconnect Policy
              </label>
              <select
                id="reconnect-select"
                value={state.reconnectPolicy}
                onChange={(e) => setReconnectPolicy(e.target.value as ReconnectPolicy)}
                className="w-full h-11 px-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-primary)] font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]"
              >
                <option value="infinite_exponential">Infinite Exponential Backoff (`1s to 30s max`)</option>
                <option value="fixed_5">Fixed 5-Second Interval Retries (`Infinite`)</option>
                <option value="none">No Reconnect (Stop on first drop)</option>
              </select>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
