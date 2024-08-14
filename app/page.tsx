'use client'

import { Node } from '@/entities/node'
import { trpc } from '@/utils/trpc'
import { useEffect, useState } from 'react'

export default function Home() {
  const { data, refetch } = trpc.hello.list.useQuery()
  trpc.hello.nodeUltilization.useSubscription(undefined, {
    onData: (data) => {
      if (data.type === 'websocket') {
      }
      refetch()
    }
  })
  trpc.hello.nodeStatus.useSubscription(undefined, {
    onData: (data) => {
      console.log(data)
    }
  })

  const addServer = trpc.hello.addServer.useMutation()

  const handleAddServer = async () => {
    addServer.mutate({ host: 'https://sv2.taoanh.550studios.com', username: 'the550', password: 'anhem550' })
  }

  const getNodeName = (host: string) => {
    const url = new URL(host)
    const domain = url.hostname
    const mainpart = domain.split('.').slice(0, -1).join(' ').toUpperCase()
    return mainpart
  }

  return (
    <main className='flex h-screen w-full flex-col items-center justify-center p-6 gap-2'>
      <div className='w-full flex flex-row h-full shadow rounded-2xl border divide-x'>
        <div className='w-full h-full p-4'>
          <span className='font-bold text-zinc-700'>WORKFLOW MANAGEMENT</span>
        </div>
        <div className='w-1/4 h-full p-4 flex flex-col gap-2'>
          <span className='font-bold text-zinc-700'>NODE MANAGEMENT</span>
          <div className='flex-auto overflow-auto flex flex-col gap-1'>
            {data?.map((node) => {
              return (
                <div key={node.uuid} className='w-full border p-1 rounded-lg'>
                  <span className='font-bold text-sm text-zinc-600'>{getNodeName(node.host)}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </main>
  )
}
