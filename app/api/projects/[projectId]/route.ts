import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import type { NextRequest } from 'next/server'

type RouteParams = { params: Promise<{ projectId: string }> }

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { userId } = await auth()
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { projectId } = await params

  const project = await prisma.project.findUnique({ where: { id: projectId } })
  if (!project) {
    return Response.json({ error: 'Not found' }, { status: 404 })
  }
  if (project.ownerId !== userId) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body: unknown = await request.json().catch(() => ({}))
  const rawName = body !== null && typeof body === 'object' && 'name' in body ? (body as { name: unknown }).name : undefined
  const name = typeof rawName === 'string' && rawName.trim() ? rawName.trim() : undefined

  if (!name) {
    return Response.json({ error: 'Name is required' }, { status: 400 })
  }

  const updated = await prisma.project.update({
    where: { id: projectId },
    data: { name },
  })

  return Response.json(updated)
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { userId } = await auth()
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { projectId } = await params

  const project = await prisma.project.findUnique({ where: { id: projectId } })
  if (!project) {
    return Response.json({ error: 'Not found' }, { status: 404 })
  }
  if (project.ownerId !== userId) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  await prisma.project.delete({ where: { id: projectId } })

  return new Response(null, { status: 204 })
}
