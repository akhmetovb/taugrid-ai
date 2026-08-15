"use client"

import { useState, useRef, useCallback, useEffect, type CSSProperties } from 'react'
import { Icon } from '@iconify/react'
import { Search, Crosshair, X, ChevronDown, Save, RotateCcw } from 'lucide-react'
import { useMutation } from '@liveblocks/react'
import {
  COMPONENT_MAP,
  GROUP_COLORS,
  PARAMETER_SCHEMAS,
  type ComponentGroup,
  type CanvasNode,
  type ComponentParameters,
  type ParameterValue,
} from '@/types/canvas'
import { cn } from '@/lib/utils'

// ─── liveblocks storage types ───────────────────────────────────────────────────

interface NodeDataLive {
  set(key: 'label' | 'fillColor' | 'textColor' | 'parametersJson', value: string): void
}
interface NodeLive        { get(key: 'data'): NodeDataLive | undefined }
interface NodesMap        { get(id: string): NodeLive | undefined }
interface FlowLive        { get(key: 'nodes'): NodesMap | undefined }
interface StorageWithFlow { get(key: 'flow'): FlowLive | undefined }

// ─── constants ──────────────────────────────────────────────────────────────────

const GROUP_ORDER: ComponentGroup[] = ['generation', 'storage', 'grid', 'load', 'control']

const GROUP_LABELS: Record<ComponentGroup, string> = {
  generation: 'Generation',
  storage:    'Storage',
  grid:       'Grid',
  load:       'Load',
  control:    'Control',
}

const GROUP_ICONS: Record<ComponentGroup, string> = {
  generation: 'tabler:bolt',
  storage:    'tabler:battery-charging',
  grid:       'tabler:topology-star',
  load:       'tabler:plug',
  control:    'tabler:cpu',
}

const BADGE_STYLES: Record<string, string> = {
  'ai-estimated': 'bg-[rgba(100,87,249,0.15)] text-ai-text',
  'confirmed':    'bg-[rgba(52,211,153,0.12)] text-state-success',
  'missing':      'bg-[rgba(255,77,79,0.12)]  text-state-error',
}

const BADGE_LABELS: Record<string, string> = {
  'ai-estimated': 'AI',
  'confirmed':    'OK',
  'missing':      '!',
}

// ─── helpers ────────────────────────────────────────────────────────────────────

function parseParams(json: string | undefined): ComponentParameters {
  if (!json) return {}
  try { return JSON.parse(json) as ComponentParameters } catch { return {} }
}

function hasMissingRequired(node: CanvasNode): boolean {
  const ct = node.data.componentType
  if (!ct) return false
  const schema = PARAMETER_SCHEMAS[ct]
  if (!schema) return false
  const required = schema.filter((p) => p.required)
  if (required.length === 0) return false
  const params = parseParams(node.data.parametersJson)
  return required.some((p) => {
    const pv = params[p.key]
    return !pv || pv.value === null || pv.value === '' || pv.status === 'missing'
  })
}

// ─── component ──────────────────────────────────────────────────────────────────

interface ComponentListProps {
  nodes: CanvasNode[]
  onLocate: (nodeId: string) => void
}

