'use client'

import { AdminSideInfo } from './AdminSideInfo'
import { TopBar } from './TopBar'

/**
 * Current redirect to /auth/basic
 */
export default function Home() {
  return (
    <>
      <div className='flex-auto flex flex-col h-full bg-background border rounded-lg'>
        <TopBar />
      </div>
      <div className='w-1/4 min-w-[290px] max-w-[360px] h-full bg-background border rounded-lg'>
        <AdminSideInfo />
      </div>
    </>
  )
}
