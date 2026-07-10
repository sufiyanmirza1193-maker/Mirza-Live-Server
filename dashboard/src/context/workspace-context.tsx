"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { Workspace } from "@/types/workspace"

interface WorkspaceContextType {
  workspaces: Workspace[]
  activeWorkspace: Workspace
  switchWorkspace: (id: string) => void
  createWorkspace: (name: string, category: Workspace["category"], icon?: string) => void
  isLoading: boolean
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined)

const STORAGE_KEY = "mirza_active_workspace_id_v3"

const DEFAULT_WORKSPACES: Workspace[] = [
  {
    id: "ws_gaming_01",
    name: "Gaming Studio 4K",
    slug: "gaming-studio-4k",
    category: "Gaming",
    icon: "Gamepad2",
    color: "#FF5A1F",
    stats: {
      activeChannels: 2,
      totalChannels: 4,
      bandwidthMbps: 14.8,
      uptimePercentage: 99.99,
      storageUsedGb: 480,
      storageLimitGb: 1000,
    },
    membersCount: 8,
    createdAt: "2026-01-10T10:00:00Z",
    isDefault: true,
  },
  {
    id: "ws_lofi_02",
    name: "24/7 Lo-Fi Fleet",
    slug: "lofi-radio-247",
    category: "Lo-Fi",
    icon: "Headphones",
    color: "#8B5CF6",
    stats: {
      activeChannels: 4,
      totalChannels: 6,
      bandwidthMbps: 18.2,
      uptimePercentage: 100.0,
      storageUsedGb: 820,
      storageLimitGb: 2000,
    },
    membersCount: 4,
    createdAt: "2026-01-18T14:30:00Z",
  },
  {
    id: "ws_music_03",
    name: "Music Main Stage Global",
    slug: "music-main-stage",
    category: "Music",
    icon: "Music2",
    color: "#EC4899",
    stats: {
      activeChannels: 1,
      totalChannels: 3,
      bandwidthMbps: 8.5,
      uptimePercentage: 99.95,
      storageUsedGb: 210,
      storageLimitGb: 1000,
    },
    membersCount: 12,
    createdAt: "2026-02-01T09:15:00Z",
  },
  {
    id: "ws_podcast_04",
    name: "Tech Deep Dive Studio",
    slug: "tech-deep-dive",
    category: "Podcast",
    icon: "Mic",
    color: "#3B82F6",
    stats: {
      activeChannels: 0,
      totalChannels: 2,
      bandwidthMbps: 0.0,
      uptimePercentage: 99.8,
      storageUsedGb: 65,
      storageLimitGb: 500,
    },
    membersCount: 3,
    createdAt: "2026-02-12T11:00:00Z",
  },
  {
    id: "ws_corporate_05",
    name: "Mirza Corporate HQ",
    slug: "mirza-corporate-hq",
    category: "Company",
    icon: "Building2",
    color: "#10B981",
    stats: {
      activeChannels: 1,
      totalChannels: 5,
      bandwidthMbps: 6.2,
      uptimePercentage: 99.99,
      storageUsedGb: 150,
      storageLimitGb: 5000,
    },
    membersCount: 24,
    createdAt: "2026-02-15T16:00:00Z",
  },
]

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>(DEFAULT_WORKSPACES)
  const [activeWorkspace, setActiveWorkspaceState] = useState<Workspace>(DEFAULT_WORKSPACES[0])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedId = localStorage.getItem(STORAGE_KEY)
    if (storedId) {
      const found = workspaces.find((w) => w.id === storedId)
      if (found) {
        setActiveWorkspaceState(found)
      }
    }
    setIsLoading(false)
  }, [workspaces])

  const switchWorkspace = (id: string) => {
    const target = workspaces.find((w) => w.id === id)
    if (target) {
      setActiveWorkspaceState(target)
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, target.id)
      }
    }
  }

  const createWorkspace = (name: string, category: Workspace["category"], icon = "Folder") => {
    const newWs: Workspace = {
      id: `ws_${Date.now()}`,
      name: name,
      slug: name.toLowerCase().replace(/\s+/g, "-"),
      category: category,
      icon: icon,
      color: "#FF5A1F",
      stats: {
        activeChannels: 1,
        totalChannels: 1,
        bandwidthMbps: 4.5,
        uptimePercentage: 100,
        storageUsedGb: 10,
        storageLimitGb: 500,
      },
      membersCount: 1,
      createdAt: new Date().toISOString(),
    }
    setWorkspaces((prev) => [...prev, newWs])
    setActiveWorkspaceState(newWs)
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, newWs.id)
    }
  }

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        activeWorkspace,
        switchWorkspace,
        createWorkspace,
        isLoading,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  )
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext)
  if (!context) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider")
  }
  return context
}
