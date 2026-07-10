"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

export type ThemeMode = "dark" | "light" | "glass"

interface ThemeContextType {
  theme: ThemeMode
  setTheme: (theme: ThemeMode) => void
  isMounted: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const STORAGE_KEY = "mirza_ui_theme"

export function ThemeProvider({
  children,
  defaultTheme = "dark",
}: {
  children: React.ReactNode
  defaultTheme?: ThemeMode
}) {
  const [theme, setThemeState] = useState<ThemeMode>(defaultTheme)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    const stored = localStorage.getItem(STORAGE_KEY) as ThemeMode | null
    const validTheme = stored && ["dark", "light", "glass"].includes(stored) ? stored : defaultTheme
    setThemeState(validTheme)
    document.documentElement.setAttribute("data-theme", validTheme)
  }, [defaultTheme])

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme)
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, newTheme)
      document.documentElement.setAttribute("data-theme", newTheme)
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isMounted }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
