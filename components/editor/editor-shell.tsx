"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { ProjectSidebar } from "./project-sidebar"
import { CreateProjectDialog } from "./create-project-dialog"
import { RenameProjectDialog } from "./rename-project-dialog"
import { DeleteProjectDialog } from "./delete-project-dialog"
import { SidebarContext } from "./sidebar-context"
import { useProjectActions } from "@/hooks/use-project-actions"
import type { SidebarProject } from "@/lib/project-data"

interface EditorShellProps {
  initialOwnedProjects: SidebarProject[]
  initialSharedProjects: SidebarProject[]
  children: React.ReactNode
}

const POLL_INTERVAL_MS = 60_000

export function EditorShell({ initialOwnedProjects, initialSharedProjects, children }: EditorShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [ownedProjects, setOwnedProjects] = useState<SidebarProject[]>(initialOwnedProjects)
  const [sharedProjects] = useState<SidebarProject[]>(initialSharedProjects)

  const pathname = usePathname()
  const segments = pathname.split("/")
  const activeRoomId = segments.length >= 3 && segments[2] ? segments[2] : undefined

  useEffect(() => {
    if (window.matchMedia("(min-width: 768px)").matches) {
      setSidebarOpen(true)
    }
  }, [])

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | undefined

    async function refreshOwned() {
      if (document.hidden) return
      try {
        const res = await fetch('/api/projects/sidebar')
        if (!res.ok) return
        const data = await res.json() as { owned: SidebarProject[] }
        setOwnedProjects(data.owned)
      } catch {
        // network error — skip this tick
      }
    }

    function startInterval() {
      intervalId = setInterval(refreshOwned, POLL_INTERVAL_MS)
    }

    function stopInterval() {
      if (intervalId !== undefined) {
        clearInterval(intervalId)
        intervalId = undefined
      }
    }

    function onVisibilityChange() {
      if (document.visibilityState === "visible") {
        refreshOwned()
        startInterval()
      } else {
        stopInterval()
      }
    }

    document.addEventListener("visibilitychange", onVisibilityChange)

    // Jitter the first interval start to avoid synchronized thundering-herd refreshes
    const jitter = Math.random() * POLL_INTERVAL_MS
    const jitterId = setTimeout(startInterval, jitter)

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange)
      clearTimeout(jitterId)
      stopInterval()
    }
  }, [])

  const {
    dialogState,
    formName,
    setFormName,
    roomId: newRoomId,
    isLoading,
    openCreate,
    openRename,
    openDelete,
    closeDialog,
    handleCreate,
    handleRename,
    handleDelete,
  } = useProjectActions({
    activeProjectId: activeRoomId,
    onProjectCreated: (project) => setOwnedProjects((prev) => [project, ...prev]),
    onProjectDeleted: (projectId) => setOwnedProjects((prev) => prev.filter((p) => p.id !== projectId)),
    onProjectRenamed: (projectId, newName) =>
      setOwnedProjects((prev) => prev.map((p) => (p.id === projectId ? { ...p, name: newName } : p))),
  })

  return (
    <SidebarContext.Provider
      value={{
        sidebarOpen,
        toggleSidebar: () => setSidebarOpen((v) => !v),
        closeSidebar: () => setSidebarOpen(false),
        openCreate,
      }}
    >
      <div className="h-screen bg-base overflow-hidden">
        <ProjectSidebar
          isOpen={sidebarOpen}
          activeRoomId={activeRoomId}
          ownedProjects={ownedProjects}
          sharedProjects={sharedProjects}
          onClose={() => setSidebarOpen(false)}
          onOpenCreate={openCreate}
          onOpenRename={openRename}
          onOpenDelete={openDelete}
        />

        {children}

        <CreateProjectDialog
          open={dialogState.type === "create"}
          formName={formName}
          roomId={newRoomId}
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
    </SidebarContext.Provider>
  )
}
