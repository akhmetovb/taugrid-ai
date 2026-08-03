"use client"

import { useState } from 'react'
import { Icon } from '@iconify/react'
import {
  ENERGY_COMPONENTS,
  GROUP_COLORS,
  type ComponentGroup,
  type EnergyComponentDef,
} from '@/types/canvas'

interface GroupDef {
  group: ComponentGroup
  label: string
  icon: string
}

interface FloatingPanelProps {
  onInsert?: (component: EnergyComponentDef) => void
}

const GROUPS: GroupDef[] = [
  { group: 'generation', label: 'Generation', icon: 'tabler:bolt'             },
  { group: 'storage',    label: 'Storage',    icon: 'tabler:battery-charging' },
  { group: 'grid',       label: 'Grid',       icon: 'tabler:topology-star'    },
  { group: 'load',       label: 'Load',       icon: 'tabler:plug'             },
  { group: 'control',    label: 'Control',    icon: 'tabler:cpu'              },
]

function startDrag(e: React.DragEvent, component: EnergyComponentDef) {
  e.dataTransfer.setData('application/json', JSON.stringify({ componentType: component.type }))
  e.dataTransfer.effectAllowed = 'copy'
}

export function FloatingPanel({ onInsert }: FloatingPanelProps) {
  const [activeGroup, setActiveGroup] = useState<ComponentGroup | null>(null)

  const expanded       = activeGroup !== null
  const groupComponents = expanded
    ? ENERGY_COMPONENTS.filter((c) => c.group === activeGroup)
    : []

  return (
    <div
      className="flex items-center gap-1 rounded-full border border-surface-border bg-elevated px-3 py-2 shadow-lg"
      style={{ userSelect: 'none' }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {!expanded ? (
        GROUPS.map(({ group, label, icon }) => {
          const colors = GROUP_COLORS[group]
          return (
            <button
              key={group}
              onClick={() => setActiveGroup(group)}
              title={label}
              className="flex flex-col items-center gap-0.5 rounded-xl px-2.5 py-1.5 transition-colors hover:bg-subtle"
              style={{ minWidth: 52 }}
            >
              <Icon icon={icon} width={18} height={18} style={{ color: colors.text }} />
              <span className="text-[10px] font-medium text-copy-muted leading-none">
                {label}
              </span>
            </button>
          )
        })
      ) : (
        <>
          <button
            onClick={() => setActiveGroup(null)}
            title="Back"
            className="flex items-center justify-center rounded-xl p-1.5 transition-colors hover:bg-subtle text-copy-muted hover:text-copy-primary"
          >
            <Icon icon="tabler:arrow-left" width={16} height={16} />
          </button>

          <div className="h-5 w-px bg-surface-border mx-1" />

          {groupComponents.map((component) => {
            const colors = GROUP_COLORS[component.group]
            return (
              <button
                key={component.type}
                type="button"
                draggable
                onDragStart={(e) => startDrag(e, component)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onInsert?.(component)
                  }
                }}
                title={component.label}
                className="flex items-center justify-center rounded-xl p-1.5 cursor-grab transition-colors hover:bg-subtle active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Icon
                  icon={component.icon}
                  width={18}
                  height={18}
                  style={{ color: colors.text }}
                />
              </button>
            )
          })}
        </>
      )}
    </div>
  )
}
