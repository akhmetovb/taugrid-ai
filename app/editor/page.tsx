import { auth, currentUser } from '@clerk/nextjs/server'
import { getOwnedProjects, getSharedProjects } from '@/lib/project-data'
import { EditorHomeClient } from './editor-home-client'

export default async function EditorPage() {
  const { userId } = await auth()
  const user = await currentUser()
  const email = user?.emailAddresses[0]?.emailAddress ?? ''

  const [ownedProjects, sharedProjects] = await Promise.all([
    getOwnedProjects(userId!),
    getSharedProjects(email),
  ])

  return (
    <EditorHomeClient
      ownedProjects={ownedProjects}
      sharedProjects={sharedProjects}
    />
  )
}
