import { prisma } from './prisma'

export interface SidebarProject {
  id: string
  name: string
}

export async function getOwnedProjects(userId: string): Promise<SidebarProject[]> {
  return prisma.project.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true },
  })
}

export async function getSharedProjects(email: string): Promise<SidebarProject[]> {
  if (!email) return []
  return prisma.project.findMany({
    where: { collaborators: { some: { email } } },
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true },
  })
}
