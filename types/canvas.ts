import type { Node, Edge } from '@xyflow/react'

export type ComponentGroup = 'generation' | 'storage' | 'grid' | 'load' | 'control'

export interface GroupColor {
  fill: string
  text: string
}

export interface NodeColorPair {
  fill: string
  text: string
}

export const NODE_COLORS: NodeColorPair[] = [
  { fill: '#1F1F1F', text: '#EDEDED' },
  { fill: '#10233D', text: '#52A8FF' },
  { fill: '#2E1938', text: '#BF7AF0' },
  { fill: '#331B00', text: '#FF990A' },
  { fill: '#3C1618', text: '#FF6166' },
  { fill: '#3A1726', text: '#F75F8F' },
  { fill: '#0F2E18', text: '#62C073' },
  { fill: '#062822', text: '#0AC7B4' },
]

export const GROUP_COLORS: Record<ComponentGroup, GroupColor> = {
  generation: { fill: '#0F2E18', text: '#62C073' },
  storage:    { fill: '#10233D', text: '#52A8FF' },
  grid:       { fill: '#062822', text: '#0AC7B4' },
  load:       { fill: '#331B00', text: '#FF990A' },
  control:    { fill: '#2E1938', text: '#BF7AF0' },
}

export interface EnergyComponentDef {
  type: string
  label: string
  icon: string
  group: ComponentGroup
  defaultWidth: number
  defaultHeight: number
}

const M = { w: 120, h: 80 }
const S = { w: 80,  h: 60 }

export const ENERGY_COMPONENTS: EnergyComponentDef[] = [
  // Generation
  { type: 'utility-scale-generator', label: 'Utility-Scale Generator', icon: 'tabler:building-factory-2', group: 'generation', defaultWidth: M.w, defaultHeight: M.h },
  { type: 'solar-pv-array',          label: 'Solar PV Array',           icon: 'tabler:solar-panel',         group: 'generation', defaultWidth: M.w, defaultHeight: M.h },
  { type: 'wind-turbine',            label: 'Wind Turbine',             icon: 'tabler:wind',                group: 'generation', defaultWidth: M.w, defaultHeight: M.h },
  { type: 'hydro-generator',         label: 'Hydro Generator',          icon: 'tabler:droplet',             group: 'generation', defaultWidth: M.w, defaultHeight: M.h },
  { type: 'backup-generator',        label: 'Backup Generator',         icon: 'tabler:bolt',                group: 'generation', defaultWidth: M.w, defaultHeight: M.h }, // TODO: replace with dedicated icon
  // Storage
  { type: 'battery-storage',         label: 'Battery Storage (BESS)',   icon: 'tabler:battery-charging',    group: 'storage',    defaultWidth: M.w, defaultHeight: M.h },
  { type: 'pumped-hydro-storage',    label: 'Pumped Hydro Storage',     icon: 'tabler:ripple',              group: 'storage',    defaultWidth: M.w, defaultHeight: M.h }, // TODO: replace with dedicated icon
  // Grid
  { type: 'substation',              label: 'Substation',               icon: 'tabler:building',            group: 'grid',       defaultWidth: M.w, defaultHeight: M.h }, // TODO: replace with dedicated icon
  { type: 'transformer',             label: 'Transformer',              icon: 'tabler:arrows-exchange',     group: 'grid',       defaultWidth: M.w, defaultHeight: M.h }, // TODO: replace with dedicated icon
  { type: 'circuit-breaker',         label: 'Circuit Breaker',          icon: 'tabler:toggle-left',         group: 'grid',       defaultWidth: M.w, defaultHeight: M.h }, // TODO: replace with dedicated icon
  { type: 'recloser',                label: 'Recloser',                 icon: 'tabler:refresh',             group: 'grid',       defaultWidth: M.w, defaultHeight: M.h }, // TODO: replace with dedicated icon
  { type: 'poi-grid-tie',            label: 'POI / Grid Tie',           icon: 'tabler:plug-connected',      group: 'grid',       defaultWidth: M.w, defaultHeight: M.h },
  { type: 'microgrid-controller',    label: 'Microgrid Controller',     icon: 'tabler:cpu',                 group: 'grid',       defaultWidth: M.w, defaultHeight: M.h },
  // Load
  { type: 'residential-load',        label: 'Residential Load',         icon: 'tabler:home',                group: 'load',       defaultWidth: M.w, defaultHeight: M.h },
  { type: 'commercial-load',         label: 'Commercial Load',          icon: 'tabler:building-store',      group: 'load',       defaultWidth: M.w, defaultHeight: M.h },
  { type: 'industrial-load',         label: 'Industrial Load',          icon: 'tabler:building-factory',    group: 'load',       defaultWidth: M.w, defaultHeight: M.h },
  { type: 'ev-charging-station',     label: 'EV Charging Station',      icon: 'tabler:ev-station',          group: 'load',       defaultWidth: M.w, defaultHeight: M.h },
  // Control
  { type: 'smart-meter',             label: 'Smart Meter',              icon: 'tabler:device-analytics',    group: 'control',    defaultWidth: S.w, defaultHeight: S.h },
  { type: 'scada-node',              label: 'SCADA Node',               icon: 'tabler:server',              group: 'control',    defaultWidth: S.w, defaultHeight: S.h },
]

export const COMPONENT_MAP: Record<string, EnergyComponentDef> = Object.fromEntries(
  ENERGY_COMPONENTS.map((c) => [c.type, c])
)

export interface CanvasNodeData extends Record<string, unknown> {
  label: string
  color?: string
  shape?: string
  componentType?: string
  group?: ComponentGroup
  coordinates?: { lat: number; lng: number } | null
  fillColor?: string
  textColor?: string
}

export interface CanvasEdgeData extends Record<string, unknown> {
  label?: string
  bendPoints?: { x: number; y: number }[]
}

export type CanvasNode = Node<CanvasNodeData, 'canvasNode'>
export type CanvasEdge = Edge<CanvasEdgeData, 'canvasEdge'>
