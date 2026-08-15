"use client"

import { createContext, useContext } from 'react'

interface PulseContextValue {
  pulsingNodeId: string | null
}

export const PulseContext = createContext<PulseContextValue>({ pulsingNodeId: null })

export function usePulse() {
  return useContext(PulseContext)
}
