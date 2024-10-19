import { VirtualList } from '@/components/VirtualList'
import { trpc } from '@/utils/trpc'
import { TaskItem } from './TaskItem'
import { useToast } from '@/hooks/useToast'
import { WorkflowTask } from '@/entities/workflow_task'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

export const TaskHistory: IComponent = () => {
  const tasker = trpc.workflowTask.list.useInfiniteQuery(
    {
      limit: 10
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor
    }
  )

  const { toast } = useToast()
  const deletor = trpc.workflowTask.delete.useMutation()

  trpc.watch.historyList.useSubscription(undefined, {
    onData: () => tasker.refetch()
  })

  const handlePressDelete = async (data: WorkflowTask) => {
    await deletor.mutateAsync(data.id)
    toast({
      title: 'Workflow Deleted'
    })
  }

  const allRows = tasker.data ? tasker.data.pages.flatMap((d) => d.items).reverse() : []

  return (
    <VirtualList
      onFetchMore={tasker.fetchNextPage}
      hasNextPage={tasker.hasNextPage}
      isFetchingNextPage={tasker.isFetchingNextPage}
      items={allRows}
      style={{
        position: 'absolute',
        top: 0,
        width: '100%',
        height: '100%',
        boxShadow: 'inset 0 0 10px 0 rgba(0, 0, 0, 0.1)'
      }}
      renderEmpty={() => {
        return (
          <div className='flex flex-col text-center text-foreground/50'>
            <ExclamationTriangleIcon className='w-6 h-6 mx-auto my-2' />
            <span className='uppercase'>Task is empty</span>
            <p className='text-xs'>Create your first task to see the results</p>
          </div>
        )
      }}
      getItemKey={(item) => {
        return item.id
      }}
      estimateSize={() => 130}
      renderItem={(item) => {
        return <TaskItem data={item} onPressDelete={() => handlePressDelete(item)} deleting={deletor.isPending} />
      }}
      overscan={5}
    />
  )
}
