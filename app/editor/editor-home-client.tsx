"use client"

import { useState, useEffect } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EditorNavbar } from "@/components/editor/editor-navbar"
import { ProjectSidebar } from "@/components/editor/project-sidebar"
import { CreateProjectDialog } from "@/components/editor/create-project-dialog"
import { RenameProjectDialog } from "@/components/editor/rename-project-dialog"
import { DeleteProjectDialog } from "@/components/editor/delete-project-dialog"
import { useProjectActions } from "@/hooks/use-project-actions"
import type { SidebarProject } from "@/lib/project-data"

interface EditorHomeClientProps {
  ownedProjects: SidebarProject[]
  sharedProjects: SidebarProject[]
}

export function EditorHomeClient({ ownedProjects, sharedProjects }: EditorHomeClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (window.matchMedia("(min-width: 768px)").matches) {
      setSidebarOpen(true)
    }
  }, [])

  const {
    dialogState,
    formName,
    setFormName,
    roomId,
    isLoading,
    openCreate,
    openRename,
    openDelete,
    closeDialog,
    handleCreate,
    handleRename,
    handleDelete,
  } = useProjectActions()

  return (
    <div className="h-screen bg-base overflow-hidden">
      <EditorNavbar
        isSidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((v) => !v)}
      />
      <ProjectSidebar
        isOpen={sidebarOpen}
        ownedProjects={ownedProjects}
        sharedProjects={sharedProjects}
        onClose={() => setSidebarOpen(false)}
        onOpenCreate={openCreate}
        onOpenRename={openRename}
        onOpenDelete={openDelete}
      />
      <main className="h-full pt-12 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center px-4">
          <h1 className="text-2xl font-semibold text-copy-primary">
            Create a project or open an existing one
          </h1>
          <p className="text-copy-muted max-w-sm text-sm">
            Start a new architecture workspace, or choose a project from the
            sidebar.
          </p>
          <Button onClick={openCreate} className="gap-2 mt-2">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>
      </main>

      <CreateProjectDialog
        open={dialogState.type === "create"}
        formName={formName}
        roomId={roomId}
        isLoading={isLoading}
        onFormNameChange={setFormName}
        onClose={closeDialog}
        onCreate={handleCreate}
      />

      <RenameProjectDialog
        open={dialogState.type === "rename"}
        currentName={dialogState.project?.name ?? ""}
        formName={formName}
        isLoading={isLoading}
        onFormNameChange={setFormName}
        onClose={closeDialog}
        onRename={handleRename}
      />

      <DeleteProjectDialog
        open={dialogState.type === "delete"}
        projectName={dialogState.project?.name ?? ""}
        isLoading={isLoading}
        onClose={closeDialog}
        onDelete={handleDelete}
      />
    </div>
  )
}
