"use client"

import { useEffect, useCallback, useRef, useState, type MutableRefObject } from 'react'
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  ConnectionMode,
  Panel,
  useReactFlow,
  useNodes,
  useEdges,
  type NodeTypes,
  type EdgeTypes,
  type XYPosition,
  type Connection,
  type NodeChange,
} from '@xyflow/react'
import { useLiveblocksFlow } from '@liveblocks/react-flow'
import { useUndo, useRedo, useCanUndo, useCanRedo, useUpdateMyPresence } from '@liveblocks/react'
import { ZoomIn, ZoomOut, Maximize2, Undo2, Redo2 } from 'lucide-react'
import '@xyflow/react/dist/style.css'
import '@liveblocks/react-ui/styles.css'
import '@liveblocks/react-flow/styles.css'

import { EnergyNode } from './energy-node'
import { CanvasEdgeRenderer } from './canvas-edge'
import { ComponentList } from './component-list'
import { PulseContext } from './pulse-context'
import { PresenceCursors } from './presence-cursors'
import { useSaveStatus } from './save-status-context'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useCanvasAutosave } from '@/hooks/use-canvas-autosave'
import type { CanvasNode, CanvasEdge } from '@/types/canvas'

// ─── public interface shared with canvas-wrapper ────────────────────────────────

export interface CanvasPort {
  addNode: (node: CanvasNode) => void
  screenToFlowPosition: (clientPos: XYPosition) => XYPosition
}

// ─── control bar ──────────────────────────────────────────────────────────────

const btnClass =
  'flex items-center justify-center rounded-xl p-1.5 transition-colors hover:bg-subtle text-copy-primary disabled:opacity-30 disabled:cursor-not-allowed'

interface ControlBarProps {
  onUndo: () => void
  onRedo: () => void
  canUndo: boolean
  canRedo: boolean
}

function ControlBar({ onUndo, onRedo, canUndo, canRedo }: ControlBarProps) {
  const { zoomIn, zoomOut, fitView } = useReactFlow<CanvasNode, CanvasEdge>()

  return (
    <Panel position="bottom-left" style={{ margin: '1.5rem' }}>
      <div className="flex items-center rounded-full border border-surface-border bg-elevated px-1 py-1 shadow-lg">
        <button
          onClick={() => zoomOut({ duration: 200 })}
          title="Zoom out"
          className={btnClass}
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <button
          onClick={() => fitView({ duration: 300 })}
          title="Fit view"
          className={btnClass}
        >
          <Maximize2 className="h-4 w-4" />
        </button>
        <button
          onClick={() => zoomIn({ duration: 200 })}
          title="Zoom in"
          className={btnClass}
        >
          <ZoomIn className="h-4 w-4" />
        </button>

        <div className="h-4 w-px bg-surface-border mx-1" />

        <button
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo"
          className={btnClass}
        >
          <Undo2 className="h-4 w-4" />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo"
          className={btnClass}
        >
          <Redo2 className="h-4 w-4" />
        </button>
      </div>
    </Panel>
  )
}

// ─── inner component (inside ReactFlowProvider) ────────────────────────────────

const nodeTypes: NodeTypes = { canvasNode: EnergyNode }
const edgeTypes: EdgeTypes = { canvasEdge: CanvasEdgeRenderer }

const defaultEdgeOptions = {
  type: 'canvasEdge' as const,
  data: {} as CanvasEdge['data'],
}

interface CanvasFlowProps {
  canvasRef: MutableRefObject<CanvasPort | null>
  activeView: 'canvas' | '3d'
  projectId: string
}

