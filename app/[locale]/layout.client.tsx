'use client'

import { LoadingSVG } from '@/components/svg/LoadingSVG'
import { Card } from '@/components/ui/card'
import { Toaster } from '@/components/ui/toaster'
import useDarkMode from '@/hooks/useDarkmode'
import { useRouter } from '@/routing'
import { ReactFlowProvider } from '@xyflow/react'
import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { PhotoProvider } from 'react-photo-view'

import 'react-photo-view/dist/react-photo-view.css'

export const ClientLayout: IComponent = ({ children }) => {
  const pathname = usePathname()
  const session = useSession()
  const router = useRouter()
  const isDarkMode = useDarkMode()

  useEffect(() => {
    const root = document.getElementsByTagName('html')?.[0]
    if (root) {
      if (isDarkMode) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    }
  }, [isDarkMode])

  useEffect(() => {
    if (session.status === 'authenticated' && !pathname.includes('/main')) {
      router.replace('/main')
    }
    if (session.status === 'unauthenticated' && !pathname.includes('/auth')) {
      router.replace('/auth/basic')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session])

  return (
    <>
      {session.status === 'loading' && (
        <div className='top-0 left-0 fixed w-screen h-screen z-10 bg-popover/50 flex justify-end items-end p-8'>
          <Card className='p-4 flex gap-4 items-center bg-background'>
            <LoadingSVG width={32} height={32} />
          </Card>
        </div>
      )}
      <ReactFlowProvider>
        <PhotoProvider
          loadingElement={
            <div className='flex justify-center items-center h-full w-full'>
              <LoadingSVG width={32} height={32} />
            </div>
          }
        >
          {children}
        </PhotoProvider>
      </ReactFlowProvider>
      <Toaster />
    </>
  )
}
