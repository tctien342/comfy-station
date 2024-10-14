import { AddWorkflowDialog } from '@/components/dialogs/AddWorkflowDialog'
import { SimpleTransitionLayout } from '@/components/SimpleTranslation'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { UserInfomation } from '@/components/UserInformation'
import { EUserRole } from '@/entities/enum'
import { useCurrentRoute } from '@/hooks/useCurrentRoute'
import { trpc } from '@/utils/trpc'
import { SearchIcon } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useMemo } from 'react'

export const TopBar: IComponent = () => {
  const { data: session } = useSession()
  const { routeConf, router } = useCurrentRoute()

  const Icon = routeConf?.SubIcon

  const role = session?.user.role || EUserRole.User

  const renderToolBox = useMemo(() => {
    switch (routeConf?.key) {
      case 'home':
        return (
          <>
            <Button size='icon' variant='secondary' className='rounded-full'>
              <SearchIcon size={16} />
            </Button>
            {role > EUserRole.User && <AddWorkflowDialog />}
          </>
        )
      case 'execute': {
        return (
          <>
            <Button size='icon' variant='secondary' className='rounded-full'>
              <SearchIcon size={16} />
            </Button>
          </>
        )
      }
    }
  }, [role, routeConf?.key])

  return (
    <div className='w-full py-2 px-3 flex items-center'>
      <SimpleTransitionLayout deps={[routeConf?.title ?? '']} className='w-full flex items-center'>
        {!!Icon && (
          <Button
            disabled={!routeConf?.backUrl}
            onClick={() => {
              if (routeConf?.backUrl) router.push(routeConf.backUrl)
            }}
            variant='ghost'
            size='icon'
            className='mr-2'
          >
            <Icon width={16} height={16} />
          </Button>
        )}
        <h1 className='text-sm md:text-xl font-black uppercase'>{routeConf?.title}</h1>
      </SimpleTransitionLayout>
      <div className='flex-auto items-center justify-end flex gap-2'>{renderToolBox}</div>
      {role < EUserRole.Admin && (
        <div>
          <UserInfomation />
        </div>
      )}
    </div>
  )
}
