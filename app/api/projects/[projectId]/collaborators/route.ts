import { auth, currentUser, clerkClient } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import type { NextRequest } from 'next/server'

type RouteParams = { params: Promise<{ projectId: string }> }

export interface CollaboratorEntry {
  email: string
  displayName: string | null
  imageUrl: string | null
}

export interface CollaboratorsResponse {
  owner: CollaboratorEntry
  collaborators: CollaboratorEntry[]
  isOwner: boolean
}

async function enrichEmails(emails: string[]): Promise<CollaboratorEntry[]> {
  if (emails.length === 0) return []
  try {
    const client = await clerkClient()
    const { data: users } = await client.users.getUserList({ emailAddress: emails, limit: 100 })

    const byEmail = new Map(
      users.flatMap((u) =>
        u.emailAddresses.map((ea) => [
          ea.emailAddress,
          {
            displayName: [u.firstName, u.lastName].filter(Boolean).join(' ') || null,
            imageUrl: u.imageUrl ?? null,
          },
        ])
      )
    )

    return emails.map((email) => {
      const userData = byEmail.get(email)
      return { email, displayName: userData?.displayName ?? null, imageUrl: userData?.imageUrl ?? null }
    })
  } catch {
    return emails.map((email) => ({ email, displayName: null, imageUrl: null }))
  }
}

async function enrichUserId(userId: string): Promise<CollaboratorEntry> {
  try {
    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    const email = user.primaryEmailAddress?.emailAddress ?? ''
    const displayName = [user.firstName, user.lastName].filter(Boolean).join(' ') || null
    return { email, displayName, imageUrl: user.imageUrl ?? null }
  } catch {
    return { email: '', displayName: null, imageUrl: null }
  }
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { projectId } = await params
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      ownerId: true,
      collaborators: { select: { email: true }, orderBy: { createdAt: 'asc' } },
    },
  })
  if (!project) return Response.json({ error: 'Not found' }, { status: 404 })

  const isOwner = project.ownerId === userId

  if (!isOwner) {
    const user = await currentUser()
    const myEmail = user?.primaryEmailAddress?.emailAddress ?? ''
    const isCollaborator = project.collaborators.some((c: { email: string }) => c.email === myEmail)
    if (!isCollaborator) return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const emails = project.collaborators.map((c: { email: string }) => c.email)
  const [owner, collaborators] = await Promise.all([
    enrichUserId(project.ownerId),
    enrichEmails(emails),
  ])

  return Response.json({ owner, collaborators, isOwner } satisfies CollaboratorsResponse)
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { projectId } = await params
  const project = await prisma.project.findUnique({ where: { id: projectId }, select: { ownerId: true } })
  if (!project) return Response.json({ error: 'Not found' }, { status: 404 })
  if (project.ownerId !== userId) return Response.json({ error: 'Forbidden' }, { status: 403 })

  const body: unknown = await request.json().catch(() => ({}))
  const rawEmail =
    body !== null && typeof body === 'object' && 'email' in body
      ? (body as { email: unknown }).email
      : undefined
  const email = typeof rawEmail === 'string' ? rawEmail.trim().toLowerCase() : undefined
  if (!email || !email.includes('@')) {
    return Response.json({ error: 'Valid email is required' }, { status: 400 })
  }

  await prisma.projectCollaborator.upsert({
    where: { projectId_email: { projectId, email } },
    create: { projectId, email },
    update: {},
  })

  return Response.json({ ok: true }, { status: 201 })
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { projectId } = await params
  const project = await prisma.project.findUnique({ where: { id: projectId }, select: { ownerId: true } })
  if (!project) return Response.json({ error: 'Not found' }, { status: 404 })
  if (project.ownerId !== userId) return Response.json({ error: 'Forbidden' }, { status: 403 })

  const body: unknown = await request.json().catch(() => ({}))
  const rawEmail =
    body !== null && typeof body === 'object' && 'email' in body
      ? (body as { email: unknown }).email
      : undefined
  const email = typeof rawEmail === 'string' ? rawEmail.trim().toLowerCase() : undefined
  if (!email) return Response.json({ error: 'Email is required' }, { status: 400 })

  await prisma.projectCollaborator.deleteMany({ where: { projectId, email } })

  return new Response(null, { status: 204 })
}
