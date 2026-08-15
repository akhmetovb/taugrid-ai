"use client"

import { useOthersConnectionIds, useOther } from '@liveblocks/react/suspense'
import { useViewport } from '@xyflow/react'

function Cursor({ connectionId }: { connectionId: number }) {
  const { cursor, name, color } = useOther(connectionId, (o) => ({
    cursor: o.presence.cursor,
    name:   o.info?.name  ?? '',
    color:  o.info?.color ?? '#808090',
  }))

  const { x: panX, y: panY, zoom } = useViewport()

  if (!cursor) return null

  const sx = cursor.x * zoom + panX
  const sy = cursor.y * zoom + panY

  return (
    <div
      className="absolute top-0 left-0 pointer-events-none select-none"
      style={{ transform: `translate(${sx}px, ${sy}px)` }}
    >
      <svg
        width="14"
        height="19"
        viewBox="0 0 14 19"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0 0L0 15L4 11.5L6.5 18L9 17L6.5 10.5L11 10.5Z"
          fill={color}
          stroke="white"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
      {name && (
        <div
          className="absolute top-4 left-2.5 px-2 py-0.5 rounded-md text-[11px] font-semibold text-white whitespace-nowrap leading-tight"
          style={{ backgroundColor: color }}
        >
          {name}
        </div>
      )}
    </div>
  )
}

export function PresenceCursors() {
  const connectionIds = useOthersConnectionIds()

  if (connectionIds.length === 0) return null

  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 10 }}
    >
      {connectionIds.map((id) => (
        <Cursor key={id} connectionId={id} />
      ))}
    </div>
  )
}
