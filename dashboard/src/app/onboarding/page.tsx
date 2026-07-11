"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, ArrowLeft, ArrowRight, Check } from "lucide-react"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { OnboardingProvider, useOnboardingWizard } from "@/features/onboarding/context/onboarding-context"
import { StepPlatform } from "@/features/onboarding/components/step-platform"
import { StepStreamKey } from "@/features/onboarding/components/step-stream-key"
import { StepPlaylistConfig } from "@/features/onboarding/components/step-playlist-config"
import { StepUploadVideos } from "@/features/onboarding/components/step-upload-videos"
import { StepPlaylistBuilder } from "@/features/onboarding/components/step-playlist-builder"
import { StepValidationReport } from "@/features/onboarding/components/step-validation-report"
import { StepStreamingSettings } from "@/features/onboarding/components/step-streaming-settings"
import { StepReadySummary } from "@/features/onboarding/components/step-ready-summary"
import { useHydrationGuard } from "@/hooks/use-hydration-guard"

const STEPS = [
  { id: 1, label: "Platform" },
  { id: 2, label: "Stream Key" },
  { id: 3, label: "Playlist" },
  { id: 4, label: "Uploads" },
  { id: 5, label: "Builder" },
  { id: 6, label: "Validate" },
  { id: 7, label: "Settings" },
  { id: 8, label: "Launch" },
]

function OnboardingWizardContent() {
  const router = useRouter()
  const { state, setStep } = useOnboardingWizard()
  const isMounted = useHydrationGuard()

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="w-8 h-8 border-2 border-[#FF5A1F] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const handleNext = () => {
    if (state.step < 8) setStep(state.step + 1)
  }

  const handleBack = () => {
    if (state.step > 1) setStep(state.step - 1)
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#FF5A1F]">
            <Sparkles className="w-4 h-4" />
            <span>Mirza Live V2 Onboarding Workflow</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-[var(--text-primary)] mt-1">
            24/7 Playlist-First Streaming Setup
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono text-xs border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
            Step {state.step} of 8
          </Badge>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => router.push("/")}
            className="text-xs font-mono text-[var(--text-secondary)] hover:text-[#FF5A1F]"
          >
            Exit Wizard
          </Button>
        </div>
      </div>

      {/* Progress Bar Indicator */}
      <nav aria-label="Wizard Steps Progress" className="grid grid-cols-4 sm:grid-cols-8 gap-2">
        {STEPS.map((s) => {
          const isDone = state.step > s.id
          const isCurrent = state.step === s.id
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setStep(s.id)}
              className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between h-14 ${
                isCurrent
                  ? "border-[#FF5A1F] bg-[#FF5A1F]/10 shadow-sm"
                  : isDone
                  ? "border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/50"
                  : "border-[var(--border-subtle)] bg-[var(--bg-card)] opacity-60 hover:opacity-100"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className={`text-[10px] font-mono ${isCurrent ? "text-[#FF5A1F] font-bold" : isDone ? "text-emerald-500" : "text-[var(--text-muted)]"}`}>
                  0{s.id}
                </span>
                {isDone && <Check className="w-3 h-3 text-emerald-500" />}
              </div>
              <span className={`text-xs font-bold truncate block ${isCurrent ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"}`}>
                {s.label}
              </span>
            </button>
          )
        })}
      </nav>

      {/* Step Content Container */}
      <AnimatePresence mode="wait">
        <motion.div
          key={state.step}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.2 }}
        >
          {state.step === 1 && <StepPlatform />}
          {state.step === 2 && <StepStreamKey />}
          {state.step === 3 && <StepPlaylistConfig />}
          {state.step === 4 && <StepUploadVideos />}
          {state.step === 5 && <StepPlaylistBuilder />}
          {state.step === 6 && <StepValidationReport />}
          {state.step === 7 && <StepStreamingSettings />}
          {state.step === 8 && <StepReadySummary />}
        </motion.div>
      </AnimatePresence>

      {/* Bottom Navigation Toolbar */}
      {state.step < 8 && (
        <div className="pt-6 border-t border-[var(--border-subtle)] flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={state.step === 1}
            className="h-11 px-6 font-mono text-sm border-[var(--border-subtle)] disabled:opacity-40"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Previous Step
          </Button>

          <Button
            type="button"
            onClick={handleNext}
            className="h-11 px-8 rounded-xl bg-[#FF5A1F] hover:bg-[#FF5A1F]/90 text-white font-bold text-sm shadow-md shadow-[#FF5A1F]/20 flex items-center gap-2"
          >
            <span>Continue to Step {state.step + 1}</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  )
}

export default function OnboardingPage() {
  return (
    <DashboardShell>
      <OnboardingProvider>
        <OnboardingWizardContent />
      </OnboardingProvider>
    </DashboardShell>
  )
}
