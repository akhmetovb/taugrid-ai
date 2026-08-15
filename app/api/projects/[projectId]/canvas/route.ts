import { put, get } from '@vercel/blob'
import { prisma } from '@/lib/prisma'
import { getCurrentIdentity, getProjectIfAccessible } from '@/lib/project-access'
import type { NextRequest } from 'next/server'

type RouteParams = { params: Promise<{ projectId: string }> }

// PUT — persist the latest canvas JSON to Vercel Blob, store the URL on the project.
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const identity = await getCurrentIdentity()
  if (!identity) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { projectId } = await params

  const project = await getProjectIfAccessible(projectId, identity.userId, identity.email)
  if (!project) {
    return Response.json({ error: 'Not found' }, { status: 404 })
  }

  const body: unknown = await request.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return Response.json({ error: 'Invalid canvas payload' }, { status: 400 })
  }

  const blob = await put(`canvas/${projectId}.json`, JSON.stringify(body), {
    access: 'private',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
  })

  await prisma.project.update({
    where: { id: projectId },
    data: { canvasJsonPath: blob.url },
  })

  return Response.json({ url: blob.url })
}

// GET — read the saved blob URL from Prisma and return the stored canvas JSON.
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const identity = await getCurrentIdentity()
  if (!identity) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { projectId } = await params

  const project = await getProjectIfAccessible(projectId, identity.userId, identity.email)
  if (!project) {
    return Response.json({ error: 'Not found' }, { status: 404 })
  }

  const record = await prisma.project.findUnique({
    where: { id: projectId },
    select: { canvasJsonPath: true },
  })

  if (!record?.canvasJsonPath) {
    return Response.json({ canvas: null })
  }

  // Private store: the blob URL isn't anonymously fetchable — read it through
  // the SDK, which authenticates via BLOB_READ_WRITE_TOKEN.
  const result = await get(record.canvasJsonPath, { access: 'private', useCache: false })
  if (!result?.stream) {
    return Response.json({ canvas: null })
  }

  const canvas: unknown = await new Response(result.stream).json().catch(() => null)
  return Response.json({ canvas })
}
