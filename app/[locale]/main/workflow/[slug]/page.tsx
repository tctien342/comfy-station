'use client'

import { ImageGallery } from '@/components/ImageGallery'
import { useCurrentRoute } from '@/hooks/useCurrentRoute'
import { useDynamicValue } from '@/hooks/useDynamicValue'
import { trpc } from '@/utils/trpc'

export default function WorkflowGallery() {
  const { slug } = useCurrentRoute()
  const taskInfo = trpc.workflow.get.useQuery(slug!, { enabled: !!slug })
  const infoLoader = trpc.workflow.attachments.useInfiniteQuery(
    {
      workflowId: slug!,
      limit: 20
    },
    { getNextPageParam: (lastPage) => lastPage.nextCursor, enabled: !!slug }
  )
  const dyn = useDynamicValue()

  const avatarSetter = trpc.workflow.setAvatar.useMutation()

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

  const handlePressFavorite = async (imageId: string) => {
    await avatarSetter.mutateAsync({
      workflowId: slug!,
      attachmentId: imageId
    })
    await taskInfo.refetch()
  }

  return (
    <div className='absolute top-0 left-0 w-full h-full flex-1 flex-wrap gap-2 shadow-inner'>
      <ImageGallery
        imgPerRow={dyn([2, 2, 3])}
        rows={[...pending, ...images]}
        favoriteIds={[taskInfo.data?.avatar?.id ?? '']}
        onPressFavorite={handlePressFavorite}
        hasNextPage={infoLoader.hasNextPage}
        isFetchingNextPage={infoLoader.isFetchingNextPage}
        onFetchMore={infoLoader.fetchNextPage}
      />
    </div>
  )
}
