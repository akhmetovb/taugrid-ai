"use client"

import { ReactFlow, MiniMap, Background, BackgroundVariant, ConnectionMode } from '@xyflow/react'
import { useLiveblocksFlow, Cursors } from '@liveblocks/react-flow'
import '@xyflow/react/dist/style.css'
import '@liveblocks/react-ui/styles.css'
import '@liveblocks/react-flow/styles.css'

export function Canvas() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onDelete } =
    useLiveblocksFlow({
      suspense: true,
      nodes: { initial: [] },
      edges: { initial: [] },
    })

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDelete={onDelete}
        connectionMode={ConnectionMode.Loose}
        fitView
      >
        <Cursors />
        <MiniMap
          style={{ background: 'var(--bg-elevated)' }}
          nodeColor="#1e1e23"
          nodeStrokeColor="#2a2a30"
          maskColor="rgba(8,8,9,0.6)"
        />
        <Background variant={BackgroundVariant.Dots} />
      </ReactFlow>
    </div>
  )
}
