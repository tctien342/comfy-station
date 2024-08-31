'use client'

import { AdminSideInfo } from './AdminSideInfo'

/**
 * Current redirect to /auth/basic
 */
export default function Home() {
  return (
    <>
      <div className='flex-auto h-full bg-background border rounded-lg'></div>
      <div className='w-1/4 min-w-[260px] h-full bg-background border rounded-lg'>
        <AdminSideInfo />
      </div>
    </>
  )
}
