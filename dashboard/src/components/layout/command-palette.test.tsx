import * as React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { CommandPalette } from './command-palette'

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

describe('Command Palette (Ctrl+K / Milestone 2)', () => {
  it('renders quick search trigger button with ⌘K badge', () => {
    render(<CommandPalette />)
    const trigger = screen.getByText('Quick search or command...')
    expect(trigger).toBeInTheDocument()
    expect(screen.getByText('K')).toBeInTheDocument()
  })

  it('opens dialog when trigger button is clicked and displays command groups', () => {
    render(<CommandPalette />)
    const trigger = screen.getByText('Quick search or command...')
    fireEvent.click(trigger)

    expect(screen.getByPlaceholderText('Type a command or search sections...')).toBeInTheDocument()
    expect(screen.getByText('Broadcast Actions')).toBeInTheDocument()
    expect(screen.getByText('Start Channel Broadcast')).toBeInTheDocument()
    expect(screen.getByText('Navigation')).toBeInTheDocument()
  })
})
