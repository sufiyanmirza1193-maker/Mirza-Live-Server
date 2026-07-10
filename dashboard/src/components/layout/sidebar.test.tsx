import * as React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Sidebar } from './sidebar'

// ── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('next/navigation', () => ({
  usePathname: () => '/channels',
}))

vi.mock('@/context/shell-context', () => ({
  useShell: () => ({
    sidebarCollapsed: false,
    toggleSidebar: vi.fn(),
    setSidebarCollapsed: vi.fn(),
    systemHealthScore: 100,
    cpuPercent: 24,
    criticalAlertCount: 0,
    wsConnected: false,
    liveChannelCount: 1,
    totalChannelCount: 2,
  }),
}))

vi.mock('@/context/workspace-context', () => ({
  useWorkspace: () => ({
    activeWorkspace: { id: "ws-1", name: "Mirza Live Official 4K", category: "Gaming" },
    workspaces: [{ id: "ws-1", name: "Mirza Live Official 4K", category: "Gaming" }],
    switchWorkspace: vi.fn(),
  }),
}))

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('Mirza OS Sidebar — 5 Experience Centers', () => {
  it('renders all five experience centers', () => {
    render(<Sidebar />)
    expect(screen.getByText('Mission Control')).toBeInTheDocument()
    expect(screen.getByText('Channel Fleet')).toBeInTheDocument()
    expect(screen.getByText('Content Studio')).toBeInTheDocument()
    expect(screen.getByText('Operations')).toBeInTheDocument()
    expect(screen.getAllByText('System').length).toBeGreaterThanOrEqual(1)
  })

  it('renders experience centers with correct hrefs', () => {
    render(<Sidebar />)
    const missionLink = screen.getByText('Mission Control').closest('a')
    const channelLink = screen.getByText('Channel Fleet').closest('a')
    const contentLink = screen.getByText('Content Studio').closest('a')
    const opsLink     = screen.getByText('Operations').closest('a')
    const systemLink  = screen.getAllByText('System')[0].closest('a')

    expect(missionLink).toHaveAttribute('href', '/')
    expect(channelLink).toHaveAttribute('href', '/channels')
    expect(contentLink).toHaveAttribute('href', '/content')
    expect(opsLink).toHaveAttribute('href', '/operations')
    expect(systemLink).toHaveAttribute('href', '/system')
  })

  it('applies active state to Channel Fleet when pathname is /channels', () => {
    render(<Sidebar />)
    const channelLink = screen.getByText('Channel Fleet').closest('a')
    // Active link should have primary surface background variable
    expect(channelLink).toHaveClass('bg-[var(--primary-surface)]')
    // Inactive links should not have primary surface background variable
    const contentLink = screen.getByText('Content Studio').closest('a')
    expect(contentLink).not.toHaveClass('bg-[var(--primary-surface)]')
  })

  it('renders the system status footer', () => {
    render(<Sidebar />)
    expect(screen.getByText(/mirza\.lock/i)).toBeInTheDocument()
    expect(screen.getByText(/SECURED/i)).toBeInTheDocument()
  })

  it('renders the collapse toggle button', () => {
    render(<Sidebar />)
    const collapseBtn = screen.getByRole('button', { name: /collapse sidebar/i })
    expect(collapseBtn).toBeInTheDocument()
  })
})
