import { LoadableButton } from '@/components/LoadableButton'
import { ArrowRight, ChevronLeft } from 'lucide-react'
import { useContext } from 'react'
import { AddWorkflowDialogContext, EImportStep } from '..'
import { Button } from '@/components/ui/button'

export const MappingInput: IComponent = () => {
  const { setStep } = useContext(AddWorkflowDialogContext)

  const handlePressNext = () => {}
  return (
    <div className='space-y-4 min-w-80'>
      <div className='flex gap-2 w-full justify-end items-center mt-4'>
        <Button onClick={() => setStep?.(EImportStep.S1_WORKFLOW_INFO)} variant='secondary' className=''>
          Back
          <ChevronLeft width={16} height={16} className='ml-2' />
        </Button>
        <LoadableButton>
          Continue
          <ArrowRight width={16} height={16} className='ml-2' />
        </LoadableButton>
      </div>
    </div>
  )
}
