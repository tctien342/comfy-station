import { AddWorkflowDialog } from '@/components/dialogs/AddWorkflowDialog'
import { Button } from '@/components/ui/button'
import { SearchIcon } from 'lucide-react'

export const TopBar: IComponent = () => {
  return (
    <div className='w-full py-2 px-3 flex items-center'>
      <h1 className='text-xl font-black'>WORKFLOW</h1>
      <div className='flex-auto items-center justify-end flex gap-2'>
        <Button size='icon' variant='secondary' className='rounded-full'>
          <SearchIcon size={16} />
        </Button>
        <AddWorkflowDialog />
      </div>
    </div>
  )
}
