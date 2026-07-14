"use client"

import { useState, useEffect } from 'react'
import { Bot, Sparkles } from 'lucide-react'
import { EditorNavbar } from '@/components/editor/editor-navbar'
import { useSidebar } from '@/components/editor/sidebar-context'
import { ShareDialog } from '@/components/editor/share-dialog'
import { CanvasWrapper } from '@/components/editor/canvas-wrapper'

interface WorkspaceClientProps {
  roomId: string
  projectName: string
  isOwner: boolean
}

export function WorkspaceClient({ roomId, projectName, isOwner }: WorkspaceClientProps) {
  const [aiSidebarOpen, setAiSidebarOpen] = useState(false)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const { sidebarOpen, toggleSidebar } = useSidebar()

  useEffect(() => {
    if (window.matchMedia('(min-width: 768px)').matches) {
      setAiSidebarOpen(true)
    }
  }, [])

  return (
    <>
      <EditorNavbar
        isSidebarOpen={sidebarOpen}
        onToggleSidebar={toggleSidebar}
        projectName={projectName}
        isAISidebarOpen={aiSidebarOpen}
        onToggleAISidebar={() => setAiSidebarOpen((v) => !v)}
        onShareClick={() => setShareDialogOpen(true)}
      />
      <ShareDialog
        projectId={roomId}
        isOwner={isOwner}
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
      />

      {aiSidebarOpen && (
        <div className="fixed top-12 right-0 z-40 h-[calc(100vh-3rem)] w-72 bg-surface border-l border-surface-border flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-surface-border flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-copy-primary">AI Engineer</p>
              <p className="text-xs text-copy-muted mt-0.5">Placeholder panel</p>
            </div>
            <Sparkles className="h-4 w-4 text-ai-text mt-0.5 shrink-0" />
          </div>

          <div className="p-3">
            <div className="rounded-2xl bg-elevated border border-surface-border p-4 flex gap-3">
              <Bot className="h-5 w-5 text-brand shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-copy-primary">Chat surface pending</p>
                <p className="text-xs text-copy-muted mt-1 leading-relaxed">
                  The toggle is wired. Messaging and generation are
                  intentionally out of scope here.
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1" />

          <div className="p-3 pb-4">
            <div className="rounded-2xl bg-elevated border border-surface-border p-4">
              <p className="text-[10px] tracking-[0.15em] uppercase text-copy-faint mb-2">
                Future Hooks
              </p>
              <p className="text-xs text-copy-muted leading-relaxed">
                Prompt composer, run status, and architecture guidance will
                attach to this sidebar.
              </p>
            </div>
          </div>
        </div>
      )}

      <main className="fixed inset-0 top-12 overflow-hidden">
        <CanvasWrapper roomId={roomId} />
      </main>
    </>
  )
}
