import { useEffect } from 'react'

interface FlowZoom {
  zoomIn(options?: { duration?: number }): void
  zoomOut(options?: { duration?: number }): void
}

interface Options {
  flowInstance: FlowZoom | null
  onUndo: () => void
  onRedo: () => void
}

export function useKeyboardShortcuts({ flowInstance, onUndo, onRedo }: Options) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) return

      const mod = e.metaKey || e.ctrlKey

      if (!mod && (e.key === '+' || e.key === '=')) {
        e.preventDefault()
        flowInstance?.zoomIn({ duration: 200 })
      } else if (!mod && e.key === '-') {
        e.preventDefault()
        flowInstance?.zoomOut({ duration: 200 })
      } else if (mod && !e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        onUndo()
      } else if (mod && e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        onRedo()
      } else if (mod && e.key.toLowerCase() === 'y') {
        e.preventDefault()
        onRedo()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [flowInstance, onUndo, onRedo])
}
