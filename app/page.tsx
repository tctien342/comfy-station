'use client'

import { trpc } from '@/utils/trpc'

export default function Home() {
  trpc.hello.nodeUltilization.useSubscription(undefined, {
    onData: (data) => {
      console.log(data)
    }
  })

  const addServer = trpc.hello.addServer.useMutation()

  const handleAddServer = async () => {
    addServer.mutate({ host: '' })
  }

  return (
    <main className='flex h-screen w-full flex-col items-center justify-center p-6 gap-2'>
      <div className='w-full flex flex-row h-full shadow rounded-2xl border divide-x'>
        <div className='w-full h-full p-4'>
          <span className='font-bold text-zinc-700'>WORKFLOW MANAGEMENT</span>
        </div>
        <div className='w-1/4 h-full p-4'>
          <span className='font-bold text-zinc-700'>NODE MANAGEMENT</span>
          <button onClick={handleAddServer}>Click Me</button>
        </div>
      </div>
    </main>
  )
}
