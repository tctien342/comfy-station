import { ClientInfoMonitoring } from '@/components/ClientInfoMonitoring'
import { AddClientDialog } from '@/components/dialogs/AddClientDialog'
import { MiniBadge } from '@/components/MiniBadge'
import { TaskBar } from '@/components/TaskBar'
import { TaskBigStat } from '@/components/TaskBigStat'
import { UserInfomation } from '@/components/UserInformation'
import { WorkflowTask } from '@/entities/workflow_task'
import { EGlobalEvent, useGlobalEvent } from '@/hooks/useGlobalEvent'
import { trpc } from '@/utils/trpc'
import { useState } from 'react'

export const AdminSideInfo: IComponent = () => {
  const [tasks, setTasks] = useState<WorkflowTask[]>()
  const [taskStats, setTaskStats] = useState<{ pending: number; executed: number }>()
  const [clientStats, setClientStats] = useState<{ online: number; offline: number; error: number }>()

  const { data: clients, refetch: reloadClients } = trpc.client.list.useQuery()

  trpc.task.lastTasks.useSubscription(
    { limit: 30 },
    {
      onData: (data) => {
        setTasks(data)
      }
    }
  )
  trpc.client.overview.useSubscription(undefined, {
    onData: (data) => {
      setClientStats(data)
    }
  })

  trpc.task.countStats.useSubscription(undefined, {
    onData: (data) => {
      setTaskStats(data)
    }
  })

  useGlobalEvent(EGlobalEvent.RLOAD_CLIENTS, reloadClients)

  return (
    <div className='w-full h-full flex flex-col items-start'>
      <UserInfomation />
      <div className='flex w-full flex-col gap-2 p-4'>
        <div className='flex justify-around gap-2'>
          <TaskBigStat
            loading={!taskStats}
            title='TASK PENDING'
            count={taskStats?.pending || 0}
            activeNumber={{
              className: 'text-orange-500'
            }}
          />
          <TaskBigStat loading={!taskStats} title='TASK EXECUTED' count={taskStats?.executed || 0} />
        </div>
        <TaskBar loading={tasks === undefined} tasks={tasks || []} />
      </div>
      <div className='flex-auto w-full shadow-inner border-t border-b flex flex-col divide-y-[1px]'>
        {clients?.map((client) => <ClientInfoMonitoring key={client.id} client={client} />)}
      </div>
      <div className='flex gap-2 p-2 w-full items-center'>
        {!!clientStats && (
          <>
            <MiniBadge title='Online' dotClassName='bg-green-500' count={clientStats.online} />
            <MiniBadge title='Offline' dotClassName='bg-zinc-600' count={clientStats.offline} />
            <MiniBadge title='Error' dotClassName='bg-red-500' count={clientStats.error} />
          </>
        )}
        <AddClientDialog />
      </div>
    </div>
  )
}
