import * as React from "react"
import { render, screen, fireEvent, act, waitFor } from "@testing-library/react"
import { describe, it, expect, beforeEach } from "vitest"
import { ThemeProvider, useTheme } from "@/context/theme-context"
import { AuthProvider, useAuth } from "@/context/auth-context"
import { WorkspaceProvider, useWorkspace } from "@/context/workspace-context"

// Helper components for testing hooks
function ThemeTestComponent() {
  const { theme, setTheme } = useTheme()
  return (
    <div>
      <span data-testid="current-theme">{theme}</span>
      <button onClick={() => setTheme("light")} data-testid="set-light">
        Set Light
      </button>
      <button onClick={() => setTheme("glass")} data-testid="set-glass">
        Set Glass
      </button>
    </div>
  )
}

function AuthTestComponent() {
  const { user, isAuthenticated, login, logout } = useAuth()
  return (
    <div>
      <span data-testid="auth-status">{isAuthenticated ? "authenticated" : "anonymous"}</span>
      <span data-testid="user-email">{user?.email || "none"}</span>
      <button onClick={() => login("admin@mirzalive.internal", "secretpassword", true)} data-testid="login-btn">
        Login
      </button>
      <button onClick={logout} data-testid="logout-btn">
        Logout
      </button>
    </div>
  )
}

function WorkspaceTestComponent() {
  const { activeWorkspace, workspaces, createWorkspace } = useWorkspace()
  return (
    <div>
      <span data-testid="active-workspace">{activeWorkspace?.name || "none"}</span>
      <span data-testid="workspace-count">{workspaces.length}</span>
      <button onClick={() => createWorkspace("New Studio 4K", "Music")} data-testid="create-workspace-btn">
        Create Studio
      </button>
    </div>
  )
}

describe("Mirza Enterprise OS v3 - Core Engine Verification", () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute("data-theme")
  })

  it("1. ThemeProvider initializes safely and updates data-theme without FOUC or mismatch", async () => {
    render(
      <ThemeProvider defaultTheme="dark">
        <ThemeTestComponent />
      </ThemeProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId("current-theme").textContent).toBe("dark")
    })
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark")

    act(() => {
      fireEvent.click(screen.getByTestId("set-glass"))
    })

    await waitFor(() => {
      expect(screen.getByTestId("current-theme").textContent).toBe("glass")
    })
    expect(document.documentElement.getAttribute("data-theme")).toBe("glass")
    expect(localStorage.getItem("mirza_ui_theme")).toBe("glass")
  })

  it("2. AuthProvider manages enterprise operator session and allows logout/login", async () => {
    render(
      <AuthProvider>
        <AuthTestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId("auth-status").textContent).toBe("authenticated")
    })

    act(() => {
      fireEvent.click(screen.getByTestId("logout-btn"))
    })

    await waitFor(() => {
      expect(screen.getByTestId("auth-status").textContent).toBe("anonymous")
    })
    expect(localStorage.getItem("mirza_auth_session_v3")).toBeNull()

    await act(async () => {
      fireEvent.click(screen.getByTestId("login-btn"))
    })

    await waitFor(() => {
      expect(screen.getByTestId("auth-status").textContent).toBe("authenticated")
    })
    expect(screen.getByTestId("user-email").textContent).toBe("admin@mirzalive.internal")
    expect(localStorage.getItem("mirza_auth_session_v3")).toContain("admin@mirzalive.internal")
  })

  it("3. WorkspaceProvider maintains enterprise fleet state and allows creating new studios", async () => {
    render(
      <WorkspaceProvider>
        <WorkspaceTestComponent />
      </WorkspaceProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId("workspace-count").textContent).toBe("5")
    })
    expect(screen.getByTestId("active-workspace").textContent).toBe("Gaming Studio 4K")

    act(() => {
      fireEvent.click(screen.getByTestId("create-workspace-btn"))
    })

    await waitFor(() => {
      expect(screen.getByTestId("workspace-count").textContent).toBe("6")
    })
    expect(screen.getByTestId("active-workspace").textContent).toBe("New Studio 4K")
  })
})
