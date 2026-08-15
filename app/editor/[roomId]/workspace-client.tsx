"use client"

import { useState } from 'react'
import { LiveblocksProvider, RoomProvider } from '@liveblocks/react'
import { ClientSideSuspense } from '@liveblocks/react/suspense'
import { EditorNavbar } from '@/components/editor/editor-navbar'
import { useSidebar } from '@/components/editor/sidebar-context'
import { ShareDialog } from '@/components/editor/share-dialog'
import { CanvasWrapper } from '@/components/editor/canvas-wrapper'
import { CollaboratorAvatars } from '@/components/editor/collaborator-avatars'
import { AiPanel } from '@/components/editor/ai-panel'
import { SaveStatusProvider } from '@/components/editor/save-status-context'
import { SaveStatusIndicator } from '@/components/editor/save-status-indicator'
import { cn } from '@/lib/utils'

interface WorkspaceClientProps {
  roomId: string
  projectName: string
  isOwner: boolean
}

function WorkspaceShell({ roomId, projectName, isOwner }: WorkspaceClientProps) {
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [activeView, setActiveView]           = useState<'canvas' | '3d'>('canvas')
  const { sidebarOpen, toggleSidebar }        = useSidebar()

  return (
    <SaveStatusProvider>
      <EditorNavbar
        isSidebarOpen={sidebarOpen}
        onToggleSidebar={toggleSidebar}
        projectName={projectName}
        onShareClick={() => setShareDialogOpen(true)}
        activeView={activeView}
        onViewChange={setActiveView}
        saveIndicator={<SaveStatusIndicator />}
        collaboratorAvatars={
          <ClientSideSuspense fallback={null}>
            <CollaboratorAvatars />
          </ClientSideSuspense>
        }
      />
      <ShareDialog
        projectId={roomId}
        isOwner={isOwner}
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
      />

      <main className={cn("fixed inset-0 top-12 overflow-hidden", activeView !== 'canvas' && 'hidden')}>
        <CanvasWrapper activeView={activeView} projectId={roomId} />
      </main>

      {activeView === '3d' && (
        <main className="fixed inset-0 top-12 overflow-hidden flex items-center justify-center bg-[#0a0a0a]">
          <p className="text-sm text-copy-muted">Twin View coming soon</p>
        </main>
      )}

      <div className={cn(activeView !== 'canvas' && 'hidden')}>
        <AiPanel />
      </div>
    </SaveStatusProvider>
  )
}

export function WorkspaceClient({ roomId, projectName, isOwner }: WorkspaceClientProps) {
  return (
    <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
      <RoomProvider id={roomId} initialPresence={{ cursor: null, thinking: false }}>
        <WorkspaceShell roomId={roomId} projectName={projectName} isOwner={isOwner} />
      </RoomProvider>
    </LiveblocksProvider>
  )
}
