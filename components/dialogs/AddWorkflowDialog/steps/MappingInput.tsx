import { useState } from 'react'
import { ViewInputNode } from './ViewInputNode'
import { SimpleTransitionLayout } from '@/components/SimpleTranslation'
import { CreateInputNode } from './CreateInputNode'

export const MappingInput: IComponent = () => {
  const [isCreateNew, setIsCreateNew] = useState(false)
  return (
    <SimpleTransitionLayout deps={[String(isCreateNew)]} className='h-full'>
      {isCreateNew ? (
        <CreateInputNode
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
