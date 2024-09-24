import React, { useEffect } from 'react'
import { ReactFlow, Background, Controls, ReactFlowProvider, useNodesState, useEdgesState } from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { applyLayout, transformEdges, transformNodes } from './tools'
import useDarkMode from '@/hooks/useDarkmode'
import { EHightlightType, useWorkflowVisStore } from './state'

export const WorkflowVisualize: IComponent<{
  workflow: IWorkflow
}> = ({ workflow }) => {
  const { hightlightArr } = useWorkflowVisStore()
  const isDark = useDarkMode()

  const [edges, setEdges, onEdgesChange] = useEdgesState(transformEdges(workflow))
  const [nodes, setNodes, onNodesChange] = useNodesState(applyLayout(transformNodes(workflow), edges))

  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => {
        const hlData = hightlightArr?.find((hl) => hl.id === node.id)
        let borderColor = undefined
        switch (hlData?.type) {
          case EHightlightType.INPUT:
            borderColor = '#10B981'
            break
          case EHightlightType.OUTPUT:
            // Green
            borderColor = '#10B981'
            break
          case EHightlightType.SELECTING:
            borderColor = '#F59E0B'
            break
          default:
            break
        }
        return {
          ...node,
          style: {
            ...node.style,
            borderColor
          }
        }
      })
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hightlightArr])

  useEffect(() => {
    setNodes((nds) => applyLayout(nds, edges))
  }, [edges, setNodes])

  return (
    <div className='w-full h-full'>
      <ReactFlow nodes={nodes} edges={edges} fitView colorMode={isDark ? 'dark' : 'light'}>
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  )
}
