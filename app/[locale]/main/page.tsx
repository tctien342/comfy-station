'use client'

import { trpc } from '@/utils/trpc'
import { EGlobalEvent, useGlobalEvent } from '@/hooks/useGlobalEvent'
import { WorkflowCard } from '@/components/WorkflowCard'
import { useMemo } from 'react'

/**
 * Current redirect to /auth/basic
 */
export default function Home() {
  const query = trpc.workflow.list.useInfiniteQuery(
    {
      limit: 10
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor
    }
  )

  useGlobalEvent(EGlobalEvent.RLOAD_WORKFLOW, () => {
    query.refetch()
  })

  const renderCards = useMemo(() => {
    const items = query.data?.pages.map((v) => v.items).flat()
    return items?.map((item, i) => <WorkflowCard data={item} key={item.id} />)
  }, [query.data])

  return <div className='w-full flex h-fit flex-wrap p-2 gap-2'>{renderCards}</div>
}
