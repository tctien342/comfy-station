'use client'

import { trpc } from '@/utils/trpc'
import { useState } from 'react'

export default function Home() {
  const [count, setCount] = useState('')

  trpc.hello.helloWs.useSubscription(undefined, {
    onData: (data) => {
      setCount(data)
    }
  })

  return (
    <main className='flex h-screen w-full flex-col items-center justify-center p-24 gap-2'>
      <span className='text-gray-300'>COUNTER FROM THE BACKEND</span>
      <p className='text-5xl text-gray-600 uppercase font-bold'>{count}</p>
      <span className='text-gray-300'>
        Whenever it changed, mean <strong className='text-blue-500'>tRPC</strong> is worked
      </span>
    </main>
  )
}
