import { TaskBar } from '@/components/TaskBar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ETaskStatus } from '@/entities/enum'
import { trpc } from '@/utils/trpc'
import { BellIcon, ExitIcon } from '@radix-ui/react-icons'
import { signOut, useSession } from 'next-auth/react'

export const AdminSideInfo: IComponent = () => {
  const session = useSession()
  const { data: tasks, isLoading: isTaskLoading } = trpc.task.lastTasks.useQuery({ limit: 30 })
  const { data: avatarInfo } = trpc.attachment.get.useQuery({ id: session.data?.user?.avatar?.id || '' })

  const handlePressLogout = () => {
    signOut()
  }
  const shortUsername = (session.data?.user?.email || '?').split('@')[0].slice(0, 2).toUpperCase()
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
          <DropdownMenuContent>
            <DropdownMenuItem onClick={handlePressLogout}>
              <span className='min-w-[100px]'>Logout</span>
              <ExitIcon className='ml-2' width={16} height={16} />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button size='icon' variant='secondary' className='rounded-full ml-auto'>
          <BellIcon className='rounded-full' width={16} height={16} />
        </Button>
      </div>
      <div className='flex w-full flex-col gap-2 p-4'>
        <TaskBar loading={isTaskLoading} tasks={tasks || []} />
      </div>
      <div className='flex-auto w-full shadow-inner border bg-secondary'></div>
    </div>
  )
}
