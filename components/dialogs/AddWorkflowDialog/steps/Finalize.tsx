import { useContext, useMemo, useRef, useState } from 'react'
import { AddWorkflowDialogContext } from '..'
import { WorkflowInformation } from './WorkflowInformation'
import { ViewInputNode } from './ViewInputNode'
import { ViewOutputNode } from './ViewOutputNode'
import { ScrollArea } from '@/components/ui/scroll-area'
import { LoadableButton } from '@/components/LoadableButton'
import { Play, Save, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { trpc } from '@/utils/trpc'
import { SimpleTransitionLayout } from '@/components/SimpleTranslation'
import { Label } from '@/components/ui/label'
import { EValueType } from '@/entities/enum'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export const FinalizeStep: IComponent = () => {
  const inputWorkflowTest = useRef<Record<string, any>>({})
  const [testMode, setTestMode] = useState(false)
  const { setStep, workflow, setWorkflow, rawWorkflow } = useContext(AddWorkflowDialogContext)

  trpc.workflow.testWorkflow.useSubscription(undefined, {
    onData: console.log
  })
  const { mutateAsync } = trpc.workflow.startTestWorkflow.useMutation()

  const handlePressTest = async () => {
    if (!workflow) return
    mutateAsync({
      workflow,
      input: inputWorkflowTest.current
    })
  }

  const handlePressTestWorkflow = async () => {}

  const renderContent = useMemo(() => {
    if (testMode) {
      const inputKeys = Object.keys(workflow?.mapInput || {})
      return inputKeys.map((val) => {
        const input = workflow?.mapInput?.[val as keyof typeof workflow.mapInput]
        if (!input) return null

        return (
          <div key={val} className='flex flex-col gap-2 mt-3'>
            <Label>{input.key}</Label>
            {input.type === EValueType.String && (
              <Textarea
                onChange={(e) => {
                  inputWorkflowTest.current[val] = e.target.value
                }}
                defaultValue={String(input.default ?? '')}
              />
            )}
            {[EValueType.Number, EValueType.Seed].includes(input.type as EValueType) && (
              <Input
                defaultValue={String(input.default ?? '')}
                onChange={(e) => {
                  inputWorkflowTest.current[val] = e.target.value
                }}
                type='number'
              />
            )}
            {!!input.description && <span>{input.description}</span>}
          </div>
        )
      })
    }
    return (
      <>
        <WorkflowInformation readonly />
        <div className='mt-3' />
        <ViewInputNode readonly />
        <div className='mt-3' />
        <ViewOutputNode readonly />
        <div className='pb-10' />
      </>
    )
  }, [testMode, workflow])

  return (
    <div className='absolute top-0 left-0 flex flex-col w-full h-full'>
      <h1 className='font-semibold px-2'>FINALIZE</h1>
      <ScrollArea className='flex-1'>
        <SimpleTransitionLayout deps={[String(testMode)]} className='p-2'>
          {renderContent}
        </SimpleTransitionLayout>
      </ScrollArea>
      <div className='flex justify-end items-center w-full border-t p-2 gap-1'>
        {testMode ? (
          <>
            <Button onClick={() => setTestMode(false)} variant='ghost'>
              Cancel <X className='w-4 h-4 ml-1' />
            </Button>
            <LoadableButton onClick={handlePressTest}>
              Run <Play className='w-4 h-4 ml-1' />
            </LoadableButton>
          </>
        ) : (
          <>
            <Button onClick={() => setTestMode(true)} variant='ghost'>
              Test workflow <Play className='w-4 h-4 ml-1' />
            </Button>
            <LoadableButton onClick={() => console.log(workflow)}>
              Submit <Save className='w-4 h-4 ml-1' />
            </LoadableButton>
          </>
        )}
      </div>
    </div>
  )
}
