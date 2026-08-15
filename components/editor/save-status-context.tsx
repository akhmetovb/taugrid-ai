"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

interface SaveStatusContextValue {
  status: SaveStatus
  setStatus: (status: SaveStatus) => void
  /** Called by the canvas to register (or clear) its immediate-save handler. */
  registerSave: (handler: (() => void) | null) => void
  /** Triggers an immediate manual save, if the canvas is mounted. */
  save: () => void
  /** True once a save handler is registered (canvas ready). */
  canSave: boolean
}

const SaveStatusContext = createContext<SaveStatusContextValue>({
  status: 'idle',
  setStatus: () => {},
  registerSave: () => {},
  save: () => {},
  canSave: false,
})

export function SaveStatusProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<SaveStatus>('idle')
  const [canSave, setCanSave] = useState(false)
  const saveRef = useRef<(() => void) | null>(null)

  // "Saved" is a transient confirmation — flash it, then return to the resting
  // Save icon. "Error" stays sticky until the next save attempt.
  useEffect(() => {
    if (status !== 'saved') return
    const timer = setTimeout(() => setStatus('idle'), 1500)
    return () => clearTimeout(timer)
  }, [status])

  const registerSave = useCallback((handler: (() => void) | null) => {
    saveRef.current = handler
    setCanSave(Boolean(handler))
  }, [])

  const save = useCallback(() => {
    saveRef.current?.()
  }, [])

  return (
    <SaveStatusContext.Provider value={{ status, setStatus, registerSave, save, canSave }}>
      {children}
    </SaveStatusContext.Provider>
  )
}

export function useSaveStatus() {
  return useContext(SaveStatusContext)
}
