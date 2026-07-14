"use client"

import { Component, useState, type ReactNode } from 'react'
import { LiveblocksProvider, RoomProvider, useErrorListener, useLostConnectionListener } from '@liveblocks/react'
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

const connectionErrorFallback = (
  <div className="h-full flex items-center justify-center text-copy-muted text-sm">
    Connection error — please refresh.
  </div>
)

function RoomConnectionGuard({ children }: { children: ReactNode }) {
  const [hasConnectionError, setHasConnectionError] = useState(false)

  useErrorListener((error) => {
    if (error.context.type === 'ROOM_CONNECTION_ERROR') {
      setHasConnectionError(true)
    }
  })

  useLostConnectionListener((event) => {
    if (event === 'failed') setHasConnectionError(true)
    if (event === 'restored') setHasConnectionError(false)
  })

  if (hasConnectionError) return connectionErrorFallback
  return <>{children}</>
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
        <RoomConnectionGuard>
          <CanvasErrorBoundary fallback={connectionErrorFallback}>
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
        </RoomConnectionGuard>
      </RoomProvider>
    </LiveblocksProvider>
  )
}
