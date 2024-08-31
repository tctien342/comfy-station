import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { BellIcon, ExitIcon } from '@radix-ui/react-icons'
import { signOut, useSession } from 'next-auth/react'

export const AdminSideInfo: IComponent = () => {
  const session = useSession()
  const handlePressLogout = () => {
    signOut()
  }
  return (
    <div className='w-full h-full flex flex-col items-start'>
      <div className='w-full flex gap-2 items-center p-2'>
        <DropdownMenu>
          <DropdownMenuTrigger className='flex items-center'>
            <Avatar>
              <AvatarFallback>TC</AvatarFallback>
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
      <div className='flex-auto w-full shadow-inner border bg-secondary'></div>
    </div>
  )
}
