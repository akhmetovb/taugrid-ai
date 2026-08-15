"use client"

import { useCallback, useEffect, useRef } from 'react'
import type { CanvasNode, CanvasEdge } from '@/types/canvas'
import type { SaveStatus } from '@/components/editor/save-status-context'

interface Options {
  projectId: string
  nodes: CanvasNode[]
  edges: CanvasEdge[]
  /** Autosave only runs once the initial canvas load has settled. */
  enabled: boolean
  setStatus: (status: SaveStatus) => void
  /** Debounce window in ms. */
  delay?: number
}

/**
 * Watches canvas nodes/edges and debounces PUTs to the canvas API route,
 * tracking save status (saving → saved / error). Also returns `saveNow` for
 * an immediate manual save (shares the same request + status logic).
 */
export function useCanvasAutosave({
  projectId,
  nodes,
  edges,
  enabled,
  setStatus,
  delay = 1500,
}: Options) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Skip the first snapshot after enabling so hydration doesn't trigger a write.
  const hydrated = useRef(false)
  // Keep the latest graph in a ref so a manual save always sends current state.
  const latest = useRef({ nodes, edges })
  latest.current = { nodes, edges }
  // Monotonic request id so a stale response can't overwrite a newer save's status.
  const seq = useRef(0)
  // Abort the previous in-flight request when a newer save supersedes it.
  const inFlight = useRef<AbortController | null>(null)

  const saveNow = useCallback(async () => {
    if (timer.current) clearTimeout(timer.current)
    inFlight.current?.abort()
    const controller = new AbortController()
    inFlight.current = controller
    const id = ++seq.current
    setStatus('saving')
    try {
      const res = await fetch(`/api/projects/${projectId}/canvas`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(latest.current),
        signal: controller.signal,
      })
      if (id !== seq.current) return
      if (!res.ok) throw new Error(`Save failed: ${res.status}`)
      setStatus('saved')
    } catch (err) {
      if (id !== seq.current || (err as Error)?.name === 'AbortError') return
      setStatus('error')
    }
  }, [projectId, setStatus])

  useEffect(() => {
    if (!enabled) return

    if (!hydrated.current) {
      hydrated.current = true
      return
    }

    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      void saveNow()
    }, delay)

    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [nodes, edges, enabled, delay, saveNow])

  return { saveNow }
}
