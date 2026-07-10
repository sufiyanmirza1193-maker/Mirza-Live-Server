"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Lock, Mail, User, Building2, Eye, EyeOff, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { useWorkspace } from "@/context/workspace-context"
import { cn } from "@/lib/utils"

export default function RegisterPage() {
  const router = useRouter()
  const { register, isLoading } = useAuth()
  const { createWorkspace } = useWorkspace()
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [workspaceName, setWorkspaceName] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Password strength calculation
  const strengthScore = React.useMemo(() => {
    if (!password) return 0
    let score = 0
    if (password.length >= 8) score += 1
    if (password.length >= 12) score += 1
    if (/[A-Z]/.test(password) && /[0-9]/.test(password)) score += 1
    if (/[^A-Za-z0-9]/.test(password)) score += 1
    return score
  }, [password])

  const strengthLabel = ["Minimum 8 chars", "Basic", "Good", "Strong", "SOC2 Compliant"][strengthScore]
  const strengthColor = ["#5A5A5A", "#EF4444", "#F59E0B", "#3B82F6", "#22C55E"][strengthScore]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      if (!email.includes("@")) {
        throw new Error("Please provide a valid work email.")
      }
      if (password.length < 8) {
        throw new Error("Password must be at least 8 characters.")
      }
      await register(name, email, password, workspaceName)
      if (workspaceName.trim()) {
        createWorkspace(workspaceName.trim(), "Gaming")
      }
      router.push("/")
    } catch (err: any) {
      setError(err.message || "Failed to create workspace. Verify network connectivity.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25 }}
      className="glass-card rounded-2xl p-8 border border-[var(--border-default)] shadow-2xl relative overflow-hidden backdrop-blur-2xl"
    >
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FF5A1F]/10 text-[#FF5A1F] text-xs font-mono font-semibold mb-3 border border-[#FF5A1F]/30">
          <Sparkles className="w-3.5 h-3.5" />
          <span>INITIALIZE NEW FLEET</span>
        </div>
        <h1 className="text-2xl font-black tracking-tight text-[var(--text-primary)]">
          Deploy Your Enterprise Fleet
        </h1>
        <p className="text-xs text-[var(--text-secondary)] mt-1.5">
          Orchestrate autonomous 24/7 channels with sub-second FFMPEG recovery.
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] text-xs font-medium flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#EF4444] shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
            Full Operator Name
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Sufiyan Mirza"
              required
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-[var(--bg-base)] border border-[var(--border-default)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[#FF5A1F] transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
            Work Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operator@company.com"
              required
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-[var(--bg-base)] border border-[var(--border-default)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[#FF5A1F] transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
            Initial Workspace / Brand Name
          </label>
          <div className="relative">
            <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              placeholder="e.g. 24/7 Anime Lo-Fi Studio"
              required
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-[var(--bg-base)] border border-[var(--border-default)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[#FF5A1F] transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
            Master Security Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••••••"
              required
              className="w-full h-10 pl-10 pr-10 rounded-xl bg-[var(--bg-base)] border border-[var(--border-default)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[#FF5A1F] transition-colors font-mono"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Password strength bar */}
          <div className="mt-2 flex items-center justify-between gap-2">
            <div className="flex gap-1 flex-1">
              {[1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className="h-1 flex-1 rounded-full transition-colors"
                  style={{
                    backgroundColor: strengthScore >= level ? strengthColor : "var(--border-subtle)",
                  }}
                />
              ))}
            </div>
            <span className="text-[10px] font-mono font-semibold" style={{ color: strengthColor }}>
              {strengthLabel}
            </span>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || isLoading}
          className="w-full h-11 rounded-xl bg-gradient-to-r from-[#FF5A1F] to-[#CC3E10] hover:from-[#CC3E10] hover:to-[#B0340C] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#FF5A1F]/30 hover:shadow-[#FF5A1F]/40 transition-all disabled:opacity-50 mt-6"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Provisioning Edge Cluster...</span>
            </div>
          ) : (
            <>
              <span>Initialize Workspace & Launch</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-[var(--text-secondary)]">
        <span>Already have an active operator account? </span>
        <Link href="/login" className="text-[#FF5A1F] font-bold hover:underline">
          Sign In Here →
        </Link>
      </div>
    </motion.div>
  )
}
