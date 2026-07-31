"use client"

import { useState, useRef, useCallback } from 'react'
import {
  getSmoothStepPath,
  EdgeLabelRenderer,
  Position,
  useReactFlow,
  type EdgeProps,
} from '@xyflow/react'
import { useMutation } from '@liveblocks/react'
import type { CanvasEdge } from '@/types/canvas'

// ─── types ────────────────────────────────────────────────────────────────────

type BendPoint = { x: number; y: number }

// ─── Liveblocks storage types ─────────────────────────────────────────────────

interface EdgeDataLive {
  set(key: string, value: unknown): void
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

// ─── constants ────────────────────────────────────────────────────────────────

const REST_COLOR    = '#505060'
const ACTIVE_COLOR  = '#c0c0cc'
const STROKE_WIDTH  = 1.5
const BORDER_RADIUS = 6
const MARKER_SIZE   = 10

// ─── path helpers ─────────────────────────────────────────────────────────────

// Auto-detect the best source/target position between two arbitrary points.
function autoPos(from: BendPoint, to: BendPoint): { src: Position; tgt: Position } {
  const dx = to.x - from.x
  const dy = to.y - from.y
  if (Math.abs(dx) >= Math.abs(dy)) {
    return dx >= 0
      ? { src: Position.Right, tgt: Position.Left }
      : { src: Position.Left,  tgt: Position.Right }
  }
  return dy >= 0
    ? { src: Position.Bottom, tgt: Position.Top }
    : { src: Position.Top,    tgt: Position.Bottom }
}

// Remove the leading "M x y" from an SVG path string so segments can be joined.
function stripMove(path: string): string {
  return path.replace(/^\s*M\s+-?[\d.]+[,\s]+-?[\d.]+\s*/i, '')
}

// Build the full routed path through source → bend points → target.
// With zero bend points this is identical to a plain getSmoothStepPath call.
function buildEdgePath(
  sourceX: number, sourceY: number, sourcePosition: Position,
  targetX: number, targetY: number, targetPosition: Position,
  bendPoints: BendPoint[],
): [path: string, labelX: number, labelY: number] {
  if (bendPoints.length === 0) {
    const [p, lx, ly] = getSmoothStepPath({
      sourceX, sourceY, sourcePosition,
      targetX, targetY, targetPosition,
      borderRadius: BORDER_RADIUS,
    })
    return [p, lx, ly]
  }

  const pts = [{ x: sourceX, y: sourceY }, ...bendPoints, { x: targetX, y: targetY }]
  let fullPath = ''

  for (let i = 0; i < pts.length - 1; i++) {
    const from = pts[i]
    const to   = pts[i + 1]
    const { src, tgt } = autoPos(from, to)
    const [seg] = getSmoothStepPath({
      sourceX: from.x, sourceY: from.y,
      sourcePosition: i === 0 ? sourcePosition : src,
      targetX: to.x,   targetY: to.y,
      targetPosition:  i === pts.length - 2 ? targetPosition : tgt,
      borderRadius: BORDER_RADIUS,
    })
    fullPath = i === 0 ? seg : fullPath + ' ' + stripMove(seg)
  }

  // Label at the midpoint of the middle segment
  const mid    = Math.floor(pts.length / 2)
  const labelX = (pts[mid - 1].x + pts[mid].x) / 2
  const labelY = (pts[mid - 1].y + pts[mid].y) / 2

  return [fullPath, labelX, labelY]
}

// ─── bend-point helpers ───────────────────────────────────────────────────────

function distToSegment(
  px: number, py: number,
  ax: number, ay: number,
  bx: number, by: number,
): number {
  const dx = bx - ax
  const dy = by - ay
  const lenSq = dx * dx + dy * dy
  if (lenSq === 0) return Math.hypot(px - ax, py - ay)
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lenSq))
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy))
}

// Index in bendPoints at which to insert a new point placed at (px, py).
function findInsertionIndex(
  px: number, py: number,
  sourceX: number, sourceY: number,
  targetX: number, targetY: number,
  bendPoints: BendPoint[],
): number {
  const pts = [{ x: sourceX, y: sourceY }, ...bendPoints, { x: targetX, y: targetY }]
  let bestIdx  = 0
  let bestDist = Infinity
  for (let i = 0; i < pts.length - 1; i++) {
    const d = distToSegment(px, py, pts[i].x, pts[i].y, pts[i + 1].x, pts[i + 1].y)
    if (d < bestDist) { bestDist = d; bestIdx = i }
  }
  return bestIdx
}

// ─── component ────────────────────────────────────────────────────────────────

