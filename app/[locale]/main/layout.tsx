'use client'

import { SimpleTransitionLayout } from '@/components/SimpleTranslation'
import { TooltipProvider } from '@/components/ui/tooltip'
import { usePathname } from '@/routing'
import { useSession } from 'next-auth/react'
import { AdminSideInfo } from './AdminSideInfo'
import { TopBar } from './TopBar'
import { EUserRole } from '@/entities/enum'
import { useCurrentRoute } from '@/hooks/useCurrentRoute'
import { WorkflowSidePicker } from './WorkflowSidePicker'

const Layout: IComponent = ({ children }) => {
  const session = useSession()
  const { pathname, routeConf } = useCurrentRoute()

  const isAdmin = session.data?.user?.role === EUserRole.Admin
  const isExecutePage = routeConf?.key === 'execute'

  if (session.status !== 'authenticated') return null

  return (
    <div className='w-full h-full bg-white/10 dark:bg-black/10 backdrop-blur-sm border rounded-xl p-2'>
      <TooltipProvider>
        <div className='w-full h-full flex space-x-2'>
          {isExecutePage && (
            <div className='w-1/4 min-w-[290px] max-w-[360px] h-full bg-background border rounded-lg'>
              <WorkflowSidePicker />
            </div>
          )}
          <div
            id='main-content'
            className='flex-auto flex flex-col h-full overflow-hidden bg-background border rounded-lg transition-all duration-300 relative'
          >
            <TopBar />
            <SimpleTransitionLayout deps={[routeConf?.key || '']} className='flex-1'>
              {children}
            </SimpleTransitionLayout>
          </div>
          {isAdmin && (
            <div className='w-1/4 min-w-[290px] max-w-[360px] h-full bg-background border rounded-lg'>
              <AdminSideInfo />
            </div>
          )}
        </div>
      </TooltipProvider>
    </div>
  )
}

export default Layout
