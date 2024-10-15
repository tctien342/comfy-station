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
import { useDynamicValue } from '@/hooks/useDynamicValue'
import { useMemo } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ChartBarIcon, ListIcon, PlaySquare } from 'lucide-react'

const Layout: IComponent = ({ children }) => {
  const session = useSession()
  const { routeConf } = useCurrentRoute()
  const dyn = useDynamicValue()

  const isAdmin = session.data?.user?.role === EUserRole.Admin
  const isExecutePage = routeConf?.key === 'execute'

  const renderDesktopView = useMemo(() => {
    return (
      <div className='w-full h-full flex flex-col md:flex-row space-x-2 overflow-hidden'>
        {isExecutePage && (
          <div className='w-full md:w-1/4 min-w-[290px] md:max-w-[360px] min-h-full bg-background border rounded-lg'>
            <WorkflowSidePicker />
          </div>
        )}
        <div
          id='main-content'
          className='flex-auto hidden md:flex flex-col h-full overflow-hidden bg-background border rounded-lg transition-all duration-300 relative'
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
    )
  }, [children, isAdmin, isExecutePage, routeConf?.key])

  const renderMobileView = useMemo(() => {
    return (
      <div className='w-full h-full flex flex-col md:flex-row space-x-2 overflow-x-hidden overflow-y-auto'>
        <Tabs defaultValue='visualize' className='w-full h-full flex flex-col relative'>
          <TabsContent value='history' className='w-full flex-1 bg-background border rounded-lg mt-0 pb-14'>
            <WorkflowSidePicker />
          </TabsContent>
          <TabsContent value='visualize' className='w-full flex-1 bg-background border rounded-lg mt-0 relative pb-14'>
            <div
              id='main-content'
              className='flex flex-col h-full overflow-hidden bg-background md:border md:rounded-lg transition-all duration-300 relative'
            >
              <TopBar />
              <SimpleTransitionLayout deps={[routeConf?.key || '']} className='flex-1'>
                {children}
              </SimpleTransitionLayout>
            </div>
          </TabsContent>
          {isAdmin && (
            <TabsContent value='admin-pannel' className='w-full flex-1 bg-background border rounded-lg mt-0 pb-14'>
              <AdminSideInfo />
            </TabsContent>
          )}
          <TabsList className='bg-background h-fit fixed bottom-0 w-full rounded-none'>
            <TabsTrigger value='history' className='py-2 data-[state=active]:shadow-none'>
              <div className='py-2 flex gap-2 items-center'>
                <PlaySquare width={16} height={16} /> Execute
              </div>
            </TabsTrigger>
            <TabsTrigger value='visualize' className='py-2 data-[state=active]:shadow-none'>
              <div className='py-2 flex gap-2 items-center'>
                <ListIcon width={16} height={16} /> {isExecutePage ? 'History' : 'Workflows'}
              </div>
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value='admin-pannel' className='py-2 data-[state=active]:shadow-none'>
                <div className='py-2 flex gap-2 items-center'>
                  <ChartBarIcon width={16} height={16} /> Admin
                </div>
              </TabsTrigger>
            )}
          </TabsList>
        </Tabs>
      </div>
    )
  }, [children, isAdmin, isExecutePage, routeConf?.key])

  if (session.status !== 'authenticated') return null
  return (
    <div className='w-full h-full bg-white/10 dark:bg-black/10 backdrop-blur-sm md:border md:rounded-xl md:p-2'>
      <TooltipProvider>{dyn([renderMobileView, renderDesktopView, renderDesktopView])}</TooltipProvider>
    </div>
  )
}

export default Layout
