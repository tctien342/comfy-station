'use client'

import { SimpleTransitionLayout } from '@/components/SimpleTranslation'
import { TooltipProvider } from '@/components/ui/tooltip'
import { usePathname } from '@/routing'
import { useSession } from 'next-auth/react'

const Layout: IComponent = ({ children }) => {
  const session = useSession()
  const pathname = usePathname()

  if (session.status !== 'authenticated') return null

  return (
    <div className='w-full h-full bg-white/10 dark:bg-black/10 backdrop-blur-sm border rounded-xl p-2'>
      <TooltipProvider>
        <SimpleTransitionLayout deps={[pathname]} className='w-full h-full flex space-x-2'>
          {children}
        </SimpleTransitionLayout>
      </TooltipProvider>
    </div>
  )
}

export default Layout
