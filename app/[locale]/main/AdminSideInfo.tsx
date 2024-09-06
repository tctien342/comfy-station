import { ClientInfoMonitoring } from '@/components/ClientInfoMonitoring'
import { AddClientDialog } from '@/components/dialogs/AddClientDialog'
import { MiniBadge } from '@/components/MiniBadge'
import { TaskBar } from '@/components/TaskBar'
import { TaskBigStat } from '@/components/TaskBigStat'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useAppStore } from '@/states/app'
import { trpc } from '@/utils/trpc'
import { MoonIcon, PlusIcon, SunIcon } from '@heroicons/react/24/outline'
import { BellIcon, ExitIcon } from '@radix-ui/react-icons'
import { signOut, useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

export const AdminSideInfo: IComponent = () => {
  const session = useSession()
  const { theme, setTheme } = useAppStore()
  const [taskStats, setTaskStats] = useState<{ pending: number; executed: number }>()
  const [clientStats, setClientStats] = useState<{ online: number; offline: number; error: number }>()

  const { data: tasks, isLoading: isTaskLoading, refetch: reloadTasks } = trpc.task.lastTasks.useQuery({ limit: 30 })
  const { data: clients } = trpc.client.list.useQuery()
  const { data: avatarInfo } = trpc.attachment.get.useQuery({ id: session.data?.user?.avatar?.id || '' })

  trpc.client.clientOverviewStat.useSubscription(undefined, {
    onData: (data) => {
      setClientStats(data)
    }
  })

  trpc.task.countStats.useSubscription(undefined, {
    onData: (data) => {
      setTaskStats(data)
    }
  })

  const handlePressLogout = () => {
    signOut()
  }

  const shortUsername = (session.data?.user?.email || '?').split('@')[0].slice(0, 2).toUpperCase()

  const toggleTheme = () => {
    const choice = ['system', 'light', 'dark']
    const crr = choice.indexOf(theme)
    const next = (crr + 1) % 3
    setTheme(choice[next] as any)
  }

  useEffect(() => {
    reloadTasks()
  }, [reloadTasks, taskStats])

  return (
    <div className='w-full h-full flex flex-col items-start'>
      <div className='w-full flex gap-2 items-center p-2'>
        <DropdownMenu>
          <DropdownMenuTrigger className='flex items-center'>
            <Avatar>
              <AvatarImage src={avatarInfo?.url || undefined} alt={session.data?.user?.email || '@user'} />
              <AvatarFallback>{shortUsername}</AvatarFallback>
            </Avatar>
            <span className='px-2'>{session.data?.user?.email}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='start' sideOffset={10}>
            <DropdownMenuItem onClick={toggleTheme} className='min-w-[100px] flex justify-between cursor-pointer'>
              <span>Theme</span>
              {theme === 'dark' && <MoonIcon className='ml-2' width={16} height={16} />}
              {theme === 'light' && <SunIcon className='ml-2' width={16} height={16} />}
              {theme === 'system' && <span className='text-xs'>AUTO</span>}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handlePressLogout} className='min-w-[100px] flex justify-between cursor-pointer'>
              <span>Logout</span>
              <ExitIcon className='ml-2' width={16} height={16} />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button size='icon' variant='secondary' className='rounded-full ml-auto'>
          <BellIcon className='rounded-full' width={16} height={16} />
        </Button>
      </div>
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
        <TaskBar loading={isTaskLoading} tasks={tasks || []} />
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
