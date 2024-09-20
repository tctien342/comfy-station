import React from 'react'
import { ReactFlow, Background, Controls, ReactFlowProvider } from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { applyLayout, transformEdges, transformNodes } from './tools'
import useDarkMode from '@/hooks/useDarkmode'

export const WorkflowVisualize: IComponent<{
  workflow: IWorkflow
}> = ({ workflow }) => {
  const isDark = useDarkMode()
  const nodes = transformNodes(workflow)
  const edges = transformEdges(workflow)
  const layoutedNodes = applyLayout(nodes, edges)

  return (
    <div className='w-full h-full'>
      <ReactFlowProvider>
        <ReactFlow nodes={layoutedNodes} edges={edges} fitView colorMode={isDark ? 'dark' : 'light'}>
          <Background />
          <Controls />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  )
}
