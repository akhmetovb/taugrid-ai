"use client"

import { PanelLeftClose, PanelLeftOpen, Share2, Sparkles } from "lucide-react"
import { UserButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"

interface EditorNavbarProps {
  isSidebarOpen: boolean
  onToggleSidebar: () => void
  projectName?: string
  isAISidebarOpen?: boolean
  onToggleAISidebar?: () => void
  onShareClick?: () => void
}

export function EditorNavbar({
  isSidebarOpen,
  onToggleSidebar,
  projectName,
  isAISidebarOpen,
  onToggleAISidebar,
  onShareClick,
}: EditorNavbarProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-12 flex items-center px-3 bg-surface border-b border-surface-border">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          className="h-8 w-8 shrink-0 text-copy-muted hover:text-copy-primary"
        >
          {isSidebarOpen ? (
            <PanelLeftClose className="h-5 w-5" />
          ) : (
            <PanelLeftOpen className="h-5 w-5" />
          )}
        </Button>
        {projectName && (
          <div className="flex flex-col leading-none">
            <span className="text-sm font-semibold text-copy-primary leading-tight">{projectName}</span>
            <span className="text-[11px] text-copy-muted leading-tight">Workspace</span>
          </div>
        )}
      </div>
      <div className="flex-1" />
      <div className="flex items-center gap-2">
        {projectName && (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 text-copy-muted hover:text-copy-primary"
              onClick={onShareClick}
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={onToggleAISidebar}
              aria-label={isAISidebarOpen ? "Close AI sidebar" : "Open AI sidebar"}
              className="h-8 gap-1.5"
            >
              <Sparkles className="h-4 w-4" />
              AI
            </Button>
          </>
        )}
        <UserButton />
      </div>
    </header>
  )
}
