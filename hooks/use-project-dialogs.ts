"use client"

import { useState } from "react"

export interface MockProject {
  id: string
  name: string
  slug: string
  owned: boolean
}

type DialogType = "create" | "rename" | "delete" | null

export interface DialogState {
  type: DialogType
  project: MockProject | null
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

const MOCK_PROJECTS: MockProject[] = [
  { id: "1", name: "City Grid Alpha", slug: "city-grid-alpha", owned: true },
  { id: "2", name: "Solar Farm Layout", slug: "solar-farm-layout", owned: true },
  { id: "3", name: "EV Charging Hub", slug: "ev-charging-hub", owned: false },
]

export function useProjectDialogs() {
  const [projects, setProjects] = useState<MockProject[]>(MOCK_PROJECTS)
  const [dialogState, setDialogState] = useState<DialogState>({
    type: null,
    project: null,
  })
  const [formName, setFormName] = useState("")
  const isLoading = false

  const slug = toSlug(formName)

  function openCreate() {
    setFormName("")
    setDialogState({ type: "create", project: null })
  }

  function openRename(project: MockProject) {
    setFormName(project.name)
    setDialogState({ type: "rename", project })
  }

  function openDelete(project: MockProject) {
    setDialogState({ type: "delete", project })
  }

  function closeDialog() {
    setDialogState({ type: null, project: null })
    setFormName("")
  }

  function handleCreate() {
    const name = formName.trim()
    if (!name) return
    setProjects((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name, slug: toSlug(name), owned: true },
    ])
    closeDialog()
  }

  function handleRename() {
    const name = formName.trim()
    if (!name || !dialogState.project) return
    setProjects((prev) =>
      prev.map((p) =>
        p.id === dialogState.project!.id
          ? { ...p, name, slug: toSlug(name) }
          : p
      )
    )
    closeDialog()
  }

  function handleDelete() {
    if (!dialogState.project) return
    setProjects((prev) => prev.filter((p) => p.id !== dialogState.project!.id))
    closeDialog()
  }

  return {
    projects,
    dialogState,
    formName,
    setFormName,
    slug,
    isLoading,
    openCreate,
    openRename,
    openDelete,
    closeDialog,
    handleCreate,
    handleRename,
    handleDelete,
  }
}
