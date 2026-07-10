"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Lock, Mail, Eye, EyeOff, Check, ArrowRight, ShieldCheck, Globe } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { cn } from "@/lib/utils"

export default function LoginPage() {
  const router = useRouter()
  const { login, loginWithGoogle, isLoading } = useAuth()
  const [email, setEmail] = React.useState("sufiyan@mirzalive.internal")
  const [password, setPassword] = React.useState("••••••••••••••••")
  const [showPassword, setShowPassword] = React.useState(false)
  const [rememberMe, setRememberMe] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      if (!email.includes("@")) {
        throw new Error("Please enter a valid enterprise email address.")
      }
      await login(email, password, rememberMe)
      router.push("/")
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Verify your operator credentials.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleSSO = async () => {
    setError(null)
    setIsSubmitting(true)
    try {
      await loginWithGoogle()
      router.push("/")
    } catch {
      setError("Google Workspace SSO authorization timed out.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25 }}
      className="glass-card rounded-2xl p-8 border border-[var(--border-subtle)] shadow-[var(--card-shadow)] relative overflow-hidden backdrop-blur-2xl"
    >
      {/* Top Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FF5A1F]/10 text-[#FF5A1F] text-xs font-mono font-semibold mb-3 border border-[#FF5A1F]/30">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>ENTERPRISE OPERATOR PORTAL</span>
        </div>
        <h1 className="text-2xl font-black tracking-tight text-[var(--text-primary)]">
          Sign In to Mirza OS
        </h1>
        <p className="text-xs text-[var(--text-secondary)] mt-1.5">
          Orchestrate your 24/7 autonomous streaming fleet from edge to CDN.
        </p>
      </div>

      {/* Google SSO Button */}
      <button
        type="button"
        onClick={handleGoogleSSO}
        disabled={isSubmitting || isLoading}
        className={cn(
          "w-full h-10 px-4 rounded-xl flex items-center justify-center gap-2.5 text-xs font-semibold transition-all",
          "bg-[var(--bg-surface)] border border-[var(--border-default)] hover:border-[#FF5A1F] text-[var(--text-primary)]",
          "hover:bg-[var(--bg-elevated)] shadow-sm disabled:opacity-50"
        )}
      >
        <Globe className="w-4 h-4 text-[#FF5A1F]" />
        <span>Sign in with Google Workspace (SSO)</span>
      </button>

      {/* Divider */}
      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-[var(--border-subtle)]" />
        <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)]">
          Or Continue With Work Email
        </span>
        <div className="h-px flex-1 bg-[var(--border-subtle)]" />
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
            Work Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operator@company.internal"
              required
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-[var(--bg-base)] border border-[var(--border-default)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[#FF5A1F] transition-colors"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-[var(--text-secondary)]">
              Operator Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-[#FF5A1F] hover:underline font-semibold"
            >
              Forgot Password?
            </Link>
          </div>
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
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => setRememberMe(!rememberMe)}
            className={cn(
              "w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0",
              rememberMe
                ? "bg-[#FF5A1F] border-[#FF5A1F] text-white"
                : "border-[var(--border-default)] bg-[var(--bg-base)]"
            )}
          >
            {rememberMe && <Check className="w-3 h-3 stroke-[3]" />}
          </button>
          <span
            onClick={() => setRememberMe(!rememberMe)}
            className="text-xs text-[var(--text-secondary)] cursor-pointer select-none"
          >
            Remember session for 30 days (`mirza_auth_session_v3`)
          </span>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || isLoading}
          className="w-full h-11 rounded-xl bg-gradient-to-r from-[#FF5A1F] to-[#CC3E10] hover:from-[#CC3E10] hover:to-[#B0340C] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#FF5A1F]/30 hover:shadow-[#FF5A1F]/40 transition-all disabled:opacity-50 mt-6"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Verifying Edge Identity...</span>
            </div>
          ) : (
            <>
              <span>Sign In & Connect Fleet</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-[var(--text-secondary)]">
        <span>Need a dedicated workspace? </span>
        <Link href="/register" className="text-[#FF5A1F] font-bold hover:underline">
          Request Enterprise Access →
        </Link>
      </div>
    </motion.div>
  )
}
