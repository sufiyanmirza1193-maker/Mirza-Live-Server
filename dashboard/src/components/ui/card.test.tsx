import * as React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './card'

describe('Card Enterprise Component', () => {
  it('renders card with glassmorphism surface and dark border', () => {
    render(
      <Card data-testid="enterprise-card">
        <CardHeader>
          <CardTitle>Mirza Telemetry</CardTitle>
          <CardDescription>Real-time metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <p>4500k CBR</p>
        </CardContent>
      </Card>
    )

    const card = screen.getByTestId('enterprise-card')
    expect(card).toBeInTheDocument()
    expect(card.className).toContain('border-[#1C1C1C]')
    expect(card.className).toContain('bg-[#111111]/90')
    expect(screen.getByText('Mirza Telemetry')).toBeInTheDocument()
    expect(screen.getByText('4500k CBR')).toBeInTheDocument()
  })
})
