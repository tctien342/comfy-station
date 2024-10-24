import { AttachmentReview } from '@/components/AttachmentReview'
import { MiniBadge } from '@/components/MiniBadge'
import { LoadingSVG } from '@/components/svg/LoadingSVG'
import { Button } from '@/components/ui/button'
import { ETaskStatus, EValueType } from '@/entities/enum'
import { WorkflowTask } from '@/entities/workflow_task'
import useCopyAction from '@/hooks/useCopyAction'
import { trpc } from '@/utils/trpc'
import { ExclamationTriangleIcon } from '@radix-ui/react-icons'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { Check, Copy, Download, Hourglass, Image, Repeat, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { AttachmentImageSlider } from '@/components/AttachmentImageSlider'
import { WorkflowTaskEvent } from '@/entities/workflow_task_event'
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu'
import { LoadableButton } from '@/components/LoadableButton'
import DownloadImagesButton from '@/components/ui-ext/download-button'
import { AttachmentImage } from '@/components/AttachmentImage'

export const TaskItem: IComponent<{
  data: WorkflowTask
  deleting?: boolean
  onPressDelete?: () => void
}> = ({ data, onPressDelete, deleting }) => {
  const [showImages, setShowImages] = useState(false)
  const { data: task, refetch } = trpc.workflowTask.detail.useQuery(data.id, {
    enabled: !!data.id,
    refetchOnWindowFocus: false
  })

  const { data: attachments, refetch: refetchAttachments } = trpc.workflowTask.getOutputAttachementUrls.useQuery(
    data.id,
    {
      enabled: !!data.id,
      refetchOnWindowFocus: false
    }
  )

  trpc.watch.historyItem.useSubscription(data.id, {
    onData: () => {
      refetch()
      refetchAttachments()
    }
  })

  const { copyToClipboard, isCopied } = useCopyAction()

  const isLoading = useMemo(() => {
    if (!task) return true
    const searchLoading = (wTask: WorkflowTask) => {
      return !(
        wTask.events.find((e) => e.status === ETaskStatus.Failed) ||
        wTask.events.find((e) => e.status === ETaskStatus.Success && e.details === 'FINISHED')
      )
    }
    return task.status !== ETaskStatus.Parent ? searchLoading(task) : task.subTasks?.find(searchLoading)
  }, [task])

  const runningTime = useMemo(() => {
    const getTaskTime = (wTask: WorkflowTask) => {
      if (!!wTask?.events.length) {
        // Only get the last queuing event, this is the last time the task was queued
        // Incase our server is rebooted and all task are requeued, we will get the last time it was queued
        const lastQueuingEvent = [...wTask.events].reverse().find((e) => e.status === ETaskStatus.Pending)
        if (!lastQueuingEvent) return -1

        const workArr = [...wTask.events]
        const queueIndex = workArr.indexOf(lastQueuingEvent)
        const searchArr = workArr.slice(queueIndex)
        const startRunningEvent = searchArr.find((e) => e.status === ETaskStatus.Running)
        const stopRunningEvent = searchArr.find((e) => e.status === ETaskStatus.Success)
        if (startRunningEvent && stopRunningEvent) {
          const startDate = new Date(stopRunningEvent.createdAt)
          const stopDate = new Date(startRunningEvent.createdAt)
          return Math.round((startDate.getTime() - stopDate.getTime()) / 1000)
        }
        return 0
      }
      return -1
    }
    let totalTime = getTaskTime(task!)
    if (task?.subTasks?.length) {
      for (const subTask of task.subTasks) {
        totalTime += getTaskTime(subTask)
      }
    }
    return totalTime
  }, [task])

  const currentStatus = useMemo(() => {
    const statues = task?.status === ETaskStatus.Parent ? task?.subTasks.map((t) => t.status) : [task?.status]
    if (statues.every((s) => s === ETaskStatus.Success)) return ETaskStatus.Success
    if (statues.some((s) => s === ETaskStatus.Failed)) return ETaskStatus.Failed
    if (statues.some((s) => s === ETaskStatus.Running)) return ETaskStatus.Running
    if (statues.some((s) => s === ETaskStatus.Pending)) return ETaskStatus.Pending
    return ETaskStatus.Queuing
  }, [task?.status, task?.subTasks])

  const finishedEv =
    task?.status !== ETaskStatus.Parent
      ? [task?.events.find((e) => !!e.data)]
      : task?.subTasks
          ?.filter((t) => t.status === ETaskStatus.Success && !!t.events.find((e) => !!e.data))
          .map((v) => v.events)
          .flat()

  const outputData = (finishedEv as WorkflowTaskEvent[])
    .filter((v) => !!v)
    .map((v) => Object.values(v!.data ?? {}))
    .flat()
  const outputAttachments = outputData.filter((d) => d.type === EValueType.Image)

  const previewAttachment = useMemo(() => {
    if (isLoading) {
      return (
        <div className='h-32 w-fit !aspect-square flex items-center justify-center bg-secondary/50 text-white'>
          <LoadingSVG width={24} height={24} />
        </div>
      )
    }
    if (!outputAttachments || outputAttachments.length === 0) {
      const text = outputData.find((d) => d.type === EValueType.String)
      if (text) {
        return (
          <Tooltip>
            <TooltipTrigger>
              <div className='h-32 w-fit !aspect-square flex items-center justify-center bg-secondary/50 text-secondary'>
                <span>TEXT</span>
              </div>
            </TooltipTrigger>
            <TooltipContent
              side='top'
              align='end'
              className='max-w-sm bg-background text-foreground border p-2 flex flex-col'
            >
              {text.value}
              <Button
                onClick={() => {
                  copyToClipboard(String(text.value))
                }}
                variant='outline'
                className='mt-2'
              >
                Copy
                {isCopied ? (
                  <Check width={16} height={16} className='ml-2' />
                ) : (
                  <Copy width={16} height={16} className='ml-2' />
                )}
              </Button>
            </TooltipContent>
          </Tooltip>
        )
      }
      return (
        <div className='h-32 w-fit !aspect-square flex items-center justify-center bg-secondary/50 text-orange-400'>
          <ExclamationTriangleIcon width={24} height={24} />
        </div>
      )
    }
    return (
      <AttachmentImage
        onClick={() => setShowImages(true)}
        alt={task?.workflow.name || ''}
        preferredSize='preview'
        data={{ id: outputAttachments[0].value[0] as string }}
        containerClassName='h-32 w-auto !aspect-square'
      />
    )
  }, [isLoading, outputAttachments, task?.workflow.name, outputData, isCopied, copyToClipboard])

  const shortName = task?.trigger.user?.email?.split('@')[0] ?? '-'
  const outputImageAttachments = outputAttachments.map((v) => v.value).flat() as string[]

  if (!task)
    return (
      <div className='w-full flex h-full justify-center items-center'>
        <div className='flex flex-col gap-2 px-2'>
          <Skeleton className='w-24 h-6' />
          <Skeleton className='w-64 h-3' />
          <Skeleton className='w-64 h-3' />
          <div className='flex gap-2 mt-2'>
            <Skeleton className='w-24 h-4' />
            <Skeleton className='w-24 h-4' />
          </div>
        </div>
        <Skeleton className='h-32 aspect-square rounded-none w-fit ml-auto' />
      </div>
    )

  return (
    <ContextMenu>
      <ContextMenuTrigger className='w-full flex relative'>
        <div className='w-full flex relative group pl-2'>
          <AttachmentImageSlider
            images={outputImageAttachments}
            show={showImages}
            onHide={() => setShowImages(false)}
          />
          <div className='flex-1 flex-col px-1 py-3'>
            <Label className='text-base font-semibold'>{task.workflow.name}</Label>
            <p className='text-xs md:text-sm'>ID: #{task.id.split('-').pop()}</p>
            <p className='text-xs md:text-sm'>
              Trigger by: @{shortName}, {new Date(task!.createdAt).toLocaleString()}
            </p>
            <div className='w-full flex flex-wrap gap-2 mt-2'>
              <MiniBadge
                dotClassName={cn({
                  'bg-red-500': currentStatus === ETaskStatus.Failed,
                  'bg-gray-200': currentStatus === ETaskStatus.Queuing,
                  'bg-gray-500': currentStatus === ETaskStatus.Pending,
                  'bg-orange-500': currentStatus === ETaskStatus.Running,
                  'bg-green-500': currentStatus === ETaskStatus.Success
                })}
                title={currentStatus}
              />
              {runningTime >= 0 && <MiniBadge Icon={Hourglass} title='Take' count={`${runningTime}s`} />}
              {task.repeatCount > 1 && <MiniBadge Icon={Repeat} title='Repeat' count={task.repeatCount} />}
              {!!attachments?.length && <MiniBadge Icon={Image} title='Images' count={attachments.length} />}
            </div>
          </div>
          {previewAttachment}

          <div className='flex absolute top-1 right-1'>
            <DownloadImagesButton
              workflowTaskId={data.id}
              className={cn('z-10 p-2 bg-background text-foreground rounded-lg btn')}
            />
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem className='text-destructive'>
          <LoadableButton
            onClick={onPressDelete}
            loading={deleting}
            variant='ghost'
            size='sm'
            className='text-left p-0'
          >
            <Trash2 className='w-4 h-4 mr-2' />
            Delete
          </LoadableButton>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
