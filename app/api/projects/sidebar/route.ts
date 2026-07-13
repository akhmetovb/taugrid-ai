import { auth } from '@clerk/nextjs/server'
import { getOwnedProjects } from '@/lib/project-data'

export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const owned = await getOwnedProjects(userId)
  return Response.json({ owned })
}
