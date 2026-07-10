import * as React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Button } from './button'

describe('Button Enterprise Component', () => {
  it('renders correctly with default primary orange styles', () => {
    render(<Button>Launch Stream</Button>)
    const button = screen.getByRole('button', { name: /Launch Stream/i })
    expect(button).toBeInTheDocument()
    expect(button.className).toContain('bg-[#FF5A1F]')
  })

  it('renders glow variant with gradient and shadow', () => {
    render(<Button variant="glow">Quick Actions</Button>)
    const button = screen.getByRole('button', { name: /Quick Actions/i })
    expect(button.className).toContain('bg-gradient-to-r')
  })

  it('renders destructive emergency kill variant', () => {
    render(<Button variant="destructive">Emergency Kill</Button>)
    const button = screen.getByRole('button', { name: /Emergency Kill/i })
    expect(button.className).toContain('bg-[#E53935]')
  })
})
