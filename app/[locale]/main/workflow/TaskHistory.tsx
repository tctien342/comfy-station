import { AttachmentImage } from '@/components/AttachmentImage'
import { MiniBadge } from '@/components/MiniBadge'
import { Label } from '@/components/ui/label'
import { VirtualList } from '@/components/VirtualList'
import { ETaskStatus, EValueType } from '@/entities/enum'
import { WorkflowTask } from '@/entities/workflow_task'
import { trpc } from '@/utils/trpc'
import { Hourglass } from 'lucide-react'
import { useMemo } from 'react'

const TaskItem: IComponent<{
  data: WorkflowTask
}> = ({ data }) => {
  const { data: task } = trpc.workflowTask.detail.useQuery(data.id, {
    enabled: !!data.id
  })
  const runningTime = useMemo(() => {
    if (!!task?.events.length) {
      // Only get the last queuing event, this is the last time the task was queued
      // Incase our server is rebooted and all task are requeued, we will get the last time it was queued
      const lastQueuingEvent = [...task.events].reverse().find((e) => e.status === ETaskStatus.Pending)
      if (!lastQueuingEvent) return -1

      const workArr = [...task.events]
      const queueIndex = workArr.indexOf(lastQueuingEvent)
      const searchArr = workArr.slice(queueIndex)
      const startRunningEvent = searchArr.find((e) => e.status === ETaskStatus.Running)
      const stoppRunningEvent = searchArr.find((e) => e.status === ETaskStatus.Success)
      if (startRunningEvent && stoppRunningEvent) {
        const startDate = new Date(stoppRunningEvent.createdAt)
        const stopDate = new Date(startRunningEvent.createdAt)
        return Math.round((startDate.getTime() - stopDate.getTime()) / 1000)
      }
    }
    return -1
  }, [task?.events])

  const previewAttachment = useMemo(() => {
    const finishedEv = task?.events.find((e) => !!e.data)
    if (!finishedEv) {
      return null
    }
    const attachment = Object.values(finishedEv.data!).find((d) => d.type === EValueType.Image)
    if (!attachment) {
      return null
    }
    return (
      <AttachmentImage
        className='h-32 rounded-none w-fit !aspect-square object-cover'
        shortName='NA'
        data={{ id: attachment.value[0] as string }}
      />
    )
  }, [task?.events])

  const shortName = task?.trigger.user?.email?.split('@')[0] ?? '-'
  return (
    <div className='w-full flex'>
      <div className='flex-1 flex-col px-1 py-3'>
        <Label className='text-base font-semibold'>{task?.workflow.name}</Label>
        <p className='text-sm'>ID: {task?.id}</p>
        <p className='text-sm'>
          Trigger by: @{shortName}, {task?.createdAt.toLocaleString()}
        </p>
        <div className='w-full flex flex-wrap gap-2 mt-2'>
          {task?.status === ETaskStatus.Failed && <MiniBadge dotClassName='bg-red-500' title='Failed' />}
          {task?.status === ETaskStatus.Queuing && <MiniBadge dotClassName='bg-gray-200' title='Queuing' />}
          {task?.status === ETaskStatus.Pending && <MiniBadge dotClassName='bg-gray-500' title='PENDING' />}
          {task?.status === ETaskStatus.Running && <MiniBadge dotClassName='bg-orange-500' title='Running' />}
          {task?.status === ETaskStatus.Success && <MiniBadge dotClassName='bg-green-500' title='Success' />}
          {runningTime !== -1 && <MiniBadge Icon={Hourglass} title='Take' count={`${runningTime}s`} />}
        </div>
      </div>
      {previewAttachment}
    </div>
  )
}

export const TaskHistory: IComponent = () => {
  const tasker = trpc.workflowTask.list.useInfiniteQuery(
    {
      limit: 20
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor
    }
  )

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
        height: '100%'
      }}
      getItemKey={(item) => {
        return item.id
      }}
      estimateSize={() => 100}
      renderItem={(item) => {
        return <TaskItem data={item} />
      }}
      overscan={5}
    />
  )
}