export function ComponentList({ nodes, onLocate }: ComponentListProps) {
  const energyNodes = nodes.filter((n) => n.data.componentType)

  const [expanded,        setExpanded]        = useState(false)
  const [search,          setSearch]          = useState('')
  const [pos,             setPos]             = useState<{ x: number; y: number } | null>(null)
  const [selectedNodeId,  setSelectedNodeId]  = useState<string | null>(null)
  const [draftParams,     setDraftParams]     = useState<Record<string, string>>({})
  const [size,            setSize]            = useState<{ width: number; height: number | null }>({ width: 280, height: null })

  const pillRef    = useRef<HTMLDivElement>(null)
  const dragInfo   = useRef<{ startX: number; startY: number; elemX: number; elemY: number } | null>(null)
  const resizeInfo = useRef<{ startX: number; startY: number; startW: number; startH: number } | null>(null)

  // ─── inline param-panel state ─────────────────────────────────────────────────

  const selectedNode = selectedNodeId ? (nodes.find((n) => n.id === selectedNodeId) ?? null) : null
  const ct           = selectedNode?.data.componentType ?? null
  const def          = ct ? COMPONENT_MAP[ct] : null
  const schema       = ct ? (PARAMETER_SCHEMAS[ct] ?? []) : []

  useEffect(() => {
    if (!selectedNode || !schema.length) { setDraftParams({}); return }
    const params = parseParams(selectedNode.data.parametersJson)
    const draft: Record<string, string> = {}
    schema.forEach((p) => { draft[p.key] = params[p.key]?.value ?? '' })
    setDraftParams(draft)
  }, [selectedNodeId]) // eslint-disable-line react-hooks/exhaustive-deps

  const updateParameters = useMutation(
    ({ storage }, id: string, json: string) => {
      ;(storage as unknown as StorageWithFlow)
        .get('flow')?.get('nodes')?.get(id)?.get('data')?.set('parametersJson', json)
    },
    []
  )

  const handleSave = useCallback(() => {
    if (!selectedNode || !selectedNodeId || !schema.length) return
    const current = parseParams(selectedNode.data.parametersJson)
    const next: ComponentParameters = { ...current }
    schema.forEach((p) => {
      const dv = draftParams[p.key] ?? ''
      next[p.key] = dv !== ''
        ? { value: dv, status: 'confirmed', aiValue: current[p.key]?.aiValue ?? null }
        : { value: null, status: p.required ? 'missing' : 'confirmed', aiValue: current[p.key]?.aiValue ?? null }
    })
    updateParameters(selectedNodeId, JSON.stringify(next))
  }, [selectedNode, selectedNodeId, schema, draftParams, updateParameters])

  const handleReset = useCallback(() => {
    if (!selectedNode || !selectedNodeId || !schema.length) return
    const current = parseParams(selectedNode.data.parametersJson)
    const next: ComponentParameters = {}
    const newDraft: Record<string, string> = {}
    schema.forEach((p) => {
      const ai = current[p.key]?.aiValue ?? null
      const pv: ParameterValue = {
        value:   ai,
        status:  ai !== null ? 'ai-estimated' : (p.required ? 'missing' : 'confirmed'),
        aiValue: ai,
      }
      next[p.key]     = pv
      newDraft[p.key] = ai ?? ''
    })
    updateParameters(selectedNodeId, JSON.stringify(next))
    setDraftParams(newDraft)
  }, [selectedNode, selectedNodeId, schema, updateParameters])

  function badgeFor(key: string): 'ai-estimated' | 'confirmed' | 'missing' | null {
    if (!selectedNode) return null
    const pDef        = schema.find((p) => p.key === key)
    const savedParams = parseParams(selectedNode.data.parametersJson)
    const saved       = savedParams[key]
    const isDraft     = draftParams[key] !== (saved?.value ?? '')
    if (isDraft && (draftParams[key] ?? '') !== '') return 'confirmed'
    if (!saved || saved.value === null || saved.value === '') {
      return pDef?.required ? 'missing' : null
    }
    return saved.status as 'ai-estimated' | 'confirmed' | 'missing'
  }

  // ─── drag to move ─────────────────────────────────────────────────────────────

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return
    if (!pillRef.current) return
    const rect = pillRef.current.getBoundingClientRect()
    dragInfo.current = {
      startX: e.clientX,
      startY: e.clientY,
      elemX:  rect.left,
      elemY:  rect.top - 48,
    }
    let moved = false

    function onMove(me: MouseEvent) {
      if (!dragInfo.current) return
      moved = true
      setPos({
        x: dragInfo.current.elemX + (me.clientX - dragInfo.current.startX),
        y: dragInfo.current.elemY + (me.clientY - dragInfo.current.startY),
      })
    }
    function onUp() {
      dragInfo.current = null
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      if (!moved && !expanded) setExpanded(true)
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
    e.preventDefault()
  }, [expanded])

  // ─── resize from bottom-right (dx*2 for symmetric growth via centering) ───────

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!pillRef.current) return
    const rect = pillRef.current.getBoundingClientRect()
    resizeInfo.current = { startX: e.clientX, startY: e.clientY, startW: rect.width, startH: rect.height }

    function onMove(me: MouseEvent) {
      if (!resizeInfo.current) return
      const dx = me.clientX - resizeInfo.current.startX
      const dy = me.clientY - resizeInfo.current.startY
      setSize({
        width:  Math.max(240, Math.min(560, resizeInfo.current.startW + dx * 2)),
        height: Math.max(200, Math.min(700, resizeInfo.current.startH + dy)),
      })
    }
    function onUp() {
      resizeInfo.current = null
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }, [])

  // ─── render ───────────────────────────────────────────────────────────────────

  if (energyNodes.length === 0) return null

  const lowerSearch = search.toLowerCase()
  const filtered    = energyNodes.filter((n) => {
    if (!lowerSearch) return true
    return (
      n.data.label.toLowerCase().includes(lowerSearch) ||
      (n.data.componentType ?? '').toLowerCase().includes(lowerSearch)
    )
  })
  const grouped = GROUP_ORDER
    .map((group) => ({ group, items: filtered.filter((n) => n.data.group === group) }))
    .filter((g) => g.items.length > 0)

  const containerStyle: CSSProperties = pos
    ? { position: 'absolute', left: pos.x, top: pos.y }
    : { position: 'absolute', left: '50%', top: 12, transform: 'translateX(-50%)' }

  return (
    <div ref={pillRef} style={{ ...containerStyle, zIndex: 20, userSelect: 'none' }}>
      {!expanded ? (
        <div
          className="flex items-center gap-2 rounded-full border border-surface-border bg-elevated px-3 py-1.5 shadow-lg cursor-pointer hover:bg-subtle transition-colors"
          style={{ whiteSpace: 'nowrap' }}
          onMouseDown={handleMouseDown}
          onClick={() => setExpanded(true)}
        >
          <span className="text-xs font-medium text-copy-primary">
            Components ({energyNodes.length})
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-copy-muted" />
        </div>
      ) : (
        <div
          className="rounded-2xl border border-surface-border bg-elevated shadow-lg flex flex-col overflow-hidden relative"
          style={{
            width: size.width,
            ...(size.height !== null ? { height: size.height } : {}),
          }}
        >
          {/* Header — drag handle */}
          <div
            className="flex items-center justify-between px-3 py-2.5 border-b border-surface-border cursor-grab active:cursor-grabbing shrink-0"
            onMouseDown={handleMouseDown}
          >
            <span className="text-xs font-semibold text-copy-primary">
              Components ({energyNodes.length})
            </span>
            <button
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => { setExpanded(false); setSelectedNodeId(null) }}
              className="flex items-center justify-center rounded-lg p-0.5 text-copy-muted hover:text-copy-primary hover:bg-subtle transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Search */}
          <div className="px-3 pt-2 pb-1.5 shrink-0">
            <div className="flex items-center gap-2 rounded-xl bg-subtle border border-surface-border px-2.5 py-1.5">
              <Search className="h-3.5 w-3.5 text-copy-faint shrink-0" />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent text-xs text-copy-primary placeholder:text-copy-faint outline-none"
                onMouseDown={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          {/* Node list — capped so param section is always visible below */}
          <div className="overflow-y-auto max-h-[200px] shrink-0">
            {grouped.length === 0 ? (
              <p className="px-3 py-4 text-xs text-copy-muted text-center">No results</p>
            ) : (
              grouped.map(({ group, items }) => {
                const colors = GROUP_COLORS[group]
                return (
                  <div key={group}>
                    <div className="px-3 pt-2 pb-1 flex items-center gap-1.5">
                      <Icon
                        icon={GROUP_ICONS[group]}
                        width={11}
                        height={11}
                        style={{ color: colors.text, flexShrink: 0 }}
                      />
                      <span
                        className="text-[10px] font-semibold tracking-wider uppercase"
                        style={{ color: colors.text }}
                      >
                        {GROUP_LABELS[group]}
                      </span>
                    </div>
                    {items.map((node) => {
                      const nodeDef    = node.data.componentType ? COMPONENT_MAP[node.data.componentType] : null
                      const missing    = hasMissingRequired(node)
                      const isSelected = node.id === selectedNodeId
                      return (
                        <div
                          key={node.id}
                          className={cn(
                            "flex items-center gap-2 px-3 py-1.5 transition-colors cursor-pointer group",
                            isSelected ? "bg-subtle" : "hover:bg-subtle"
                          )}
                          onClick={() => setSelectedNodeId(isSelected ? null : node.id)}
                        >
                          {nodeDef && (
                            <Icon
                              icon={nodeDef.icon}
                              width={14}
                              height={14}
                              style={{ color: colors.text, flexShrink: 0 }}
                            />
                          )}
                          <span className="flex-1 text-xs text-copy-primary truncate min-w-0">
                            {node.data.label}
                          </span>
                          {missing && (
                            <span
                              className="h-1.5 w-1.5 rounded-full shrink-0"
                              style={{ background: 'var(--state-error)' }}
                              title="Missing required parameters"
                            />
                          )}
                          <button
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={(e) => { e.stopPropagation(); onLocate(node.id) }}
                            className="opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-lg p-0.5 text-copy-muted hover:text-copy-primary hover:bg-elevated transition-all"
                            title="Locate on canvas"
                          >
                            <Crosshair className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )
              })
            )}
          </div>

          {/* Inline parameter section — expands below the list */}
          {selectedNode && (
            <>
              <div className="border-t border-surface-border shrink-0" />

              {/* Param header */}
              <div className="flex items-center justify-between px-3 py-2 shrink-0">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-copy-primary truncate">
                    {def?.label ?? 'Component'}
                  </p>
                  <p className="text-[10px] text-copy-muted truncate">{selectedNode.data.label}</p>
                </div>
                <button
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={() => setSelectedNodeId(null)}
                  className="ml-2 shrink-0 flex items-center justify-center rounded-lg p-1 text-copy-muted hover:text-copy-primary hover:bg-subtle transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Fields */}
              <div className="px-3 pb-1 space-y-2.5 overflow-y-auto max-h-[280px]">
                {schema.length === 0 ? (
                  <p className="text-xs text-copy-muted">No parameters defined for this component type.</p>
                ) : (
                  schema.map((pDef) => {
                    const badge = badgeFor(pDef.key)
                    const value = draftParams[pDef.key] ?? ''
                    return (
                      <div key={pDef.key}>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[11px] font-medium text-copy-secondary">
                            {pDef.label}
                            {pDef.unit && (
                              <span className="ml-1 text-copy-faint font-normal">({pDef.unit})</span>
                            )}
                            {pDef.required && (
                              <span className="ml-1 text-state-error">*</span>
                            )}
                          </label>
                          {badge && (
                            <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded-md', BADGE_STYLES[badge])}>
                              {BADGE_LABELS[badge]}
                            </span>
                          )}
                        </div>
                        {pDef.inputType === 'select' ? (
                          <select
                            value={value}
                            onChange={(e) => setDraftParams((prev) => ({ ...prev, [pDef.key]: e.target.value }))}
                            onMouseDown={(e) => e.stopPropagation()}
                            className="w-full rounded-xl bg-elevated border border-surface-border px-2.5 py-1.5 text-xs text-copy-primary outline-none focus:border-brand transition-colors"
                          >
                            <option value="">— select —</option>
                            {pDef.options?.map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={pDef.inputType === 'number' ? 'number' : 'text'}
                            value={value}
                            onChange={(e) => setDraftParams((prev) => ({ ...prev, [pDef.key]: e.target.value }))}
                            onMouseDown={(e) => e.stopPropagation()}
                            placeholder={pDef.required ? 'Required' : 'Optional'}
                            className="w-full rounded-xl bg-elevated border border-surface-border px-2.5 py-1.5 text-xs text-copy-primary placeholder:text-copy-faint outline-none focus:border-brand transition-colors"
                          />
                        )}
                      </div>
                    )
                  })
                )}
              </div>

              {/* Actions */}
              <div className="px-3 py-2.5 border-t border-surface-border flex gap-2 shrink-0">
                <button
                  onClick={handleReset}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="flex items-center gap-1.5 rounded-xl border border-surface-border px-3 py-1.5 text-xs text-copy-muted hover:text-copy-primary hover:bg-elevated transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset to AI values
                </button>
                <button
                  onClick={handleSave}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-brand px-3 py-1.5 text-xs font-medium text-base hover:opacity-90 transition-opacity"
                >
                  <Save className="h-3.5 w-3.5" />
                  Save
                </button>
              </div>
            </>
          )}

          {/* Resize handle — bottom-right corner, grows symmetrically due to centering */}
          <div
            className="absolute bottom-0 right-0 w-5 h-5 cursor-se-resize flex items-end justify-end p-1"
            onMouseDown={handleResizeStart}
          >
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
              <circle cx="6.5" cy="6.5" r="1" fill="var(--text-faint)" />
              <circle cx="3.5" cy="6.5" r="1" fill="var(--text-faint)" />
              <circle cx="6.5" cy="3.5" r="1" fill="var(--text-faint)" />
            </svg>
          </div>
        </div>
      )}
    </div>
  )
}
