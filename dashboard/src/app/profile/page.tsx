"use client"

import * as React from "react"
import { motion } from "framer-motion"
import {
  User,
  Shield,
  Key,
  Globe,
  Video,
  Code2,
  CheckCircle2,
  AlertCircle,
  Plus,
  Save,
  Sparkles,
  Layers,
  Bell,
  Lock,
} from "lucide-react"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { useAuth } from "@/context/auth-context"
import { useTheme } from "@/context/theme-context"
import { useWorkspace } from "@/context/workspace-context"
import { cn } from "@/lib/utils"

export default function ProfilePage() {
  const { user, updateProfile, connectAccount, disconnectAccount } = useAuth()
  const { theme, setTheme } = useTheme()
  const { activeWorkspace } = useWorkspace()
  
  const [name, setName] = React.useState(user?.name || "")
  const [email, setEmail] = React.useState(user?.email || "")
  const [isSaving, setIsSaving] = React.useState(false)
  const [saveSuccess, setSaveSuccess] = React.useState(false)

  React.useEffect(() => {
    if (user) {
      setName(user.name)
      setEmail(user.email)
    }
  }, [user])

  if (!user) return null

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 600))
    updateProfile({ name, email })
    setIsSaving(false)
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3000)
  }

  const hasGoogle = user.connectedAccounts.some((a) => a.provider === "google")
  const hasYouTube = user.connectedAccounts.some((a) => a.provider === "youtube")
  const hasGitHub = user.connectedAccounts.some((a) => a.provider === "github")

  return (
    <DashboardShell>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#FF5A1F]" />
              <span className="text-xs font-mono font-bold tracking-wider text-[var(--text-muted)] uppercase">
                OPERATOR IDENTITY CENTER
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-[var(--text-primary)] mt-1">
              Enterprise Profile & Credentials
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/30 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>MFA ENFORCED</span>
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-[#FF5A1F]/10 text-[#FF5A1F] border border-[#FF5A1F]/30">
              {user.role.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column — Profile Overview */}
          <div className="space-y-6">
            <div className="glass-card rounded-2xl p-6 border border-[var(--border-default)] text-center relative overflow-hidden">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#FF5A1F] to-[#CC3E10] flex items-center justify-center text-white font-black text-2xl mx-auto mb-4 shadow-xl shadow-[#FF5A1F]/20">
                {user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <h2 className="text-lg font-bold text-[var(--text-primary)]">{user.name}</h2>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">{user.email}</p>
              
              <div className="mt-4 pt-4 border-t border-[var(--border-subtle)] space-y-2 text-left text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-muted)]">Organization:</span>
                  <span className="text-[var(--text-primary)] font-semibold truncate max-w-[140px]">{user.organization}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-muted)]">Active Workspace:</span>
                  <span className="text-[#FF5A1F] font-semibold">{activeWorkspace?.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-muted)]">Session Storage:</span>
                  <span className="text-[#22C55E]">localStorage (Sync)</span>
                </div>
              </div>
            </div>

            {/* Theme & Aesthetics Card */}
            <div className="glass-card rounded-2xl p-6 border border-[var(--border-default)] space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--text-primary)]">Interface Theme Mode</span>
                <span className="text-[10px] font-mono text-[#FF5A1F] uppercase">{theme}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(["dark", "light", "glass"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setTheme(mode)}
                    className={cn(
                      "py-2 rounded-xl text-xs font-semibold capitalize transition-all border",
                      theme === mode
                        ? "bg-[#FF5A1F] text-white border-[#FF5A1F] shadow-md shadow-[#FF5A1F]/20"
                        : "bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:border-[var(--border-default)]"
                    )}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column — Edit Profile & Connected Accounts */}
          <div className="md:col-span-2 space-y-6">
            {/* Operator Information Form */}
            <form onSubmit={handleSave} className="glass-card rounded-2xl p-6 border border-[var(--border-default)] space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
                <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <User className="w-4 h-4 text-[#FF5A1F]" />
                  <span>Personal Operator Credentials</span>
                </h3>
                {saveSuccess && (
                  <span className="text-xs font-mono text-[#22C55E] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Profile Updated</span>
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full h-10 px-3 rounded-xl bg-[var(--bg-base)] border border-[var(--border-default)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#FF5A1F]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                    Work Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full h-10 px-3 rounded-xl bg-[var(--bg-base)] border border-[var(--border-default)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#FF5A1F]"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="h-9 px-5 rounded-xl bg-[#FF5A1F] hover:bg-[#CC3E10] text-white font-bold text-xs flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? "Saving..." : "Save Changes"}</span>
                </button>
              </div>
            </form>

            {/* Connected OAuth / SSO Accounts */}
            <div className="glass-card rounded-2xl p-6 border border-[var(--border-default)] space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
                <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <Key className="w-4 h-4 text-[#FF5A1F]" />
                  <span>Connected Fleet Integrations & OAuth</span>
                </h3>
                <span className="text-xs font-mono text-[var(--text-muted)]">
                  {user.connectedAccounts.length} Active
                </span>
              </div>

              <div className="space-y-3">
                {/* Google Workspace SSO */}
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#FF5A1F]/10 flex items-center justify-center text-[#FF5A1F]">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[var(--text-primary)]">Google Workspace SSO</div>
                      <div className="text-[10px] font-mono text-[var(--text-muted)]">
                        {hasGoogle ? "Connected as sufiyan.mirza@gmail.com" : "Not connected"}
                      </div>
                    </div>
                  </div>
                  {hasGoogle ? (
                    <span className="px-2.5 py-1 rounded text-[10px] font-mono font-semibold bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/30">
                      Connected
                    </span>
                  ) : (
                    <button
                      onClick={() => connectAccount("google")}
                      className="px-3 py-1 rounded text-xs font-semibold bg-[#FF5A1F] text-white hover:bg-[#CC3E10] transition-colors"
                    >
                      Connect
                    </button>
                  )}
                </div>

                {/* YouTube Studio API */}
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#EF4444]/10 flex items-center justify-center text-[#EF4444]">
                      <Video className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[var(--text-primary)]">YouTube Studio API v3</div>
                      <div className="text-[10px] font-mono text-[var(--text-muted)]">
                        {hasYouTube ? "Mirza Live Official 4K (Scope: youtube.readonly)" : "Not connected"}
                      </div>
                    </div>
                  </div>
                  {hasYouTube ? (
                    <span className="px-2.5 py-1 rounded text-[10px] font-mono font-semibold bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/30">
                      Connected
                    </span>
                  ) : (
                    <button
                      onClick={() => connectAccount("youtube")}
                      className="px-3 py-1 rounded text-xs font-semibold bg-[#FF5A1F] text-white hover:bg-[#CC3E10] transition-colors"
                    >
                      Connect
                    </button>
                  )}
                </div>

                {/* GitHub CI/CD Hook */}
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[var(--bg-card)] flex items-center justify-center text-[var(--text-primary)] border border-[var(--border-subtle)]">
                      <Code2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[var(--text-primary)]">GitHub Infrastructure Sync</div>
                      <div className="text-[10px] font-mono text-[var(--text-muted)]">
                        {hasGitHub ? "Connected repo: mirza-live-platform-v3" : "Automate edge config deploys via GitHub Actions"}
                      </div>
                    </div>
                  </div>
                  {hasGitHub ? (
                    <button
                      onClick={() => disconnectAccount(user.connectedAccounts.find(a => a.provider === "github")?.id || "")}
                      className="px-2.5 py-1 rounded text-[10px] font-mono font-semibold bg-[#EF4444]/10 text-[#EF4444] hover:bg-[#EF4444]/20 transition-colors"
                    >
                      Disconnect
                    </button>
                  ) : (
                    <button
                      onClick={() => connectAccount("github")}
                      className="px-3 py-1 rounded text-xs font-semibold bg-[var(--bg-elevated)] text-[var(--text-primary)] hover:bg-[var(--border-subtle)] border border-[var(--border-subtle)] transition-colors"
                    >
                      Connect
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
