import { WorkflowCard } from '@/components/WorkflowCard'
import { EGlobalEvent, useGlobalEvent } from '@/hooks/useGlobalEvent'
import { trpc } from '@/utils/trpc'
import { useMemo } from 'react'

export const Content: IComponent = () => {
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
