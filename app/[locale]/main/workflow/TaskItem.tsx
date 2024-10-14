import { AttachmentImage } from '@/components/AttachmentImage'
import { MiniBadge } from '@/components/MiniBadge'
import { LoadingSVG } from '@/components/svg/LoadingSVG'
import { Button } from '@/components/ui/button'
import { ETaskStatus, EValueType } from '@/entities/enum'
import { WorkflowTask } from '@/entities/workflow_task'
import useCopyAction from '@/hooks/useCopyAction'
import { trpc } from '@/utils/trpc'
import { ExclamationTriangleIcon } from '@radix-ui/react-icons'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { Check, Copy, Hourglass, Repeat } from 'lucide-react'
import { useMemo } from 'react'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'

export const TaskItem: IComponent<{
  data: WorkflowTask
}> = ({ data }) => {
  const { data: task, refetch } = trpc.workflowTask.detail.useQuery(data.id, {
    enabled: !!data.id,
    refetchOnWindowFocus: false
  })
  trpc.watch.historyItem.useSubscription(data.id, {
    onData: () => refetch()
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

  const previewAttachment = useMemo(() => {
    if (isLoading) {
      return (
        <div className='h-32 w-fit !aspect-square flex items-center justify-center bg-secondary/50 text-white'>
          <LoadingSVG width={24} height={24} />
        </div>
      )
    }
    const finishedEv =
      task?.status !== ETaskStatus.Parent
        ? task?.events.find((e) => !!e.data)
        : task?.subTasks?.find((t) => t.status === ETaskStatus.Success)?.events.find((e) => !!e.data)
    const attachment = Object.values(finishedEv?.data || {}).find((d) => d.type === EValueType.Image)
    if (!attachment) {
      const text = Object.values(finishedEv?.data || {}).find((d) => d.type === EValueType.String)
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
        mode='avatar'
        className='h-32 !rounded-none w-fit !aspect-square object-cover p-0 m-0'
        tryPreivew
        data={{ id: attachment.value[0] as string }}
      />
    )
  }, [copyToClipboard, isCopied, isLoading, task?.events, task?.status, task?.subTasks])

  const shortName = task?.trigger.user?.email?.split('@')[0] ?? '-'

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
    <div className='w-full flex'>
      <div className='flex-1 flex-col px-1 py-3'>
        <Label className='text-base font-semibold'>{task.workflow.name}</Label>
        <p className='text-sm'>ID: {task.id}</p>
        <p className='text-sm'>
          Trigger by: @{shortName}, {new Date(task!.createdAt).toLocaleString()}
        </p>
        <div className='w-full flex flex-wrap gap-2 mt-2'>
          {currentStatus === ETaskStatus.Failed && <MiniBadge dotClassName='bg-red-500' title='Failed' />}
          {currentStatus === ETaskStatus.Queuing && <MiniBadge dotClassName='bg-gray-200' title='Queuing' />}
          {currentStatus === ETaskStatus.Pending && <MiniBadge dotClassName='bg-gray-500' title='Pendind' />}
          {currentStatus === ETaskStatus.Running && <MiniBadge dotClassName='bg-orange-500' title='Running' />}
          {currentStatus === ETaskStatus.Success && <MiniBadge dotClassName='bg-green-500' title='Success' />}
          {runningTime >= 0 && <MiniBadge Icon={Hourglass} title='Take' count={`${runningTime}s`} />}
          {task.repeatCount > 1 && <MiniBadge Icon={Repeat} title='Repeat' count={task.repeatCount} />}
        </div>
      </div>
      {previewAttachment}
    </div>
  )
}
