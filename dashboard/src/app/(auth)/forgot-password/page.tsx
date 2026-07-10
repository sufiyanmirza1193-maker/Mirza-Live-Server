"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Mail, ShieldAlert, CheckCircle2, ArrowLeft, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("")
  const [isSent, setIsSent] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 800))
    setIsSubmitting(false)
    setIsSent(true)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25 }}
      className="glass-card rounded-2xl p-8 border border-[var(--border-default)] shadow-2xl relative overflow-hidden backdrop-blur-2xl"
    >
      {!isSent ? (
        <>
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FF5A1F]/10 text-[#FF5A1F] text-xs font-mono font-semibold mb-3 border border-[#FF5A1F]/30">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>SECURITY RECOVERY PROTOCOL</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-[var(--text-primary)]">
              Recover Operator Access
            </h1>
            <p className="text-xs text-[var(--text-secondary)] mt-1.5">
              Enter your verified work email to dispatch a cryptographic reset token.
            </p>
          </div>

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
                  placeholder="sufiyan@mirzalive.internal"
                  required
                  className="w-full h-10 pl-10 pr-4 rounded-xl bg-[var(--bg-base)] border border-[var(--border-default)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[#FF5A1F] transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !email.trim()}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-[#FF5A1F] to-[#CC3E10] hover:from-[#CC3E10] hover:to-[#B0340C] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#FF5A1F]/30 hover:shadow-[#FF5A1F]/40 transition-all disabled:opacity-50 mt-6"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Dispatching Token...</span>
                </div>
              ) : (
                <>
                  <span>Dispatch Recovery Link</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </>
      ) : (
        <div className="text-center py-4">
          <div className="w-12 h-12 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/30 flex items-center justify-center text-[#22C55E] mx-auto mb-4">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            Token Dispatched Successfully
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-2 leading-relaxed">
            A cryptographic reset link has been sent to{" "}
            <span className="font-mono font-semibold text-[#FF5A1F]">{email}</span>.
            Please verify via your enterprise MFA device.
          </p>
          <button
            onClick={() => setIsSent(false)}
            className="mt-6 text-xs text-[#FF5A1F] font-semibold hover:underline block mx-auto"
          >
            Try a different work email →
          </button>
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-[var(--border-subtle)] text-center">
        <Link
          href="/login"
          className="text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center justify-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Operator Portal</span>
        </Link>
      </div>
    </motion.div>
  )
}
