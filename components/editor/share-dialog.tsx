"use client"

import { useState, useEffect, useCallback } from 'react'
import { Link2, Mail, X, Check, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { CollaboratorEntry, CollaboratorsResponse } from '@/app/api/projects/[projectId]/collaborators/route'

interface ShareDialogProps {
  projectId: string
  isOwner: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
}

function getInitials(entry: CollaboratorEntry) {
  if (entry.displayName) {
    return entry.displayName
      .split(' ')
      .map((p) => p[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }
  return entry.email[0].toUpperCase()
}

interface PersonRowProps {
  entry: CollaboratorEntry
  badge?: React.ReactNode
  action?: React.ReactNode
}

function PersonRow({ entry, badge, action }: PersonRowProps) {
  return (
    <li className="flex items-center gap-2 px-2 py-2 rounded-xl hover:bg-elevated">
      <Avatar className="h-7 w-7 shrink-0">
        <AvatarImage src={entry.imageUrl ?? undefined} alt={entry.displayName ?? entry.email} />
        <AvatarFallback className="text-xs bg-subtle text-copy-muted">
          {getInitials(entry)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          {entry.displayName && (
            <p className="text-sm text-copy-primary leading-none">
              {entry.displayName}
            </p>
          )}
          {badge}
        </div>
        <p className="text-xs text-copy-muted mt-0.5">{entry.email}</p>
      </div>
      {action}
    </li>
  )
}

export function ShareDialog({ projectId, isOwner, open, onOpenChange }: ShareDialogProps) {
  const [owner, setOwner] = useState<CollaboratorEntry | null>(null)
  const [collaborators, setCollaborators] = useState<CollaboratorEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviting, setInviting] = useState(false)
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [removingEmail, setRemovingEmail] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/projects/${projectId}/collaborators`)
      if (res.ok) {
        const data: CollaboratorsResponse = await res.json()
        setOwner(data.owner)
        setCollaborators(data.collaborators)
      }
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    if (open) fetchData()
  }, [open, fetchData])

  async function handleInvite(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setInviteError(null)
    const email = inviteEmail.trim().toLowerCase()
    if (!email) return
    setInviting(true)
    try {
      const res = await fetch(`/api/projects/${projectId}/collaborators`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (res.ok) {
        setInviteEmail('')
        await fetchData()
      } else {
        const data: { error?: string } = await res.json().catch(() => ({}))
        setInviteError(data.error ?? 'Failed to invite collaborator')
      }
    } finally {
      setInviting(false)
    }
  }

  async function handleRemove(email: string) {
    setRemovingEmail(email)
    try {
      await fetch(`/api/projects/${projectId}/collaborators`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      await fetchData()
    } finally {
      setRemovingEmail(null)
    }
  }

  function handleCopyLink() {
    const url = `${window.location.origin}/editor/${projectId}`
    void navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const totalCount = 1 + collaborators.length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface border border-surface-border rounded-xl p-0 gap-0 sm:max-w-none" style={{ maxWidth: '420px' }}>

        {/* Header — matches sidebar header pattern */}
        <DialogHeader className="px-4 py-3 border-b border-surface-border">
          <DialogTitle className="text-sm font-medium text-copy-primary">Share project</DialogTitle>
          <DialogDescription className="text-xs text-copy-muted mt-0.5 leading-relaxed">
            Invite collaborators, copy the workspace link, and manage access.
          </DialogDescription>
        </DialogHeader>

        <div className="px-3 py-3 flex flex-col gap-1">

          {/* Workspace link — flat row, no nested card */}
          <div className="flex items-center justify-between gap-3 px-2 py-2.5 rounded-xl">
            <div className="min-w-0">
              <p className="text-sm text-copy-primary">Workspace link</p>
              <p className="text-xs text-copy-muted mt-0.5">Share a direct link with teammates after you grant them access.</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-7 shrink-0 gap-1.5 border-surface-border text-copy-secondary hover:text-copy-primary whitespace-nowrap px-3 text-xs"
              onClick={handleCopyLink}
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-state-success" />
                  Copied!
                </>
              ) : (
                <>
                  <Link2 className="h-3.5 w-3.5" />
                  Copy link
                </>
              )}
            </Button>
          </div>

          <div className="border-t border-surface-border mx-2 my-1" />

          {/* Invite — flat input row, no nested card */}
          {isOwner && (
            <>
              <form
                onSubmit={handleInvite}
                className="flex items-center gap-2 rounded-xl border border-surface-border px-3 h-9"
              >
                <Mail className="h-3.5 w-3.5 text-copy-faint shrink-0" />
                <input
                  type="email"
                  placeholder="teammate@company.com"
                  value={inviteEmail}
                  onChange={(e) => {
                    setInviteEmail(e.target.value)
                    setInviteError(null)
                  }}
                  disabled={inviting}
                  className="flex-1 bg-transparent text-sm text-copy-primary placeholder:text-copy-faint outline-none border-none min-w-0"
                />
                <button
                  type="submit"
                  disabled={inviting || !inviteEmail.trim()}
                  className="shrink-0 h-7 px-3 rounded-lg text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  style={{ backgroundColor: 'var(--color-brand)', color: '#000' }}
                >
                  {inviting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Invite'}
                </button>
              </form>
              {inviteError && (
                <p className="text-xs text-state-error px-2 pt-1">{inviteError}</p>
              )}
              <div className="border-t border-surface-border mx-2 my-1" />
            </>
          )}

          {/* People with access — flat rows like sidebar project rows */}
          <div className="flex items-center justify-between px-2 py-1">
            <p className="text-xs text-copy-muted">People with access</p>
            {!loading && (
              <span className="text-xs text-copy-muted">{totalCount} total</span>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-4 w-4 animate-spin text-copy-muted" />
            </div>
          ) : (
            <ul className="flex flex-col gap-0.5">
              {owner && (
                <PersonRow
                  entry={owner}
                  badge={
                    <span className="shrink-0 text-[10px] font-semibold tracking-wider uppercase border border-brand text-brand rounded-full px-2 py-0.5 leading-none">
                      Owner
                    </span>
                  }
                />
              )}
              {collaborators.map((c) => (
                <PersonRow
                  key={c.email}
                  entry={c}
                  badge={
                    <span className="shrink-0 text-[10px] font-semibold tracking-wider uppercase border border-surface-border text-copy-muted rounded-full px-2 py-0.5 leading-none">
                      Collaborator
                    </span>
                  }
                  action={
                    isOwner ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0 text-copy-faint hover:text-state-error"
                        onClick={() => handleRemove(c.email)}
                        disabled={removingEmail === c.email}
                        aria-label={`Remove ${c.email}`}
                      >
                        {removingEmail === c.email ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <X className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    ) : undefined
                  }
                />
              ))}
            </ul>
          )}

        </div>
      </DialogContent>
    </Dialog>
  )
}
