import { LoadableButton } from '@/components/LoadableButton'
import { SimpleTransitionLayout } from '@/components/SimpleTranslation'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { WorkflowInputArea } from '@/components/WorkflowInputArea'
import { EValueType } from '@/entities/enum'
import { useAttachmentUploader } from '@/hooks/useAttachmentUploader'
import { useCurrentRoute } from '@/hooks/useCurrentRoute'
import { useToast } from '@/hooks/useToast'
import { trpc } from '@/utils/trpc'
import { ChevronLeft, Play } from 'lucide-react'
import { useMemo, useState } from 'react'

export const WorkflowSidePicker: IComponent = () => {
  const { router, slug } = useCurrentRoute()
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const [inputData, setInputData] = useState<Record<string, any>>({})
  const crrWorkflowInfo = trpc.workflow.get.useQuery(slug!, {
    enabled: !!slug
  })

  const handlePickWorkflow = (id: string) => {
    router.push(`/main/workflow/${id}`)
  }

  const workflowListLoader = trpc.workflow.listWorkflowSelections.useQuery()
  const runner = trpc.workflowTask.executeTask.useMutation()
  const { uploadAttachment } = useAttachmentUploader()

  const handlePressRun = async () => {
    if (!crrWorkflowInfo.data) {
      return
    }
    setLoading(true)
    const input = crrWorkflowInfo.data.mapInput
    const inputRecord: Record<string, any> = {}
    for (const key in input) {
      const crrInput = input[key]
      if (crrInput.type === EValueType.Number) {
        inputRecord[key] = Number(inputData[key] || crrInput.default)
      }
      if ([EValueType.File, EValueType.Image].includes(crrInput.type as EValueType)) {
        const files = inputData[key] as File[]
        const file = files[0]
        if (file) {
          const attachment = await uploadAttachment(file)
          inputRecord[key] = attachment.id
        }
      } else {
        inputRecord[key] = inputData[key] || crrInput.default
      }
    }

    runner
      .mutateAsync({
        input: inputRecord,
        workflowId: crrWorkflowInfo.data.id
      })
      .then(() => {
        toast({
          title: 'Task has been scheduled'
        })
      })
      .catch(() => {
        toast({
          title: 'Failed to schedule task',
          variant: 'destructive'
        })
      })
      .finally(() => {
        setLoading(false)
      })
  }

  const cost = useMemo(() => {
    let val = crrWorkflowInfo.data?.cost || 0
    const inputConf = crrWorkflowInfo.data?.mapInput
    if (inputConf) {
      for (const conf in inputConf) {
        if (inputConf[conf].cost?.related) {
          const crrValue = inputData[conf]
          if (crrValue) {
            val += Number(crrValue) * inputConf[conf].cost.costPerUnit
          }
        }
      }
    }
    return val
  }, [inputData, crrWorkflowInfo.data])

  return (
    <div className='w-full h-full flex flex-col items-start py-2'>
      <div className='px-2'>
        <Select defaultValue={slug} onValueChange={handlePickWorkflow}>
          <SelectTrigger>
            <SelectValue placeholder='Select...' />
          </SelectTrigger>
          <SelectContent>
            {workflowListLoader.data?.map((selection) => (
              <SelectItem key={selection.id} value={selection.id} className='flex flex-col'>
                <div className='w-[300px] font-semibold whitespace-normal break-words text-left'>{selection.name}</div>
                <p className='text-xs'>{selection.description}</p>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <SimpleTransitionLayout deps={[crrWorkflowInfo.data?.id || '']} className='flex-1 w-full flex flex-col relative'>
        {!!crrWorkflowInfo.data && <WorkflowInputArea workflow={crrWorkflowInfo.data} onChange={setInputData} />}
      </SimpleTransitionLayout>
      <div className='w-full flex gap-2 justify-end items-center border-t px-2 pt-2'>
        {!!cost && <span className='text-xs text-gray-600'>Cost {cost} credits</span>}
        <Button
          onClick={() => {
            router.push('/main')
          }}
          variant='ghost'
        >
          Back
          <ChevronLeft className='w-4 h-4 ml-1' />
        </Button>
        <LoadableButton onClick={handlePressRun}>
          Run
          <Play className='w-4 h-4 ml-1' />
        </LoadableButton>
      </div>
    </div>
  )
}
