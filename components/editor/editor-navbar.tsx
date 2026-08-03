"use client"

import { PanelLeftClose, PanelLeftOpen, Share2, Sparkles, LayoutDashboard, Box } from "lucide-react"
import { UserButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface EditorNavbarProps {
  isSidebarOpen: boolean
  onToggleSidebar: () => void
  projectName?: string
  isAISidebarOpen?: boolean
  onToggleAISidebar?: () => void
  onShareClick?: () => void
  activeView?: 'canvas' | '3d'
  onViewChange?: (view: 'canvas' | '3d') => void
}

export function EditorNavbar({
  isSidebarOpen,
  onToggleSidebar,
  projectName,
  isAISidebarOpen,
  onToggleAISidebar,
  onShareClick,
  activeView = 'canvas',
  onViewChange,
}: EditorNavbarProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-12 flex items-center px-3 bg-surface border-b border-surface-border">
      <div className="flex items-center gap-2 shrink-0">
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

      <div className="flex-1 flex justify-center">
        {projectName && (
          <div className="inline-flex items-center gap-0.5 rounded-md bg-base border border-surface-border p-0.5">
            <button
              type="button"
              aria-pressed={activeView === 'canvas'}
              onClick={() => onViewChange?.('canvas')}
              className={cn(
                "flex items-center gap-1 rounded px-2 py-0.5 text-xs transition-colors",
                activeView === 'canvas'
                  ? "bg-surface text-copy-primary"
                  : "text-copy-muted hover:text-copy-primary"
              )}
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              Canvas
            </button>
            <button
              type="button"
              aria-pressed={activeView === '3d'}
              onClick={() => onViewChange?.('3d')}
              className={cn(
                "flex items-center gap-1 rounded px-2 py-0.5 text-xs transition-colors",
                activeView === '3d'
                  ? "bg-surface text-copy-primary"
                  : "text-copy-muted hover:text-copy-primary"
              )}
            >
              <Box className="h-3.5 w-3.5" />
              3D View
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
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
