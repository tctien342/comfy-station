import { useEffect, useState } from 'react'
import { ViewInputNode } from './ViewInputNode'
import { SimpleTransitionLayout } from '@/components/SimpleTranslation'
import { CreateInputNode } from './CreateInputNode'
import { IMapperInput, IMapperOutput } from '@/entities/workflow'
import { useWorkflowVisStore } from '@/components/WorkflowVisualize/state'
import { ViewOutputNode } from './ViewOutputNode'
import { CreateOutputNode } from './CreateOutputNode'

export const MappingOutput: IComponent = () => {
  const { clearSelecting } = useWorkflowVisStore()
  const [isCreateNew, setIsCreateNew] = useState(false)
  const [editConfig, setEditConfig] = useState<IMapperOutput>()

  const showInputDetail = isCreateNew || !!editConfig

  useEffect(() => {
    if (!showInputDetail) {
      clearSelecting()
    }
  }, [clearSelecting, showInputDetail])

  return (
    <SimpleTransitionLayout deps={[String(isCreateNew), editConfig?.key ?? '']} className='h-full w-full'>
      {showInputDetail ? (
        <CreateOutputNode
          onHide={() => {
            setIsCreateNew(false)
            setEditConfig(undefined)
          }}
          config={editConfig}
        />
      ) : (
        <ViewOutputNode
          onEdit={setEditConfig}
          onCreateNew={() => {
            setIsCreateNew(true)
          }}
        />
      )}
    </SimpleTransitionLayout>
  )
}
