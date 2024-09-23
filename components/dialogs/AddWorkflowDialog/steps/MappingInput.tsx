import { useState } from 'react'
import { ViewInputNode } from './ViewInputNode'
import { SimpleTransitionLayout } from '@/components/SimpleTranslation'
import { CreateInputNode } from './CreateInputNode'
import { IMapperInput } from '@/entities/workflow'

export const MappingInput: IComponent = () => {
  const [isCreateNew, setIsCreateNew] = useState(false)
  const [editConfig, setEditConfig] = useState<IMapperInput>()
  return (
    <SimpleTransitionLayout deps={[String(isCreateNew)]} className='h-full w-full'>
      {isCreateNew || !!editConfig ? (
        <CreateInputNode
          config={editConfig}
          onHide={() => {
            setIsCreateNew(false)
          }}
        />
      ) : (
        <ViewInputNode
          onCreateNew={() => {
            setIsCreateNew(true)
          }}
        />
      )}
    </SimpleTransitionLayout>
  )
}
