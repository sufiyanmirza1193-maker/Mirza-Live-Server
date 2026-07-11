"use client"

import * as React from "react"

/**
 * useHydrationGuard
 * 
 * Reusable enterprise hook that safely determines if the component has mounted
 * on the client. Prevents Next.js SSR/CSR hydration mismatches when rendering
 * browser-only data (Date.now(), window, localStorage, Recharts SVG sizing).
 */
export function useHydrationGuard(): boolean {
  const [isMounted, setIsMounted] = React.useState<boolean>(false)

  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  return isMounted
}
