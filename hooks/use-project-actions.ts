"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import type { SidebarProject } from "@/lib/project-data"

type DialogType = "create" | "rename" | "delete" | null

export interface DialogState {
  type: DialogType
  project: SidebarProject | null
}

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

function generateSuffix(): string {
  return Math.random().toString(36).slice(2, 7)
}

interface UseProjectActionsOptions {
  activeProjectId?: string
  onProjectCreated?: (project: SidebarProject) => void
  onProjectDeleted?: (projectId: string) => void
  onProjectRenamed?: (projectId: string, newName: string) => void
}

export function useProjectActions({ activeProjectId, onProjectCreated, onProjectDeleted, onProjectRenamed }: UseProjectActionsOptions = {}) {
  const router = useRouter()
  const [dialogState, setDialogState] = useState<DialogState>({ type: null, project: null })
  const [formName, setFormName] = useState("")
  const [suffix, setSuffix] = useState(generateSuffix)
  const [isPending, startTransition] = useTransition()

  const slug = toSlug(formName)
  const roomId = slug ? `${slug}-${suffix}` : ""

  function openCreate() {
    setFormName("")
    setSuffix(generateSuffix())
    setDialogState({ type: "create", project: null })
  }

  function openRename(project: SidebarProject) {
    setFormName(project.name)
    setDialogState({ type: "rename", project })
  }

  function openDelete(project: SidebarProject) {
    setDialogState({ type: "delete", project })
  }

  function closeDialog() {
    setDialogState({ type: null, project: null })
    setFormName("")
  }

  function handleCreate() {
    const name = formName.trim()
    if (!name || !roomId) return
    startTransition(async () => {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: roomId, name }),
      })
      if (res.ok) {
        closeDialog()
        onProjectCreated?.({ id: roomId, name })
        router.push(`/editor/${roomId}`)
      }
    })
  }

  function handleRename() {
    const name = formName.trim()
    if (!name || !dialogState.project) return
    const projectId = dialogState.project.id
    startTransition(async () => {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      })
      if (res.ok) {
        closeDialog()
        onProjectRenamed?.(projectId, name)
      }
    })
  }

  function handleDelete() {
    if (!dialogState.project) return
    const projectId = dialogState.project.id
    startTransition(async () => {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      })
      if (res.ok) {
        closeDialog()
        onProjectDeleted?.(projectId)
        if (projectId === activeProjectId) {
          router.push("/editor")
        }
      }
    })
  }

  return {
    dialogState,
    formName,
    setFormName,
    roomId,
    isLoading: isPending,
    openCreate,
    openRename,
    openDelete,
    closeDialog,
    handleCreate,
    handleRename,
    handleDelete,
  }
}
