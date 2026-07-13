import { auth, currentUser } from '@clerk/nextjs/server'
import { prisma } from './prisma'

export interface CurrentIdentity {
  userId: string
  email: string
}

export interface AccessibleProject {
  id: string
  name: string
  isOwner: boolean
}

export async function getCurrentIdentity(): Promise<CurrentIdentity | null> {
  const { userId } = await auth()
  if (!userId) return null
  const user = await currentUser()
  const email = user?.emailAddresses[0]?.emailAddress ?? ''
  return { userId, email }
}

export async function getProjectIfAccessible(
  projectId: string,
  userId: string,
  email: string,
): Promise<AccessibleProject | null> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      name: true,
      ownerId: true,
      collaborators: { where: { email }, select: { id: true } },
    },
  })
  if (!project) return null
  const isOwner = project.ownerId === userId
  const isCollaborator = project.collaborators.length > 0
  if (!isOwner && !isCollaborator) return null
  return { id: project.id, name: project.name, isOwner }
}
