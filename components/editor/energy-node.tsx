"use client"

import { useState, useRef, useCallback, type CSSProperties } from 'react'
import { Handle, Position, NodeResizer, NodeToolbar, type NodeProps } from '@xyflow/react'
import { Icon } from '@iconify/react'
import { useMutation } from '@liveblocks/react'
import { COMPONENT_MAP, GROUP_COLORS, NODE_COLORS } from '@/types/canvas'
import type { CanvasNode, ComponentGroup } from '@/types/canvas'
import { usePulse } from './pulse-context'

const GROUP_MIN: Record<string, { w: number; h: number }> = {
  control: { w: 60, h: 50 },
}
const DEFAULT_MIN = { w: 80, h: 60 }

const resizerHandleStyle = {
  width: 8,
  height: 8,
  background: '#2a2a30',
  border: '1.5px solid #505060',
  borderRadius: 2,
}

const resizerLineStyle = { borderColor: '#3a3a42' }

interface NodeDataLive {
  set(key: 'label' | 'fillColor' | 'textColor', value: string): void
}
interface NodeLive {
  get(key: 'data'): NodeDataLive | undefined
}
interface NodesMap {
  get(id: string): NodeLive | undefined
}
interface FlowLive {
  get(key: 'nodes'): NodesMap | undefined
}
interface StorageWithFlow {
  get(key: 'flow'): FlowLive | undefined
}

export function EnergyNode({ id, data, selected }: NodeProps<CanvasNode>) {
  const { label, componentType, group, fillColor, textColor } = data
  const def         = componentType ? COMPONENT_MAP[componentType] : null
  const groupColors = group ? GROUP_COLORS[group as ComponentGroup] : null
  const minSize     = GROUP_MIN[group ?? ''] ?? DEFAULT_MIN
  const fallbackLabel = def?.label ?? 'Component'

  const activeFill = fillColor ?? groupColors?.fill ?? '#1F1F1F'
  const activeText = textColor ?? groupColors?.text ?? '#EDEDED'

  const { pulsingNodeId } = usePulse()
  const isPulsing = pulsingNodeId === id

  const [nodeHovered, setNodeHovered] = useState(false)
  const [editing, setEditing]         = useState(false)
  const [draft, setDraft]             = useState('')
  const [hoveredSwatch, setHoveredSwatch] = useState<number | null>(null)

  const connectionHandleStyle: CSSProperties = {
    width: 8,
    height: 8,
    background: 'white',
    border: '1.5px solid #2a2a30',
    opacity: nodeHovered ? 1 : 0,
    transition: 'opacity 0.15s ease',
  }
  const prior       = useRef(label)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const updateLabel = useMutation(
    ({ storage }, nodeId: string, newLabel: string) => {
      ;(storage as unknown as StorageWithFlow)
        .get('flow')?.get('nodes')?.get(nodeId)?.get('data')?.set('label', newLabel)
    },
    []
  )

  const updateColor = useMutation(
    ({ storage }, nodeId: string, fill: string, text: string) => {
      const nodeData = (storage as unknown as StorageWithFlow)
        .get('flow')?.get('nodes')?.get(nodeId)?.get('data')
      nodeData?.set('fillColor', fill)
      nodeData?.set('textColor', text)
    },
    []
  )

  const openEditor = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    prior.current = label
    setDraft(label)
    setEditing(true)
    setTimeout(() => textareaRef.current?.select(), 0)
  }, [label])

  const commit = useCallback((value: string) => {
    updateLabel(id, value.trim() || fallbackLabel)
    setEditing(false)
  }, [fallbackLabel, id, updateLabel])

  const discard = useCallback(() => {
    setEditing(false)
  }, [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    e.stopPropagation()
    if (e.key === 'Escape') {
      e.preventDefault()
      discard()
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      commit(draft)
    }
  }, [commit, discard, draft])

  return (
    <>
      <NodeToolbar isVisible={selected} position={Position.Top} offset={10}>
        <div
          className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl"
          style={{ background: '#111114', border: '1px solid #2a2a30' }}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          {NODE_COLORS.map((pair, i) => {
            const isActive  = pair.fill === activeFill
            const isHovered = hoveredSwatch === i
            return (
              <button
                key={i}
                type="button"
                aria-label={`Select color ${pair.fill}`}
                aria-pressed={isActive}
                onMouseDown={(e) => { e.stopPropagation(); e.preventDefault() }}
                onClick={(e) => {
                  e.stopPropagation()
                  updateColor(id, pair.fill, pair.text)
                }}
                onMouseEnter={() => setHoveredSwatch(i)}
                onMouseLeave={() => setHoveredSwatch(null)}
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: pair.fill,
                  border: isActive ? `2px solid ${pair.text}` : '1.5px solid #3a3a42',
                  outline: isActive ? `1.5px solid ${pair.text}` : 'none',
                  outlineOffset: 2,
                  boxShadow: isHovered ? `0 0 5px 2px ${pair.text}55` : 'none',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'box-shadow 0.15s ease',
                }}
              />
            )
          })}
        </div>
      </NodeToolbar>

      <div
        className="w-full h-full flex flex-col items-center justify-center gap-1 rounded-xl select-none"
        style={{
          background: activeFill,
          border: `1.5px solid ${activeText}`,
          padding: '6px 8px',
          overflow: 'visible',
        }}
        onMouseEnter={() => setNodeHovered(true)}
        onMouseLeave={() => setNodeHovered(false)}
      >
        {isPulsing && (
          <div
            className="node-pulse-ring absolute rounded-xl pointer-events-none"
            style={{
              inset: -6,
              border: `2px solid ${activeText}`,
            }}
          />
        )}
        <NodeResizer
          isVisible={selected}
          minWidth={minSize.w}
          minHeight={minSize.h}
          handleStyle={resizerHandleStyle}
          lineStyle={resizerLineStyle}
        />

        <Handle id="top"  type="source" position={Position.Top}  style={connectionHandleStyle} />
        <Handle id="left" type="source" position={Position.Left} style={connectionHandleStyle} />

        {def && (
          <Icon
            icon={def.icon}
            width={18}
            height={18}
            style={{ color: activeText, flexShrink: 0 }}
          />
        )}

        {editing ? (
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => commit(draft)}
            onKeyDown={handleKeyDown}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            autoFocus
            rows={2}
            className="w-full resize-none bg-transparent text-[10px] font-medium leading-tight text-center outline-none rounded"
            style={{
              color: '#f0f0f4',
              border: '1px solid #3a3a42',
              padding: '2px 4px',
            }}
          />
        ) : (
          <span
            className="text-[10px] font-medium leading-tight text-center w-full cursor-text"
            style={{ color: activeText }}
            onDoubleClick={openEditor}
          >
            {label}
          </span>
        )}

        <Handle id="bottom" type="source" position={Position.Bottom} style={connectionHandleStyle} />
        <Handle id="right"  type="source" position={Position.Right}  style={connectionHandleStyle} />
      </div>
    </>
  )
}
