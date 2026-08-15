import { put, get } from '@vercel/blob'
import { prisma } from '@/lib/prisma'
import { getCurrentIdentity, getProjectIfAccessible } from '@/lib/project-access'
import type { NextRequest } from 'next/server'

type RouteParams = { params: Promise<{ projectId: string }> }

type CanvasPayload = { nodes: unknown[]; edges: unknown[] }

// Reject anything that isn't a canvas the loader can safely hydrate. The client
// treats `nodes`/`edges` as arrays and calls `.map()` on them, so a malformed
// (but authorized) PUT would otherwise persist data that makes every later load
// throw and fall back to an empty canvas. We validate the structural shape each
// element needs for React Flow — not the full domain schema — so the stored blob
// is always safe to load.
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isValidNode(node: unknown): boolean {
  if (!isRecord(node)) return false
  if (typeof node.id !== 'string' || node.id === '') return false
  const pos = node.position
  return isRecord(pos) && typeof pos.x === 'number' && typeof pos.y === 'number'
}

function isValidEdge(edge: unknown): boolean {
  if (!isRecord(edge)) return false
  return (
    typeof edge.id === 'string' && edge.id !== '' &&
    typeof edge.source === 'string' &&
    typeof edge.target === 'string'
  )
}

function parseCanvasPayload(body: unknown): CanvasPayload | null {
  if (!isRecord(body)) return null
  const { nodes, edges } = body
  if (!Array.isArray(nodes) || !Array.isArray(edges)) return null
  if (!nodes.every(isValidNode) || !edges.every(isValidEdge)) return null
  return { nodes, edges }
}

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
  const canvas = parseCanvasPayload(body)
  if (!canvas) {
    return Response.json({ error: 'Invalid canvas payload' }, { status: 400 })
  }

  const blob = await put(`canvas/${projectId}.json`, JSON.stringify(canvas), {
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
