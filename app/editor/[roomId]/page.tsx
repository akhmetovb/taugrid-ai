import { getProjectIfAccessible, getCurrentIdentity } from '@/lib/project-access'
import { AccessDenied } from '@/components/editor/access-denied'
import { WorkspaceClient } from './workspace-client'

type PageProps = { params: Promise<{ roomId: string }> }

export default async function WorkspacePage({ params }: PageProps) {
  const { roomId } = await params

  const identity = await getCurrentIdentity()
  if (!identity) return null

  const project = await getProjectIfAccessible(roomId, identity.userId, identity.email)

  if (!project) return <AccessDenied />

  return <WorkspaceClient roomId={roomId} projectName={project.name} isOwner={project.isOwner} />
}
