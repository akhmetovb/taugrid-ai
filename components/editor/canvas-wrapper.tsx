"use client"

import {
  Component,
  useCallback,
  useRef,
  useState,
  type MutableRefObject,
  type ReactNode,
} from 'react'
import {
  LiveblocksProvider,
  RoomProvider,
  useErrorListener,
  useLostConnectionListener,
} from '@liveblocks/react'
import { ClientSideSuspense } from '@liveblocks/react/suspense'
import { Canvas, type CanvasPort } from './canvas'
import { FloatingPanel, type PanelDragPayload } from './floating-panel'
import { GROUP_COLORS } from '@/types/canvas'
import type { CanvasNode } from '@/types/canvas'

// ─── error boundary ────────────────────────────────────────────────────────────

class CanvasErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) return this.props.fallback
    return this.props.children
  }
}

const connectionErrorFallback = (
  <div className="h-full flex items-center justify-center text-copy-muted text-sm">
    Connection error — please refresh.
  </div>
)

// ─── connection guard ───────────────────────────────────────────────────────────

function RoomConnectionGuard({ children }: { children: ReactNode }) {
  const [hasConnectionError, setHasConnectionError] = useState(false)

  useErrorListener((error) => {
    if (error.context.type === 'ROOM_CONNECTION_ERROR') {
      setHasConnectionError(true)
    }
  })

  useLostConnectionListener((event) => {
    if (event === 'failed') setHasConnectionError(true)
    if (event === 'restored') setHasConnectionError(false)
  })

  if (hasConnectionError) return connectionErrorFallback
  return <>{children}</>
}

// ─── drop zone + panel overlay ─────────────────────────────────────────────────

let nodeIdCounter = 0

interface DropZoneProps {
  canvasRef: MutableRefObject<CanvasPort | null>
  children: ReactNode
}

function DropZone({ canvasRef, children }: DropZoneProps) {
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }, [])

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()

      const raw = e.dataTransfer.getData('application/json')
      if (!raw || !canvasRef.current) return

      let payload: PanelDragPayload
      try {
        payload = JSON.parse(raw) as PanelDragPayload
      } catch {
        return
      }

      const position = canvasRef.current.screenToFlowPosition({
        x: e.clientX,
        y: e.clientY,
      })

      nodeIdCounter++
      const id = `${payload.componentType}-${Date.now()}-${nodeIdCounter}`

      const newNode: CanvasNode = {
        id,
        type: 'canvasNode',
        position: {
          x: position.x - payload.defaultWidth / 2,
          y: position.y - payload.defaultHeight / 2,
        },
        width:  payload.defaultWidth,
        height: payload.defaultHeight,
        data: {
          label:         payload.label,
          color:         GROUP_COLORS[payload.group].fill,
          componentType: payload.componentType,
          group:         payload.group,
          coordinates:   null,
        },
      }

      canvasRef.current.addNode(newNode)
    },
    [canvasRef]
  )

  return (
    <div className="w-full h-full relative" onDragOver={onDragOver} onDrop={onDrop}>
      {children}
      {/* Floating panel: pointer-events-none on the positioner, auto on the pill */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
        <div className="pointer-events-auto">
          <FloatingPanel />
        </div>
      </div>
    </div>
  )
}

// ─── public component ──────────────────────────────────────────────────────────

interface CanvasWrapperProps {
  roomId: string
}

export function CanvasWrapper({ roomId }: CanvasWrapperProps) {
  const canvasRef = useRef<CanvasPort | null>(null)

  return (
    <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
      <RoomProvider
        id={roomId}
        initialPresence={{ cursor: null, isThinking: false }}
      >
        <RoomConnectionGuard>
          <CanvasErrorBoundary fallback={connectionErrorFallback}>
            <ClientSideSuspense
              fallback={
                <div className="h-full flex items-center justify-center text-copy-muted text-sm">
                  Connecting…
                </div>
              }
            >
              <DropZone canvasRef={canvasRef}>
                <Canvas canvasRef={canvasRef} />
              </DropZone>
            </ClientSideSuspense>
          </CanvasErrorBoundary>
        </RoomConnectionGuard>
      </RoomProvider>
    </LiveblocksProvider>
  )
}
