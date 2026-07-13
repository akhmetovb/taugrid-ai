import { redirect } from "next/navigation"
import { getCurrentIdentity } from "@/lib/project-access"
import { getOwnedProjects, getSharedProjects } from "@/lib/project-data"
import { EditorShell } from "@/components/editor/editor-shell"

export default async function EditorLayout({ children }: { children: React.ReactNode }) {
  const identity = await getCurrentIdentity()
  if (!identity) redirect("/sign-in")

  const { userId, email } = identity

  const [ownedProjects, sharedProjects] = await Promise.all([
    getOwnedProjects(userId),
    getSharedProjects(email),
  ])

  return (
    <EditorShell initialOwnedProjects={ownedProjects} sharedProjects={sharedProjects}>
      {children}
    </EditorShell>
  )
}
