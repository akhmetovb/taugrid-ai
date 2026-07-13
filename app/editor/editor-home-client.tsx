"use client"

import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EditorNavbar } from "@/components/editor/editor-navbar"
import { useSidebar } from "@/components/editor/sidebar-context"

export function EditorHomeClient() {
  const { sidebarOpen, toggleSidebar, openCreate } = useSidebar()

  return (
    <>
      <EditorNavbar
        isSidebarOpen={sidebarOpen}
        onToggleSidebar={toggleSidebar}
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
    </>
  )
}
