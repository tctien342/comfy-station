'use client'

import { trpc } from '@/utils/trpc'
import { AdminSideInfo } from './AdminSideInfo'

/**
 * Current redirect to /auth/basic
 */
export default function Home() {
  const { data } = trpc.hello.hello.useQuery({ text: 'good' })
  return (
    <>
      <div className='flex-auto h-full bg-background border rounded-lg'></div>
      <div className='w-1/4 min-w-[290px] max-w-[360px] h-full bg-background border rounded-lg'>
        <AdminSideInfo />
      </div>
    </>
  )
}
