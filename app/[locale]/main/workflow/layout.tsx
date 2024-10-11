'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useStorageState } from '@/hooks/useStorageState'
import { TaskHistory } from './TaskHistory'

const Layout: IComponent = ({ children }) => {
  const [viewMode, setViewMode] = useStorageState('workflow_view_mode', 'history')
  return (
    <Tabs
      value={viewMode}
      onValueChange={setViewMode}
      className='w-full h-full flex relative items-center justify-center'
    >
      <TabsList className='absolute bottom-4 z-10 shadow'>
        <TabsTrigger value='history'>History</TabsTrigger>
        <TabsTrigger value='visualize'>Gallery</TabsTrigger>
      </TabsList>
      <TabsContent value='history' className='mt-0 w-full h-full relative'>
        <TaskHistory />
      </TabsContent>
      <TabsContent value='visualize' className='w-full h-full mt-0 z-0 relative'>
        {children}
      </TabsContent>
    </Tabs>
  )
}

export default Layout
