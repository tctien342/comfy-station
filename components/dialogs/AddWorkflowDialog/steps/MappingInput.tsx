import { useEffect, useState } from 'react'
import { ViewInputNode } from './ViewInputNode'
import { SimpleTransitionLayout } from '@/components/SimpleTranslation'
import { CreateInputNode } from './CreateInputNode'
import { IMapperInput } from '@/entities/workflow'
import { useWorkflowVisStore } from '@/components/WorkflowVisualize/state'

export const MappingInput: IComponent = () => {
  const { clearSelecting } = useWorkflowVisStore()
  const [isCreateNew, setIsCreateNew] = useState(false)
  const [editConfig, setEditConfig] = useState<IMapperInput>()

  const showInputDetail = isCreateNew || !!editConfig

  useEffect(() => {
    if (!showInputDetail) {
      clearSelecting()
    }
  }, [clearSelecting, showInputDetail])

  return (
    <SimpleTransitionLayout deps={[String(isCreateNew), editConfig?.key ?? '']} className='h-full w-full'>
      {showInputDetail ? (
        <CreateInputNode
          config={editConfig}
          onHide={() => {
            setIsCreateNew(false)
            setEditConfig(undefined)
          }}
        />
      ) : (
        <ViewInputNode
          onEdit={setEditConfig}
          onCreateNew={() => {
            setIsCreateNew(true)
          }}
        />
      )}
    </SimpleTransitionLayout>
  )
}
