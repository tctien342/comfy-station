'use client'

import { LoadingSVG } from '@/components/svg/LoadingSVG'
import { Card } from '@/components/ui/card'
import { usePathname, useRouter } from '@/routing'
import { SessionProvider, useSession } from 'next-auth/react'

import type React from 'react'
import { use, useEffect, type PropsWithChildren } from 'react'

export const AuthLayout: React.FC<PropsWithChildren> = ({ children }) => {
  const pathname = usePathname()
  const session = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session.status === 'authenticated' && !pathname.includes('/main')) {
      router.replace('/main')
    }
    if (session.status === 'unauthenticated' && !pathname.includes('/auth')) {
      router.replace('/auth/basic')
    }
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
      {children}
    </>
  )
}
