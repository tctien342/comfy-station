import { LoadableButton } from '@/components/LoadableButton'
import { Button } from '@/components/ui/button'
import { PlusIcon, ChevronLeft, ArrowRight, InfoIcon } from 'lucide-react'
import { AddWorkflowDialogContext, EImportStep } from '..'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { useContext, useMemo } from 'react'

export const ViewInputNode: IComponent<{
  onCreateNew: () => void
}> = ({ onCreateNew }) => {
  const { setStep, workflow, rawWorkflow } = useContext(AddWorkflowDialogContext)
  const mappedInput = workflow?.mapInput

  const renderMappedInput = useMemo(() => {
    if (!mappedInput?.length) {
      return (
        <Alert>
          <InfoIcon className='w-4 h-4' />
          <AlertTitle>Empty</AlertTitle>
          <AlertDescription>Please press add to create your first input</AlertDescription>
        </Alert>
      )
    }
    return Object.entries(mappedInput).map(([key, value]) => {
      return <div key={key}></div>
    })
  }, [mappedInput])

  return (
    <>
      <h1 className='font-semibold'>MAP INPUT NODE</h1>
      <div className='space-y-4 min-w-80 pt-2'>
        {renderMappedInput}
        <Button onClick={onCreateNew} className='w-full' variant='outline'>
          Add more input <PlusIcon className='w-4 h-4 ml-2' />
        </Button>
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
    </>
  )
}
