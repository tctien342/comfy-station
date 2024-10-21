import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar'
import { ExitIcon } from '@radix-ui/react-icons'
import { MoonIcon, SunIcon, BellIcon } from 'lucide-react'
import { Button } from './ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'
import { signOut, useSession } from 'next-auth/react'
import { trpc } from '@/utils/trpc'
import { useAppStore } from '@/states/app'
import { EUserRole } from '@/entities/enum'
import { cn } from '@/lib/utils'

export const UserInfomation: IComponent = () => {
  const session = useSession()
  const { theme, setTheme } = useAppStore()
  const shortUsername = (session.data?.user?.email || '?').split('@')[0].slice(0, 2).toUpperCase()
  const { data: avatarInfo } = trpc.attachment.get.useQuery({ id: session.data?.user?.avatar?.id || '' })

  const handlePressLogout = () => {
    signOut({
      callbackUrl: '/',
      redirect: true
    })
  }

  const toggleTheme = () => {
    const choice = ['system', 'light', 'dark']
    const crr = choice.indexOf(theme)
    const next = (crr + 1) % 3
    setTheme(choice[next] as any)
  }

  const notAdmin = session.data?.user?.role !== EUserRole.Admin
  const email = session.data?.user?.email
  const shortEmail = email?.split('@')[0]

  return (
    <div className='w-full flex gap-2 items-center px-2 md:py-2'>
      <DropdownMenu>
        <DropdownMenuTrigger className='flex items-center order-1'>
          <Avatar className='order-1'>
            <AvatarImage src={avatarInfo?.raw?.url || undefined} alt={session.data?.user?.email || '@user'} />
            <AvatarFallback>{shortUsername}</AvatarFallback>
          </Avatar>
          <span
            className={cn('px-2 hidden md:block', {
              'order-0': notAdmin,
              'order-2': !notAdmin
            })}
          >
            {session.data?.user?.email}
          </span>
          <span
            className={cn('px-2 md:hidden block', {
              'order-0': notAdmin,
              'order-2': !notAdmin
            })}
          >
            @{shortEmail}
          </span>
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
      <Button
        size='icon'
        variant='secondary'
        className={cn('rounded-full ml-auto', {
          'order-0': notAdmin,
          'order-2': !notAdmin
        })}
      >
        <BellIcon className='rounded-full' width={16} height={16} />
      </Button>
    </div>
  )
}
