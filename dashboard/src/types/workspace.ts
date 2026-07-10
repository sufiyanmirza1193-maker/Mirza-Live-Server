export interface WorkspaceMember {
  id: string
  name: string
  email: string
  role: "Owner" | "Admin" | "Operator" | "Viewer"
  avatar?: string
}

export interface WorkspaceStats {
  activeChannels: number
  totalChannels: number
  bandwidthMbps: number
  uptimePercentage: number
  storageUsedGb: number
  storageLimitGb: number
}

export interface Workspace {
  id: string
  name: string
  slug: string
  category: "Gaming" | "Music" | "Lo-Fi" | "Podcast" | "Company" | "Custom"
  icon: string
  color: string
  stats: WorkspaceStats
  membersCount: number
  createdAt: string
  isDefault?: boolean
}