export function CanvasEdgeRenderer({
  id,
  sourceX, sourceY, sourcePosition,
  targetX, targetY, targetPosition,
  data,
  selected,
}: EdgeProps<CanvasEdge>) {
  const { screenToFlowPosition } = useReactFlow()

  // label editing state
  const [hovered, setHovered] = useState(false)
  const [editing, setEditing] = useState(false)
  const [draft,   setDraft]   = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // bend point drag state — local during drag, committed to Liveblocks on pointer-up
  const [draggingIdx,   setDraggingIdx]   = useState<number | null>(null)
  const [liveBendPoints, setLiveBendPoints] = useState<BendPoint[] | null>(null)

  const storedBendPoints = (data?.bendPoints ?? []) as BendPoint[]
  const bendPoints       = liveBendPoints ?? storedBendPoints

  const label    = data?.label ?? ''
  const isActive = !!(selected || hovered)

  const [edgePath, labelX, labelY] = buildEdgePath(
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
    bendPoints,
  )

  const strokeColor    = isActive ? ACTIVE_COLOR : REST_COLOR
  const restMarkerId   = `canvas-edge-arrow-rest-${id}`
  const activeMarkerId = `canvas-edge-arrow-active-${id}`
  const markerId       = isActive ? activeMarkerId : restMarkerId
  const arrowPoints    = `0 0, ${MARKER_SIZE} ${MARKER_SIZE / 2}, 0 ${MARKER_SIZE}`

  // ── Liveblocks mutations ────────────────────────────────────────────────────

  const updateLabel = useMutation(
    ({ storage }, edgeId: string, newLabel: string) => {
      ;(storage as unknown as StorageWithFlow)
        .get('flow')?.get('edges')?.get(edgeId)?.get('data')?.set('label', newLabel)
    },
    []
  )

  const updateBendPoints = useMutation(
    ({ storage }, edgeId: string, pts: BendPoint[]) => {
      ;(storage as unknown as StorageWithFlow)
        .get('flow')?.get('edges')?.get(edgeId)?.get('data')?.set('bendPoints', pts)
    },
    []
  )

  // ── label handlers ──────────────────────────────────────────────────────────

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
    if (e.key === 'Enter' || e.key === 'Escape') { e.preventDefault(); commit() }
  }, [commit])

  // ── bend point insert ───────────────────────────────────────────────────────

  // Double-click on the edge path when already selected inserts a bend point
  // at the click position in the nearest segment.
  const handleEdgeDoubleClick = useCallback((e: React.MouseEvent) => {
    if (!selected) return
    e.stopPropagation()
    e.preventDefault()
    const pos = screenToFlowPosition({ x: e.clientX, y: e.clientY })
    const idx = findInsertionIndex(
      pos.x, pos.y,
      sourceX, sourceY, targetX, targetY,
      storedBendPoints,
    )
    updateBendPoints(id, [
      ...storedBendPoints.slice(0, idx),
      pos,
      ...storedBendPoints.slice(idx),
    ])
  }, [selected, screenToFlowPosition, sourceX, sourceY, targetX, targetY, storedBendPoints, id, updateBendPoints])

  // ── bend point drag ─────────────────────────────────────────────────────────

  const startBendDrag = useCallback((e: React.PointerEvent, idx: number) => {
    e.stopPropagation()
    e.preventDefault()
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    setDraggingIdx(idx)
    setLiveBendPoints([...storedBendPoints])
  }, [storedBendPoints])

  const moveBendDrag = useCallback((e: React.PointerEvent, idx: number) => {
    if (draggingIdx !== idx) return
    e.stopPropagation()
    const pos = screenToFlowPosition({ x: e.clientX, y: e.clientY })
    setLiveBendPoints(prev => {
      if (!prev) return prev
      const next = [...prev]
      next[idx] = pos
      return next
    })
  }, [draggingIdx, screenToFlowPosition])

  const endBendDrag = useCallback((e: React.PointerEvent, idx: number) => {
    if (draggingIdx !== idx) return
    e.stopPropagation()
    if (liveBendPoints) updateBendPoints(id, liveBendPoints)
    setDraggingIdx(null)
    setLiveBendPoints(null)
  }, [draggingIdx, liveBendPoints, id, updateBendPoints])

  // Double-click a bend point handle to remove it.
  const deleteBendPoint = useCallback((e: React.MouseEvent, idx: number) => {
    e.stopPropagation()
    updateBendPoints(id, storedBendPoints.filter((_, i) => i !== idx))
  }, [storedBendPoints, id, updateBendPoints])

  // ── render ──────────────────────────────────────────────────────────────────

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

      {/* wide invisible hit area — easy click target; also receives the double-click for bend point insert */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onDoubleClick={handleEdgeDoubleClick}
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
        {/* bend point handles — only visible on the selected edge */}
        {selected && bendPoints.map((bp, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${bp.x}px, ${bp.y}px)`,
              width: 10,
              height: 10,
              borderRadius: 2,
              background: ACTIVE_COLOR,
              border: '1.5px solid #080809',
              boxShadow: '0 0 0 2px #3a3a42',
              cursor: draggingIdx === i ? 'grabbing' : 'grab',
              pointerEvents: 'all',
            }}
            className="nodrag nopan"
            onPointerDown={(e) => startBendDrag(e, i)}
            onPointerMove={(e) => moveBendDrag(e, i)}
            onPointerUp={(e) => endBendDrag(e, i)}
            onDoubleClick={(e) => deleteBendPoint(e, i)}
          />
        ))}

        {/* label */}
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
            <span style={{ color: '#505060', fontSize: 11, cursor: 'text', userSelect: 'none' }}>
              label
            </span>
          ) : null}
        </div>
      </EdgeLabelRenderer>
    </>
  )
}
