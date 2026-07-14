import type { Node, Edge } from '@xyflow/react'

export interface CanvasNodeData extends Record<string, unknown> {
  label: string
  color?: string
  shape?: string
}

export type CanvasNode = Node<CanvasNodeData, 'canvasNode'>
export type CanvasEdge = Edge<Record<string, never>, 'canvasEdge'>
