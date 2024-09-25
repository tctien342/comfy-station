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
        const hlData = hightlightArr
          ?.sort((a, b) => {
            // PROCESSING have highest order
            if (a.type === EHightlightType.PROCESSING) return 1
            return 0
          })
          .find((hl) => hl.id === node.id)
        let borderColor = undefined
        switch (hlData?.type) {
          case EHightlightType.PROCESSING:
            borderColor = '#F87171'
            break
          case EHightlightType.INPUT:
            borderColor = '#10B981'
            break
          case EHightlightType.OUTPUT:
            // Blue
            borderColor = '#3B82F6'
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
    <div className='w-full h-full relative'>
      <div className='absolute z-10 top-4 left-4 border p-2 rounded-full flex gap-4'>
        <div className='flex gap-1 items-center text-xs'>
          <div className='w-2 h-min aspect-square bg-[#10B981] rounded-full' />
          <span>INPUT</span>
        </div>
        <div className='flex gap-1 items-center text-xs'>
          <div className='w-2 h-min aspect-square bg-[#3B82F6] rounded-full' />
          <span>OUTPUT</span>
        </div>
        <div className='flex gap-1 items-center text-xs'>
          <div className='w-2 h-min aspect-square bg-[#F59E0B] rounded-full' />
          <span>SELECTING</span>
        </div>
        <div className='flex gap-1 items-center text-xs'>
          <div className='w-2 h-min aspect-square bg-[#F87171] rounded-full' />
          <span>PROCESSING</span>
        </div>
      </div>
      <ReactFlow nodes={nodes} edges={edges} fitView colorMode={isDark ? 'dark' : 'light'}>
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  )
}
