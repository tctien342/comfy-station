'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useStorageState } from '@/hooks/useStorageState'
import { TaskHistory } from './TaskHistory'
import { Portal } from '@/components/PortalWrapper'

const Layout: IComponent = ({ children }) => {
  const [viewMode, setViewMode] = useStorageState('workflow_view_mode', 'history')
  return (
    <Tabs
      value={viewMode}
      onValueChange={setViewMode}
      className='w-full h-full flex relative items-center justify-center'
    >
      <Portal targetRef={'main-content'} waitForTarget>
        <div
          className='absolute left-[50%] -bottom-4 z-10 shadow p-1 backdrop-blur-lg bg-background/40 rounded-lg'
          style={{
            transform: 'translateX(-50%)'
          }}
        >
          <TabsList>
            <TabsTrigger value='history'>History</TabsTrigger>
            <TabsTrigger value='visualize'>Gallery</TabsTrigger>
          </TabsList>
        </div>
      </Portal>
      <TabsContent value='history' className='mt-0 w-full h-full relative'>
        <TaskHistory />
      </TabsContent>
      <TabsContent value='visualize' className='w-full h-full mt-0 z-0 relative !ring-0'>
        {children}
      </TabsContent>
    </Tabs>
  )
}

export default Layout
