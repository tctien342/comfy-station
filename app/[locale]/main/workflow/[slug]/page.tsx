'use client'

import { ImageGallery } from '@/components/ImageGallery'
import { useCurrentRoute } from '@/hooks/useCurrentRoute'
import { trpc } from '@/utils/trpc'

// We will put the workflow map in here
export default function Map() {
  const { slug } = useCurrentRoute()
  const infoLoader = trpc.workflow.attachments.useInfiniteQuery(
    {
      workflowId: slug!,
      limit: 20
    },
    { getNextPageParam: (lastPage) => lastPage.nextCursor, enabled: !!slug }
  )

  const runningTask = trpc.workflowTask.getRunning.useQuery(
    {
      workflowId: slug!
    },
    {
      enabled: !!slug
    }
  )

  trpc.watch.workflow.useSubscription(slug!, {
    onData: () => {
      infoLoader.refetch()
      runningTask.refetch()
    },
    enabled: !!slug
  })

  const pending = runningTask.data ? runningTask.data.map(() => ({ loading: true }) as const) : []
  const images = infoLoader.data ? infoLoader.data.pages.flatMap((d) => d.items) : []

  console.log({
    pending,
    images
  })

  return (
    <div className='absolute top-0 left-0 w-full h-full flex-1 flex-wrap gap-2 shadow-inner'>
      <ImageGallery
        rows={[...pending, ...images]}
        hasNextPage={infoLoader.hasNextPage}
        isFetchingNextPage={infoLoader.isFetchingNextPage}
        onFetchMore={infoLoader.fetchNextPage}
      />
    </div>
  )
}
