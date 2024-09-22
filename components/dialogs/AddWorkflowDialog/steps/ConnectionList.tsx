import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { IMapTarget } from '@/entities/workflow'
import { useKeygen } from '@/hooks/useKeygen'
import { PlusIcon } from 'lucide-react'
import { useContext } from 'react'
import { AddWorkflowDialogContext } from '..'
import { ConnectionPicker } from './ConnectionPicker'

export const ConnectionList: IComponent<{
  connections: Array<IMapTarget>
  onUpdate: (connections: Array<IMapTarget>) => void
}> = ({ connections, onUpdate }) => {
  const { rawWorkflow } = useContext(AddWorkflowDialogContext)
  const { gen } = useKeygen()
  return (
    <>
      <Label>Mapped to nodes</Label>
      <div className='w-full border rounded-lg min-h-[200px] flex flex-col p-2'>
        {!!rawWorkflow && <ConnectionPicker workflow={rawWorkflow} />}
        <Button className='mt-auto ml-auto' size='icon'>
          <PlusIcon width={16} height={16} />
        </Button>
      </div>
    </>
  )
}
