"use client"

import { useOthers, useOther, shallow } from '@liveblocks/react/suspense'
import { useUser } from '@clerk/nextjs'

const MAX_VISIBLE = 5

interface SingleAvatarProps {
  connectionId: number
}

function SingleAvatar({ connectionId }: SingleAvatarProps) {
  const { name, avatar, color } = useOther(connectionId, (o) => ({
    name:   o.info?.name   ?? '',
    avatar: o.info?.avatar ?? '',
    color:  o.info?.color  ?? '#505060',
  }))

  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0].toUpperCase())
    .join('')
    .slice(0, 2) || '?'

  return (
    <div
      title={name || 'Collaborator'}
      className="h-7 w-7 rounded-full flex items-center justify-center overflow-hidden shrink-0"
      style={{ backgroundColor: color, boxShadow: '0 0 0 2px var(--bg-surface)' }}
    >
      {avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatar} alt={name} className="w-full h-full object-cover" />
      ) : (
        <span className="text-[10px] font-semibold text-white select-none">{initials}</span>
      )}
    </div>
  )
}

// Renders only other participants — current user is represented by the
// existing Clerk UserButton already in the navbar.
export function CollaboratorAvatars() {
  const { user } = useUser()
  const currentUserId = user?.id

  const filteredIds = useOthers(
    (others) =>
      others
        .filter((o) => o.id !== currentUserId)
        .map((o) => o.connectionId),
    shallow
  )

  if (filteredIds.length === 0) return null

  const visible  = filteredIds.slice(0, MAX_VISIBLE)
  const overflow = filteredIds.length - MAX_VISIBLE

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center">
        {visible.map((id, i) => (
          <div key={id} style={i > 0 ? { marginLeft: '-6px' } : {}}>
            <SingleAvatar connectionId={id} />
          </div>
        ))}
        {overflow > 0 && (
          <div
            className="h-7 w-7 rounded-full flex items-center justify-center shrink-0 bg-elevated"
            style={{ boxShadow: '0 0 0 2px var(--bg-surface)', marginLeft: '-6px' }}
          >
            <span className="text-[10px] font-semibold text-copy-muted">+{overflow}</span>
          </div>
        )}
      </div>
      {/* Divider between collaborators and the navbar's UserButton */}
      <div className="h-4 w-px bg-surface-border" />
    </div>
  )
}
