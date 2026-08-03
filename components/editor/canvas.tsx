"use client"

import { useEffect, useCallback, type MutableRefObject } from 'react'
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  ConnectionMode,
  Panel,
  useReactFlow,
  type NodeTypes,
  type EdgeTypes,
  type XYPosition,
  type Connection,
} from '@xyflow/react'
import { useLiveblocksFlow, Cursors } from '@liveblocks/react-flow'
import { useUndo, useRedo, useCanUndo, useCanRedo } from '@liveblocks/react'
import { ZoomIn, ZoomOut, Maximize2, Undo2, Redo2 } from 'lucide-react'
import '@xyflow/react/dist/style.css'
import '@liveblocks/react-ui/styles.css'
import '@liveblocks/react-flow/styles.css'

import { EnergyNode } from './energy-node'
import { CanvasEdgeRenderer } from './canvas-edge'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
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
}

function CanvasFlow({ canvasRef, activeView }: CanvasFlowProps) {
  const { nodes, edges, onNodesChange, onEdgesChange, onDelete } =
    useLiveblocksFlow<CanvasNode, CanvasEdge>({
      suspense: true,
      nodes: { initial: [] },
      edges: { initial: [] },
    })

  const flowInstance = useReactFlow<CanvasNode, CanvasEdge>()
  const { screenToFlowPosition } = flowInstance
  const undo = useUndo()
  const redo = useRedo()
  const canUndo = useCanUndo()
  const canRedo = useCanRedo()

  useKeyboardShortcuts({ flowInstance, onUndo: undo, onRedo: redo, activeView })

  // Register this canvas's API with the drop zone in canvas-wrapper
  useEffect(() => {
    canvasRef.current = {
      addNode: (node) => onNodesChange([{ type: 'add', item: node }]),
      screenToFlowPosition,
    }
    return () => { canvasRef.current = null }
  }, [canvasRef, onNodesChange, screenToFlowPosition])

  // Custom onConnect ensures every new edge gets the canvasEdge type and empty data.
  // Liveblocks' built-in onConnect ignores defaultEdgeOptions, so we create the
  // edge explicitly via onEdgesChange which runs through Liveblocks' applyEdgeChanges.
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

  return (
    <div className="w-full h-full">
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
        connectionMode={ConnectionMode.Loose}
        fitView
      >
        <Cursors />
        <Background variant={BackgroundVariant.Dots} />
        <ControlBar onUndo={undo} onRedo={redo} canUndo={canUndo} canRedo={canRedo} />
      </ReactFlow>
    </div>
  )
}

// ─── public component ──────────────────────────────────────────────────────────

interface CanvasProps {
  canvasRef: MutableRefObject<CanvasPort | null>
  activeView: 'canvas' | '3d'
}

export function Canvas({ canvasRef, activeView }: CanvasProps) {
  return (
    <ReactFlowProvider>
      <CanvasFlow canvasRef={canvasRef} activeView={activeView} />
    </ReactFlowProvider>
  )
}