function CanvasFlow({ canvasRef, activeView, projectId }: CanvasFlowProps) {
  const { nodes, edges, onNodesChange, onEdgesChange, onDelete } =
    useLiveblocksFlow<CanvasNode, CanvasEdge>({
      suspense: true,
      nodes: { initial: [] },
      edges: { initial: [] },
    })

  const { setStatus, registerSave } = useSaveStatus()
  const [autosaveEnabled, setAutosaveEnabled] = useState(false)
  const loadStarted = useRef(false)

  // Load saved canvas state on mount, but only when the room is empty — an
  // already-populated room means active collaboration we must not overwrite.
  useEffect(() => {
    if (loadStarted.current) return
    loadStarted.current = true

    if (nodes.length > 0 || edges.length > 0) {
      setAutosaveEnabled(true)
      return
    }

    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`/api/projects/${projectId}/canvas`)
        if (res.ok) {
          const data = await res.json()
          const canvas = data?.canvas as
            | { nodes?: CanvasNode[]; edges?: CanvasEdge[] }
            | null
            | undefined
          const loadedNodes = canvas?.nodes ?? []
          const loadedEdges = canvas?.edges ?? []
          if (!cancelled && (loadedNodes.length > 0 || loadedEdges.length > 0)) {
            onNodesChange(loadedNodes.map((item) => ({ type: 'add', item })))
            onEdgesChange(loadedEdges.map((item) => ({ type: 'add', item })))
          }
        }
      } catch {
        // Ignore load failures — start with an empty canvas.
      } finally {
        if (!cancelled) setAutosaveEnabled(true)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [projectId, nodes, edges, onNodesChange, onEdgesChange])

  const { saveNow } = useCanvasAutosave({
    projectId,
    nodes,
    edges,
    enabled: autosaveEnabled,
    setStatus,
  })

  // Expose the immediate-save handler to the navbar Save button.
  useEffect(() => {
    registerSave(() => { void saveNow() })
    return () => registerSave(null)
  }, [registerSave, saveNow])

  const flowInstance = useReactFlow<CanvasNode, CanvasEdge>()
  const { screenToFlowPosition } = flowInstance
  const undo = useUndo()
  const redo = useRedo()
  const canUndo = useCanUndo()
  const canRedo = useCanRedo()

  const [pulsingNodeId, setPulsingNodeId] = useState<string | null>(null)
  const pulseTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const updateMyPresence = useUpdateMyPresence()

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const pos = screenToFlowPosition({ x: event.clientX, y: event.clientY })
      updateMyPresence({ cursor: pos })
    },
    [screenToFlowPosition, updateMyPresence]
  )

  const handleMouseLeave = useCallback(() => {
    updateMyPresence({ cursor: null })
  }, [updateMyPresence])

  useKeyboardShortcuts({ flowInstance, onUndo: undo, onRedo: redo, activeView })

  // Delete selected nodes/edges via the Liveblocks collaborative mutation
  // helpers so removals sync to every connected client in real time. React
  // Flow's built-in keyboard deletion is disabled (deleteKeyCode={null}) so
  // every deletion goes through this path. A ref keeps the listener stable
  // while always reading the latest selection.
  const selectedNodes = useNodes<CanvasNode>()
  const selectedEdges = useEdges<CanvasEdge>()
  const selectionRef = useRef({ nodes: selectedNodes, edges: selectedEdges })
  selectionRef.current = { nodes: selectedNodes, edges: selectedEdges }

  useEffect(() => {
    if (activeView !== 'canvas') return

    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Delete' && e.key !== 'Backspace') return

      const target = e.target as HTMLElement | null
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) return

      const nodesToRemove = selectionRef.current.nodes.filter((n) => n.selected)
      const edgesToRemove = selectionRef.current.edges.filter((edge) => edge.selected)
      if (nodesToRemove.length === 0 && edgesToRemove.length === 0) return

      e.preventDefault()
      // `onNodesChange`/`onEdgesChange` ignore "remove" changes in
      // @liveblocks/react-flow; `onDelete` is the collaborative mutation that
      // actually deletes from storage and syncs to every connected client.
      onDelete({ nodes: nodesToRemove, edges: edgesToRemove })
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [activeView, onDelete])

  // Register canvas API for the drop zone
  useEffect(() => {
    canvasRef.current = {
      addNode: (node) => onNodesChange([{ type: 'add', item: node }]),
      screenToFlowPosition,
    }
    return () => { canvasRef.current = null }
  }, [canvasRef, onNodesChange, screenToFlowPosition])

  // Custom onConnect: create canvasEdge with explicit type + data
  const handleConnect = useCallback(
    (connection: Connection) => {
      const edge: CanvasEdge = {
        id: `xy-edge__${connection.source}${connection.sourceHandle ?? ''}-${connection.target}${connection.targetHandle ?? ''}`,
        source: connection.source,
        target: connection.target,
        sourceHandle: connection.sourceHandle ?? null,
        targetHandle: connection.targetHandle ?? null,
        type: 'canvasEdge',
        data: {},
      }
      onEdgesChange([{ type: 'add', item: edge }])
    },
    [onEdgesChange]
  )

  // Locate: select node + pan if off-screen + pulse ring
  const handleLocate = useCallback(
    (nodeId: string) => {
      // Select only this node
      const selectChanges: NodeChange<CanvasNode>[] = nodes.map((n) => ({
        type: 'select' as const,
        id:   n.id,
        selected: n.id === nodeId,
      }))
      onNodesChange(selectChanges)

      // Pan if node is outside the current viewport
      const node = flowInstance.getNode(nodeId)
      if (node) {
        const { x: vpX, y: vpY, zoom } = flowInstance.getViewport()
        const nodeW = (node.measured?.width  ?? node.width  ?? 120) as number
        const nodeH = (node.measured?.height ?? node.height ?? 80)  as number

        const screenX  = node.position.x * zoom + vpX
        const screenY  = node.position.y * zoom + vpY
        const screenX2 = screenX + nodeW * zoom
        const screenY2 = screenY + nodeH * zoom

        const canvasW = window.innerWidth
        const canvasH = window.innerHeight - 48 // minus 3rem navbar

        const isVisible =
          screenX  >= 0 &&
          screenY  >= 0 &&
          screenX2 <= canvasW &&
          screenY2 <= canvasH

        if (!isVisible) {
          flowInstance.setCenter(
            node.position.x + nodeW / 2,
            node.position.y + nodeH / 2,
            { duration: 400 },
          )
        }
      }

      // Trigger pulse ring (fades in EnergyNode after 700ms)
      if (pulseTimer.current) clearTimeout(pulseTimer.current)
      setPulsingNodeId(nodeId)
      pulseTimer.current = setTimeout(() => setPulsingNodeId(null), 800)
    },
    [nodes, onNodesChange, flowInstance]
  )

  return (
    <PulseContext.Provider value={{ pulsingNodeId }}>
      <div className="w-full h-full relative">
        {/* Component list — draggable overlay, top-center */}
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 20 }}>
          <div className="pointer-events-auto">
            <ComponentList
              nodes={nodes}
              onLocate={handleLocate}
            />
          </div>
        </div>

        {/* Live cursors — fills canvas, renders above nodes (z:10) but below UI panels (z:20) */}
        <PresenceCursors />

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={handleConnect}
          onDelete={onDelete}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
          deleteKeyCode={null}
          connectionMode={ConnectionMode.Loose}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          fitView
        >
          <Background variant={BackgroundVariant.Dots} />
          <ControlBar onUndo={undo} onRedo={redo} canUndo={canUndo} canRedo={canRedo} />
        </ReactFlow>
      </div>
    </PulseContext.Provider>
  )
}

// ─── public component ──────────────────────────────────────────────────────────

interface CanvasProps {
  canvasRef: MutableRefObject<CanvasPort | null>
  activeView: 'canvas' | '3d'
  projectId: string
}

export function Canvas({ canvasRef, activeView, projectId }: CanvasProps) {
  return (
    <ReactFlowProvider>
      <CanvasFlow canvasRef={canvasRef} activeView={activeView} projectId={projectId} />
    </ReactFlowProvider>
  )
}
