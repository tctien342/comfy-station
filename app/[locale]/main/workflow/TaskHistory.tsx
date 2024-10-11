import { AttachmentImage } from '@/components/AttachmentImage'
import { MiniBadge } from '@/components/MiniBadge'
import { LoadingSVG } from '@/components/svg/LoadingSVG'
import { Label } from '@/components/ui/label'
import { VirtualList } from '@/components/VirtualList'
import { ETaskStatus, EValueType } from '@/entities/enum'
import { WorkflowTask } from '@/entities/workflow_task'
import { trpc } from '@/utils/trpc'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { Hourglass, Repeat } from 'lucide-react'
import { useMemo } from 'react'

const TaskItem: IComponent<{
  data: WorkflowTask
}> = ({ data }) => {
  const { data: task, refetch } = trpc.workflowTask.detail.useQuery(data.id, {
    enabled: !!data.id
  })
  trpc.watch.historyItem.useSubscription(data.id, {
    onData: () => refetch()
  })
  const isLoading = useMemo(() => {
    if (!task) return true
    const searchLoading = (wTask: WorkflowTask) => {
      return !(
        wTask.events.find((e) => e.status === ETaskStatus.Failed) ||
        wTask.events.find((e) => e.status === ETaskStatus.Success && e.details === 'FINISHED')
      )
    }
    return searchLoading(task) || task.subTasks?.find(searchLoading)
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
    const statues = [task?.status, ...(task?.subTasks.map((t) => t.status) || [])]
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
    const finishedEv = task?.events.find((e) => !!e.data)
    const attachment = Object.values(finishedEv?.data || {}).find((d) => d.type === EValueType.Image)
    if (!attachment) {
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
  }, [isLoading, task?.events])

  const shortName = task?.trigger.user?.email?.split('@')[0] ?? '-'

  if (!task) return null

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

export const TaskHistory: IComponent = () => {
  const tasker = trpc.workflowTask.list.useInfiniteQuery(
    {
      limit: 10
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor
    }
  )

  trpc.watch.historyList.useSubscription(undefined, {
    onData: () => tasker.refetch()
  })

  const allRows = tasker.data ? tasker.data.pages.flatMap((d) => d.items).reverse() : []

  return (
    <VirtualList
      onFetchMore={tasker.fetchNextPage}
      hasNextPage={tasker.hasNextPage}
      isFetchingNextPage={tasker.isFetchingNextPage}
      items={allRows}
      style={{
        position: 'absolute',
        top: 0,
        width: '100%',
        height: '100%',
        boxShadow: 'inset 0 0 10px 0 rgba(0, 0, 0, 0.1)'
      }}
      getItemKey={(item) => {
        return item.id
      }}
      estimateSize={() => 130}
      renderItem={(item) => {
        return <TaskItem data={item} />
      }}
      overscan={5}
    />
  )
}
