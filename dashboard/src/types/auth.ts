export interface ConnectedAccount {
  id: string
  provider: "google" | "youtube" | "github" | "discord" | "microsoft"
  username?: string
  email?: string
  connectedAt: string
  status: "connected" | "disconnected" | "error"
}

export interface UserProfile {
  id: string
  name: string
  email: string
  avatar?: string
  role: "Enterprise Admin" | "Stream Engineer" | "Viewer"
  organization: string
  createdAt: string
  twoFactorEnabled: boolean
  connectedAccounts: ConnectedAccount[]
  preferences: {
    theme: "dark" | "light" | "glass"
    language: string
    emailNotifications: boolean
    criticalAlertPush: boolean
  }
}

export interface AuthState {
  user: UserProfile | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}
