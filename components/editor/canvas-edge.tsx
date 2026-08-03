"use client"

import { useState, useRef, useCallback } from 'react'
import { getSmoothStepPath, EdgeLabelRenderer, type EdgeProps } from '@xyflow/react'
import { useMutation } from '@liveblocks/react'
import type { CanvasEdge } from '@/types/canvas'

// ─── Liveblocks storage types ──────────────────────────────────────────────────

interface EdgeDataLive {
  set(key: 'label', value: string): void
}
interface EdgeLive {
  get(key: 'data'): EdgeDataLive | undefined
}
interface EdgesMap {
  get(id: string): EdgeLive | undefined
}
interface FlowLive {
  get(key: 'edges'): EdgesMap | undefined
}
interface StorageWithFlow {
  get(key: 'flow'): FlowLive | undefined
}

// ─── constants ─────────────────────────────────────────────────────────────────

const REST_COLOR   = '#505060'
const ACTIVE_COLOR = '#c0c0cc'
const STROKE_WIDTH = 1.5
const BORDER_RADIUS = 6
const MARKER_SIZE   = 10

// ─── component ─────────────────────────────────────────────────────────────────

export function CanvasEdgeRenderer({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps<CanvasEdge>) {
  const [hovered, setHovered] = useState(false)
  const [editing, setEditing] = useState(false)
  const [draft,   setDraft]   = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const label    = data?.label ?? ''
  const isActive = !!(selected || hovered)

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: BORDER_RADIUS,
  })

  const strokeColor     = isActive ? ACTIVE_COLOR : REST_COLOR
  const restMarkerId    = `canvas-edge-arrow-rest-${id}`
  const activeMarkerId  = `canvas-edge-arrow-active-${id}`
  const markerId        = isActive ? activeMarkerId : restMarkerId

  const updateLabel = useMutation(
    ({ storage }, edgeId: string, newLabel: string) => {
      ;(storage as unknown as StorageWithFlow)
        .get('flow')?.get('edges')?.get(edgeId)?.get('data')?.set('label', newLabel)
    },
    []
  )

  const openEditor = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setDraft(label)
    setEditing(true)
    setTimeout(() => inputRef.current?.select(), 0)
  }, [label])

  const commit = useCallback(() => {
    updateLabel(id, draft.trim())
    setEditing(false)
  }, [draft, id, updateLabel])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation()
    if (e.key === 'Enter' || e.key === 'Escape') {
      e.preventDefault()
      commit()
    }
  }, [commit])

  const arrowPoints = `0 0, ${MARKER_SIZE} ${MARKER_SIZE / 2}, 0 ${MARKER_SIZE}`

  return (
    <>
      <defs>
        <marker
          id={restMarkerId}
          viewBox={`0 0 ${MARKER_SIZE} ${MARKER_SIZE}`}
          refX={MARKER_SIZE - 1}
          refY={MARKER_SIZE / 2}
          markerWidth={MARKER_SIZE / 2}
          markerHeight={MARKER_SIZE / 2}
          orient="auto"
        >
          <polygon points={arrowPoints} fill={REST_COLOR} />
        </marker>
        <marker
          id={activeMarkerId}
          viewBox={`0 0 ${MARKER_SIZE} ${MARKER_SIZE}`}
          refX={MARKER_SIZE - 1}
          refY={MARKER_SIZE / 2}
          markerWidth={MARKER_SIZE / 2}
          markerHeight={MARKER_SIZE / 2}
          orient="auto"
        >
          <polygon points={arrowPoints} fill={ACTIVE_COLOR} />
        </marker>
      </defs>

      {/* wide invisible hit area — makes edges easier to click without thickening the line */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ pointerEvents: 'all', cursor: 'pointer' }}
      />

      {/* visible edge */}
      <path
        d={edgePath}
        fill="none"
        stroke={strokeColor}
        strokeWidth={STROKE_WIDTH}
        strokeLinecap="round"
        strokeLinejoin="round"
        markerEnd={`url(#${markerId})`}
        style={{ pointerEvents: 'none', transition: 'stroke 0.15s ease' }}
      />

      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
          onDoubleClick={openEditor}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {editing ? (
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commit}
              onKeyDown={handleKeyDown}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              autoFocus
              style={{
                background: '#111114',
                border: '1px solid #3a3a42',
                borderRadius: 6,
                color: '#f0f0f4',
                fontSize: 11,
                padding: '2px 6px',
                outline: 'none',
                width: `${Math.max(60, draft.length * 7 + 16)}px`,
              }}
            />
          ) : label ? (
            <span
              style={{
                background: '#18181c',
                border: '1px solid #2a2a30',
                borderRadius: 6,
                color: '#c0c0cc',
                fontSize: 11,
                padding: '2px 6px',
                cursor: 'text',
                userSelect: 'none',
                whiteSpace: 'nowrap',
                display: 'inline-block',
              }}
            >
              {label}
            </span>
          ) : isActive ? (
            <span
              style={{
                color: '#505060',
                fontSize: 11,
                cursor: 'text',
                userSelect: 'none',
              }}
            >
              label
            </span>
          ) : null}
        </div>
      </EdgeLabelRenderer>
    </>
  )
}
