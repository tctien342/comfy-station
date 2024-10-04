'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useStorageState } from '@/hooks/useStorageState'

const Layout: IComponent = ({ children }) => {
  const [viewMode, setViewMode] = useStorageState('workflow_view_mode', 'history')
  return (
    <Tabs
      value={viewMode}
      onValueChange={setViewMode}
      className='w-full h-full flex relative items-center justify-center'
    >
      <TabsList className='absolute bottom-4 z-10'>
        <TabsTrigger value='history'>History</TabsTrigger>
        <TabsTrigger value='visualize'>Visualize</TabsTrigger>
      </TabsList>
      <TabsContent value='history' className='mt-0'>Make changes to your account here.</TabsContent>
      <TabsContent value='visualize' className='w-full h-full mt-0'>
        {children}
      </TabsContent>
    </Tabs>
  )
}

export default Layout
