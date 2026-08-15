import type { Node, Edge } from '@xyflow/react'

// ─── parameter types ───────────────────────────────────────────────────────────

export type ParameterStatus = 'ai-estimated' | 'confirmed' | 'missing'

export interface ParameterValue {
  value: string | null
  status: ParameterStatus
  aiValue: string | null
}

export type ComponentParameters = Record<string, ParameterValue>

export interface ParameterDef {
  key: string
  label: string
  unit?: string
  required: boolean
  inputType: 'number' | 'text' | 'select'
  options?: string[]
}

export const PARAMETER_SCHEMAS: Record<string, ParameterDef[]> = {
  'utility-scale-generator': [
    { key: 'ratedCapacity',  label: 'Rated Capacity',      unit: 'MW',  required: true,  inputType: 'number' },
    { key: 'fuelType',       label: 'Fuel Type',                         required: true,  inputType: 'select', options: ['Natural Gas', 'Coal', 'Nuclear', 'Diesel', 'Biogas'] },
    { key: 'voltage',        label: 'Output Voltage',      unit: 'kV',  required: true,  inputType: 'number' },
    { key: 'efficiency',     label: 'Thermal Efficiency',  unit: '%',   required: false, inputType: 'number' },
  ],
  'solar-pv-array': [
    { key: 'ratedCapacity',  label: 'Rated Capacity',    unit: 'kWp', required: true,  inputType: 'number' },
    { key: 'tilt',           label: 'Tilt Angle',        unit: '°',   required: false, inputType: 'number' },
    { key: 'azimuth',        label: 'Azimuth',           unit: '°',   required: false, inputType: 'number' },
    { key: 'inverterRating', label: 'Inverter Rating',   unit: 'kW',  required: true,  inputType: 'number' },
    { key: 'trackingType',   label: 'Tracking Type',                  required: false, inputType: 'select', options: ['Fixed', 'Single-Axis', 'Dual-Axis'] },
    { key: 'location',       label: 'Location',                       required: false, inputType: 'text' },
  ],
  'wind-turbine': [
    { key: 'ratedCapacity',  label: 'Rated Capacity',     unit: 'MW',  required: true,  inputType: 'number' },
    { key: 'hubHeight',      label: 'Hub Height',         unit: 'm',   required: false, inputType: 'number' },
    { key: 'rotorDiameter',  label: 'Rotor Diameter',     unit: 'm',   required: false, inputType: 'number' },
    { key: 'cutInSpeed',     label: 'Cut-In Speed',       unit: 'm/s', required: false, inputType: 'number' },
    { key: 'ratedWindSpeed', label: 'Rated Wind Speed',   unit: 'm/s', required: false, inputType: 'number' },
  ],
  'hydro-generator': [
    { key: 'ratedCapacity',  label: 'Rated Capacity',         unit: 'MW',   required: true,  inputType: 'number' },
    { key: 'head',           label: 'Net Head',               unit: 'm',    required: true,  inputType: 'number' },
    { key: 'flowRate',       label: 'Design Flow Rate',       unit: 'm³/s', required: false, inputType: 'number' },
    { key: 'efficiency',     label: 'Turbine Efficiency',     unit: '%',    required: false, inputType: 'number' },
  ],
  'backup-generator': [
    { key: 'ratedCapacity',  label: 'Rated Capacity',  unit: 'kW', required: true,  inputType: 'number' },
    { key: 'fuelType',       label: 'Fuel Type',                   required: true,  inputType: 'select', options: ['Diesel', 'Natural Gas', 'Propane', 'Biogas'] },
    { key: 'runtime',        label: 'Tank Runtime',    unit: 'h',  required: false, inputType: 'number' },
    { key: 'voltage',        label: 'Output Voltage',  unit: 'V',  required: false, inputType: 'number' },
  ],
  'battery-storage': [
    { key: 'powerRating',    label: 'Power Rating',           unit: 'kW',  required: true,  inputType: 'number' },
    { key: 'energyCapacity', label: 'Energy Capacity',        unit: 'kWh', required: true,  inputType: 'number' },
    { key: 'efficiency',     label: 'Round-Trip Efficiency',  unit: '%',   required: true,  inputType: 'number' },
    { key: 'socMin',         label: 'SoC Minimum',            unit: '%',   required: false, inputType: 'number' },
    { key: 'socMax',         label: 'SoC Maximum',            unit: '%',   required: false, inputType: 'number' },
  ],
  'pumped-hydro-storage': [
    { key: 'powerRating',    label: 'Power Rating',          unit: 'MW',  required: true,  inputType: 'number' },
    { key: 'energyCapacity', label: 'Energy Capacity',       unit: 'MWh', required: true,  inputType: 'number' },
    { key: 'efficiency',     label: 'Round-Trip Efficiency', unit: '%',   required: false, inputType: 'number' },
    { key: 'upperReservoir', label: 'Upper Reservoir Vol.',  unit: 'ML',  required: false, inputType: 'number' },
  ],
  'substation': [
    { key: 'voltageHigh',    label: 'High Voltage',    unit: 'kV',  required: true,  inputType: 'number' },
    { key: 'voltageLow',     label: 'Low Voltage',     unit: 'kV',  required: true,  inputType: 'number' },
    { key: 'capacity',       label: 'Rated Capacity',  unit: 'MVA', required: true,  inputType: 'number' },
    { key: 'configuration',  label: 'Bus Configuration',             required: false, inputType: 'select', options: ['Single Bus', 'Double Bus', 'Ring Bus', 'Breaker-and-a-Half'] },
  ],
  'transformer': [
    { key: 'voltageHigh', label: 'Primary Voltage',    unit: 'kV',  required: true,  inputType: 'number' },
    { key: 'voltageLow',  label: 'Secondary Voltage',  unit: 'kV',  required: true,  inputType: 'number' },
    { key: 'ratedPower',  label: 'Rated Power',        unit: 'kVA', required: true,  inputType: 'number' },
    { key: 'impedance',   label: 'Impedance',          unit: '%',   required: false, inputType: 'number' },
  ],
  'circuit-breaker': [
    { key: 'ratedVoltage',           label: 'Rated Voltage',         unit: 'kV', required: true,  inputType: 'number' },
    { key: 'ratedCurrent',           label: 'Rated Current',         unit: 'A',  required: true,  inputType: 'number' },
    { key: 'interruptingCapacity',   label: 'Interrupting Capacity', unit: 'kA', required: false, inputType: 'number' },
  ],
  'recloser': [
    { key: 'ratedVoltage',    label: 'Rated Voltage',           unit: 'kV', required: true,  inputType: 'number' },
    { key: 'ratedCurrent',    label: 'Rated Current',           unit: 'A',  required: true,  inputType: 'number' },
    { key: 'operationsCount', label: 'Operations Before Lockout',           required: false, inputType: 'number' },
  ],
  'poi-grid-tie': [
    { key: 'connectionVoltage', label: 'Connection Voltage',  unit: 'kV',  required: true,  inputType: 'number' },
    { key: 'ratedPower',        label: 'Rated Power',         unit: 'MVA', required: true,  inputType: 'number' },
    { key: 'meteringType',      label: 'Metering Type',                    required: false, inputType: 'select', options: ['Net Metering', 'Gross Metering', 'Net Feed-in'] },
  ],
  'microgrid-controller': [
    { key: 'controlMode',            label: 'Control Mode',            required: true,  inputType: 'select', options: ['Grid-Tied', 'Islanded', 'Seamless Transition'] },
    { key: 'responseTime',           label: 'Response Time',  unit: 'ms', required: false, inputType: 'number' },
    { key: 'communicationProtocol',  label: 'Communication Protocol',  required: false, inputType: 'select', options: ['DNP3', 'IEC 61850', 'Modbus TCP', 'SunSpec'] },
  ],
  'residential-load': [
    { key: 'peakDemand',    label: 'Peak Demand',      unit: 'kW',    required: true,  inputType: 'number' },
    { key: 'annualEnergy',  label: 'Annual Energy',    unit: 'kWh',   required: false, inputType: 'number' },
    { key: 'units',         label: 'Occupancy Units',               required: false, inputType: 'number' },
    { key: 'powerFactor',   label: 'Power Factor',                  required: false, inputType: 'number' },
  ],
  'commercial-load': [
    { key: 'peakDemand',      label: 'Peak Demand',     unit: 'kW',     required: true,  inputType: 'number' },
    { key: 'annualEnergy',    label: 'Annual Energy',   unit: 'kWh',    required: false, inputType: 'number' },
    { key: 'operatingHours',  label: 'Operating Hours', unit: 'h/day',  required: false, inputType: 'number' },
    { key: 'powerFactor',     label: 'Power Factor',                    required: false, inputType: 'number' },
  ],
  'industrial-load': [
    { key: 'peakDemand',    label: 'Peak Demand',    unit: 'kW',  required: true,  inputType: 'number' },
    { key: 'annualEnergy',  label: 'Annual Energy',  unit: 'MWh', required: false, inputType: 'number' },
    { key: 'voltageLevel',  label: 'Voltage Level',  unit: 'kV',  required: false, inputType: 'number' },
    { key: 'loadType',      label: 'Load Type',                   required: false, inputType: 'select', options: ['Continuous', 'Intermittent', 'Cyclic'] },
  ],
  'ev-charging-station': [
    { key: 'chargerType',    label: 'Charger Type',      required: true,  inputType: 'select', options: ['Level 1 (AC)', 'Level 2 (AC)', 'DC Fast Charge'] },
    { key: 'powerPerPort',   label: 'Power per Port',  unit: 'kW', required: true,  inputType: 'number' },
    { key: 'numberOfPorts',  label: 'Number of Ports',             required: true,  inputType: 'number' },
  ],
  'smart-meter': [
    { key: 'measurementClass',       label: 'Measurement Class',       required: false, inputType: 'select', options: ['0.2S', '0.5S', '1', '2'] },
    { key: 'communicationProtocol',  label: 'Communication Protocol',  required: false, inputType: 'select', options: ['Zigbee', 'Wi-Fi', 'PLC', 'RF Mesh', 'NB-IoT'] },
    { key: 'dataInterval',           label: 'Data Interval',  unit: 'min', required: false, inputType: 'number' },
  ],
  'scada-node': [
    { key: 'protocol',         label: 'Protocol',         required: true,  inputType: 'select', options: ['DNP3', 'IEC 61850', 'Modbus RTU', 'Modbus TCP', 'IEC 60870-5'] },
    { key: 'scanRate',         label: 'Scan Rate',  unit: 's', required: false, inputType: 'number' },
    { key: 'monitoredPoints',  label: 'Monitored Points',  required: false, inputType: 'number' },
  ],
}

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
  parametersJson?: string
}

export interface CanvasEdgeData extends Record<string, unknown> {
  label?: string
}

export type CanvasNode = Node<CanvasNodeData, 'canvasNode'>
export type CanvasEdge = Edge<CanvasEdgeData, 'canvasEdge'>
