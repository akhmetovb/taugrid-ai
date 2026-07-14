"use client"

import { Component, type ReactNode } from 'react'
import { LiveblocksProvider, RoomProvider } from '@liveblocks/react'
import { ClientSideSuspense } from '@liveblocks/react/suspense'
import { Canvas } from './canvas'

class CanvasErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) return this.props.fallback
    return this.props.children
  }
}

interface CanvasWrapperProps {
  roomId: string
}

export function CanvasWrapper({ roomId }: CanvasWrapperProps) {
  return (
    <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
      <RoomProvider
        id={roomId}
        initialPresence={{ cursor: null, isThinking: false }}
      >
        <CanvasErrorBoundary
          fallback={
            <div className="h-full flex items-center justify-center text-copy-muted text-sm">
              Connection error — please refresh.
            </div>
          }
        >
          <ClientSideSuspense
            fallback={
              <div className="h-full flex items-center justify-center text-copy-muted text-sm">
                Connecting…
              </div>
            }
          >
            <Canvas />
          </ClientSideSuspense>
        </CanvasErrorBoundary>
      </RoomProvider>
    </LiveblocksProvider>
  )
}
