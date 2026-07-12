"use client"

import { Pencil, Plus, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { SidebarProject } from "@/lib/project-data"

interface ProjectSidebarProps {
  isOpen: boolean
  ownedProjects: SidebarProject[]
  sharedProjects: SidebarProject[]
  onClose: () => void
  onOpenCreate: () => void
  onOpenRename: (project: SidebarProject) => void
  onOpenDelete: (project: SidebarProject) => void
}

export function ProjectSidebar({
  isOpen,
  ownedProjects,
  sharedProjects,
  onClose,
  onOpenCreate,
  onOpenRename,
  onOpenDelete,
}: ProjectSidebarProps) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          aria-hidden="true"
          onClick={onClose}
        />
      )}
      <div
        role="complementary"
        aria-label="Projects"
        inert={!isOpen}
        className={`fixed top-12 left-0 z-40 h-[calc(100vh-3rem)] w-72 bg-surface border-r border-surface-border flex flex-col transition-transform duration-200 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-surface-border">
          <span className="text-sm font-medium text-copy-primary">Projects</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-7 w-7 text-copy-muted hover:text-copy-primary"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden px-3 pt-3">
          <Tabs defaultValue="my-projects" className="flex-1 flex flex-col">
            <TabsList className="w-full">
              <TabsTrigger value="my-projects" className="flex-1">
                My Projects
              </TabsTrigger>
              <TabsTrigger value="shared" className="flex-1">
                Shared
              </TabsTrigger>
            </TabsList>
            <TabsContent value="my-projects" className="flex-1">
              {ownedProjects.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-copy-muted text-sm">
                  No projects yet
                </div>
              ) : (
                <ul className="mt-1 flex flex-col gap-0.5">
                  {ownedProjects.map((project) => (
                    <li key={project.id}>
                      <div className="group flex items-center gap-2 px-2 py-2 rounded-xl hover:bg-elevated cursor-pointer">
                        <span className="flex-1 text-sm text-copy-primary truncate">
                          {project.name}
                        </span>
                        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={(e) => {
                              e.stopPropagation()
                              onOpenRename(project)
                            }}
                            className="text-copy-muted hover:text-copy-primary"
                            aria-label={`Rename ${project.name}`}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={(e) => {
                              e.stopPropagation()
                              onOpenDelete(project)
                            }}
                            className="text-copy-muted hover:text-state-error"
                            aria-label={`Delete ${project.name}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </TabsContent>
            <TabsContent value="shared" className="flex-1">
              {sharedProjects.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-copy-muted text-sm">
                  No shared projects
                </div>
              ) : (
                <ul className="mt-1 flex flex-col gap-0.5">
                  {sharedProjects.map((project) => (
                    <li key={project.id}>
                      <div className="flex items-center gap-2 px-2 py-2 rounded-xl hover:bg-elevated cursor-pointer">
                        <span className="flex-1 text-sm text-copy-primary truncate">
                          {project.name}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <div className="p-3 border-t border-surface-border">
          <Button className="w-full gap-2" onClick={onOpenCreate}>
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>
      </div>
    </>
  )
}
