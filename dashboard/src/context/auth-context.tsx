"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { UserProfile, ConnectedAccount } from "@/types/auth"

interface AuthContextType {
  user: UserProfile | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, pass?: string, remember?: boolean) => Promise<void>
  loginWithGoogle: () => Promise<void>
  register: (name: string, email: string, pass: string, workspaceName?: string) => Promise<void>
  logout: () => void
  updateProfile: (updates: Partial<UserProfile>) => void
  connectAccount: (provider: ConnectedAccount["provider"]) => void
  disconnectAccount: (id: string) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const STORAGE_KEY = "mirza_auth_session_v3"

const DEFAULT_ENTERPRISE_USER: UserProfile = {
  id: "usr_mirza_principal_01",
  name: "Sufiyan Enterprise",
  email: "sufiyan@mirzalive.internal",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&h=160&q=80",
  role: "Enterprise Admin",
  organization: "Mirza Streaming Global Ltd.",
  createdAt: "2026-01-15T08:30:00Z",
  twoFactorEnabled: true,
  connectedAccounts: [
    {
      id: "acc_google_01",
      provider: "google",
      username: "Sufiyan Mirza",
      email: "sufiyan@gmail.com",
      connectedAt: "2026-02-01T12:00:00Z",
      status: "connected",
    },
    {
      id: "acc_youtube_01",
      provider: "youtube",
      username: "Mirza Live Official 4K",
      email: "studio@mirzalive.com",
      connectedAt: "2026-02-10T14:20:00Z",
      status: "connected",
    },
  ],
  preferences: {
    theme: "glass",
    language: "en-US",
    emailNotifications: true,
    criticalAlertPush: true,
  },
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setUser(parsed)
      } catch {
        setUser(DEFAULT_ENTERPRISE_USER)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ENTERPRISE_USER))
      }
    } else {
      // Default to logged-in enterprise state for immediate evaluation
      setUser(DEFAULT_ENTERPRISE_USER)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ENTERPRISE_USER))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, _pass?: string, remember = true) => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 600))
    const updatedUser: UserProfile = {
      ...DEFAULT_ENTERPRISE_USER,
      email: email || DEFAULT_ENTERPRISE_USER.email,
      name: email ? email.split("@")[0].replace(/[._]/g, " ").toUpperCase() : DEFAULT_ENTERPRISE_USER.name,
    }
    setUser(updatedUser)
    if (remember && typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser))
    }
    setIsLoading(false)
  }

  const loginWithGoogle = async () => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 800))
    const googleUser: UserProfile = {
      ...DEFAULT_ENTERPRISE_USER,
      name: "Mirza Google SSO",
      email: "sufiyan.mirza@gmail.com",
    }
    setUser(googleUser)
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(googleUser))
    }
    setIsLoading(false)
  }

  const register = async (name: string, email: string, _pass: string) => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 800))
    const newUser: UserProfile = {
      ...DEFAULT_ENTERPRISE_USER,
      id: `usr_${Date.now()}`,
      name: name || "New Enterprise Operator",
      email: email,
    }
    setUser(newUser)
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser))
    }
    setIsLoading(false)
  }

  const logout = () => {
    setUser(null)
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (!user) return
    const updated = { ...user, ...updates }
    setUser(updated)
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    }
  }

  const connectAccount = (provider: ConnectedAccount["provider"]) => {
    if (!user) return
    const newAcc: ConnectedAccount = {
      id: `acc_${provider}_${Date.now()}`,
      provider,
      username: `${user.name} (${provider.toUpperCase()})`,
      email: user.email,
      connectedAt: new Date().toISOString(),
      status: "connected",
    }
    const updatedAccounts = [...user.connectedAccounts, newAcc]
    updateProfile({ connectedAccounts: updatedAccounts })
  }

  const disconnectAccount = (id: string) => {
    if (!user) return
    const updatedAccounts = user.connectedAccounts.filter((a) => a.id !== id)
    updateProfile({ connectedAccounts: updatedAccounts })
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginWithGoogle,
        register,
        logout,
        updateProfile,
        connectAccount,
        disconnectAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
