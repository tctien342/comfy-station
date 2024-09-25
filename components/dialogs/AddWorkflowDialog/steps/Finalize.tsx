import { ReactNode, useContext, useMemo, useRef, useState } from 'react'
import { AddWorkflowDialogContext } from '..'
import { WorkflowInformation } from './WorkflowInformation'
import { ViewInputNode } from './ViewInputNode'
import { ViewOutputNode } from './ViewOutputNode'
import { ScrollArea } from '@/components/ui/scroll-area'
import { LoadableButton } from '@/components/LoadableButton'
import { Check, Play, Save, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { trpc } from '@/utils/trpc'
import { SimpleTransitionLayout } from '@/components/SimpleTranslation'
import { Label } from '@/components/ui/label'
import { EValueSelectionType, EValueType } from '@/entities/enum'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import DropFileInput from '@/components/DropFileInput'
import { CardDescription } from '@/components/ui/card'
import { useAttachmentUploader } from '@/hooks/useAttachmentUploader'
import { TWorkflowProgressMessage } from '@/types/task'
import { LoadingSVG } from '@/components/svg/LoadingSVG'
import { PhotoView } from 'react-photo-view'
import { useWorkflowVisStore } from '@/components/WorkflowVisualize/state'
import { z } from 'zod'
import { Select, SelectContent, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cloneDeep } from 'lodash'

const SelectionSchema = z.nativeEnum(EValueSelectionType)

export const FinalizeStep: IComponent = () => {
  const [loading, setLoading] = useState(false)
  const [progressEv, setProgressEv] = useState<TWorkflowProgressMessage>()
  const inputWorkflowTest = useRef<Record<string, any>>({})
  const [testMode, setTestMode] = useState(false)
  const { setStep, workflow, setWorkflow, rawWorkflow } = useContext(AddWorkflowDialogContext)

  const { uploadAttachment } = useAttachmentUploader()
  const { updateProcessing } = useWorkflowVisStore()

  trpc.workflow.testWorkflow.useSubscription(undefined, {
    onData: (ev) => {
      setProgressEv(ev)
      if (ev.key === 'failed' || ev.key === 'finished') {
        setLoading(false)
        updateProcessing()
      }
      if (ev.key === 'progress') {
        updateProcessing(`${ev.data.node}`)
      }
    }
  })
  const { mutateAsync } = trpc.workflow.startTestWorkflow.useMutation()

  const handlePressTest = async () => {
    if (!workflow) return
    const wfObj = cloneDeep(inputWorkflowTest.current)
    // Check if there are files to upload
    const inputKeys = Object.keys(workflow?.mapInput || {})
    for (const key of inputKeys) {
      const input = workflow?.mapInput?.[key as keyof typeof workflow.mapInput]
      if (!input) continue
      if (input.type === EValueType.File || input.type === EValueType.Image) {
        const files = wfObj[key] as File[]
        if (files.length > 0) {
          const file = files[0]
          if (file instanceof File) {
            wfObj[key] = await uploadAttachment(file)
          }
        }
      }
    }
    setLoading(true)
    mutateAsync({
      workflow,
      input: wfObj
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
          <div key={val} className='flex flex-col gap-2 mb-3'>
            <Label>{input.key}</Label>
            {input.type === EValueType.String && (
              <Textarea
                disabled={loading}
                onChange={(e) => {
                  inputWorkflowTest.current[val] = e.target.value
                }}
                defaultValue={String(input.default ?? '')}
              />
            )}
            {[EValueType.File, EValueType.Image].includes(input.type as EValueType) && (
              <DropFileInput
                disabled={loading}
                defaultFiles={inputWorkflowTest.current[val]}
                maxFiles={1}
                onChanges={(files) => {
                  inputWorkflowTest.current[val] = files
                }}
              />
            )}
            {[EValueType.Number, EValueType.Seed].includes(input.type as EValueType) && (
              <Input
                disabled={loading}
                defaultValue={String(input.default ?? '')}
                onChange={(e) => {
                  inputWorkflowTest.current[val] = e.target.value
                }}
                type='number'
              />
            )}
            {SelectionSchema.safeParse(input.type).success && (
              <Select
                defaultValue={String(input.default ?? '')}
                onValueChange={(value) => {
                  inputWorkflowTest.current[val] = value
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select...' className='whitespace-normal break-words w-full' />
                </SelectTrigger>
                <SelectContent>
                  {input.selections!.map((selection) => (
                    <SelectItem key={selection.value} value={selection.value}>
                      <div className='flex items-center whitespace-normal break-words'>{selection.value}</div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {!!input.description && <CardDescription>{input.description}</CardDescription>}
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
  }, [testMode, workflow, loading])

  const renderEventStatus = useMemo(() => {
    if (!progressEv) return null
    return (
      <div className='flex flex-col gap-2'>
        <Label>Status</Label>
        {progressEv.key !== 'finished' && (
          <div className='flex flex-row gap-2 items-center animate-pulse'>
            <LoadingSVG width={16} height={16} />
            {progressEv.key === 'init' && <Label>Initializing...</Label>}
            {progressEv.key === 'loading' && <Label>Loading resources...</Label>}
            {progressEv.key === 'progress' && (
              <Label>
                Running at node {progressEv.data.node}, {progressEv.data.value}/{progressEv.data.max}...
              </Label>
            )}
            {progressEv.key === 'failed' && <Label>Failed</Label>}
          </div>
        )}
        {progressEv.key === 'finished' && (
          <div className='flex flex-col gap-2 items-center'>
            <div className='flex gap-2 items-center w-full'>
              <Check width={16} height={16} className='text-green-500' />
              <Label>Finished</Label>
            </div>
            <div className='w-full flex flex-col gap-2'>
              {Object.keys(progressEv.data.output).map((key) => {
                const data = progressEv.data.output[key as keyof typeof progressEv.data]
                let items: ReactNode[] = []
                switch (data.info.type) {
                  case EValueType.Image:
                    const imageURLs = data.data as { url: string }[]
                    items.push(
                      ...imageURLs.map((url, idx) => (
                        <PhotoView key={idx} src={url.url}>
                          <img src={url.url} alt='output' className='w-20 h-20 object-cover rounded-xl' />
                        </PhotoView>
                      ))
                    )
                    break
                  default:
                    items = []
                }
                return (
                  <div key={key} className='w-full flex gap-2 flex-col'>
                    <Label>{key}</Label>
                    <div className='w-full flex gap-2'>{items}</div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    )
  }, [progressEv])

  return (
    <div className='absolute top-0 left-0 flex flex-col w-full h-full'>
      <h1 className='font-semibold px-2'>FINALIZE</h1>
      <ScrollArea className='flex-1'>
        <SimpleTransitionLayout deps={[String(testMode)]} className='p-2'>
          {renderContent}
          {renderEventStatus}
        </SimpleTransitionLayout>
      </ScrollArea>
      <div className='flex justify-end items-center w-full border-t p-2 gap-1'>
        {testMode ? (
          <>
            <Button onClick={() => setTestMode(false)} variant='ghost'>
              Cancel <X className='w-4 h-4 ml-1' />
            </Button>
            <LoadableButton loading={loading} onClick={handlePressTest}>
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
