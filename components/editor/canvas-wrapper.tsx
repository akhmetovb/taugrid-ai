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
import { FloatingPanel } from './floating-panel'
import { COMPONENT_MAP, GROUP_COLORS } from '@/types/canvas'
import type { CanvasNode, EnergyComponentDef } from '@/types/canvas'

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

function buildCanvasNode(component: EnergyComponentDef, flowX: number, flowY: number): CanvasNode {
  nodeIdCounter++
  return {
    id: `${component.type}-${Date.now()}-${nodeIdCounter}`,
    type: 'canvasNode',
    position: {
      x: flowX - component.defaultWidth / 2,
      y: flowY - component.defaultHeight / 2,
    },
    width:  component.defaultWidth,
    height: component.defaultHeight,
    data: {
      label:         component.label,
      color:         GROUP_COLORS[component.group].fill,
      componentType: component.type,
      group:         component.group,
      coordinates:   null,
    },
  }
}

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

      let parsed: unknown
      try {
        parsed = JSON.parse(raw)
      } catch {
        return
      }

      if (
        !parsed ||
        typeof parsed !== 'object' ||
        !('componentType' in parsed) ||
        typeof (parsed as Record<string, unknown>).componentType !== 'string'
      ) return

      const component = COMPONENT_MAP[(parsed as Record<string, unknown>).componentType as string]
      if (!component) return

      const position = canvasRef.current.screenToFlowPosition({ x: e.clientX, y: e.clientY })
      canvasRef.current.addNode(buildCanvasNode(component, position.x, position.y))
    },
    [canvasRef]
  )

  const addNodeAtCenter = useCallback(
    (component: EnergyComponentDef) => {
      if (!canvasRef.current) return
      const position = canvasRef.current.screenToFlowPosition({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      })
      canvasRef.current.addNode(buildCanvasNode(component, position.x, position.y))
    },
    [canvasRef]
  )

  return (
    <div className="w-full h-full relative" onDragOver={onDragOver} onDrop={onDrop}>
      {children}
      {/* Floating panel: pointer-events-none on the positioner, auto on the pill */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
        <div className="pointer-events-auto">
          <FloatingPanel onInsert={addNodeAtCenter} />
        </div>
      </div>
    </div>
  )
}

// ─── public component ──────────────────────────────────────────────────────────

interface CanvasWrapperProps {
  roomId: string
  activeView: 'canvas' | '3d'
}

export function CanvasWrapper({ roomId, activeView }: CanvasWrapperProps) {
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
                <Canvas canvasRef={canvasRef} activeView={activeView} />
              </DropZone>
            </ClientSideSuspense>
          </CanvasErrorBoundary>
        </RoomConnectionGuard>
      </RoomProvider>
    </LiveblocksProvider>
  )
}
