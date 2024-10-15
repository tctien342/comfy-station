import { Workflow } from '@/entities/workflow'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card'
import { trpc } from '@/utils/trpc'
import { MiniBadge } from './MiniBadge'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from './ui/context-menu'
import { PenBox, Trash2 } from 'lucide-react'
import { LoadableButton } from './LoadableButton'
import { useToast } from '@/hooks/useToast'
import { dispatchGlobalEvent, EGlobalEvent } from '@/hooks/useGlobalEvent'
import { useRouter } from 'next/navigation'
import { AttachmentImage } from './AttachmentImage'
import { useState } from 'react'

export const WorkflowCard: IComponent<{
  data: Workflow
}> = ({ data }) => {
  const stator = trpc.workflowTask.workflowTaskStats.useQuery(data.id)
  const deletor = trpc.workflow.delete.useMutation()
  const router = useRouter()
  const { toast } = useToast()

  const handlePressDelete = async () => {
    await deletor.mutateAsync(data.id)
    toast({
      title: 'Workflow Deleted'
    })
    dispatchGlobalEvent(EGlobalEvent.RLOAD_WORKFLOW)
  }

  trpc.watch.workflow.useSubscription(data.id, {
    onData: () => stator.refetch()
  })

  return (
    <ContextMenu>
      <ContextMenuTrigger className='h-fit flex-1 min-w-[240px] md:max-w-[320px] w-full !pb-0 shadow rounded-xl'>
        <Card
          onClick={() => router.push(`/main/workflow/${data.id}`)}
          className='shadow-none cursor-pointer hover:shadow-lg transition-all overflow-hidden'
        >
          <CardHeader className='w-full aspect-video bg-secondary rounded-b-xl shadow-inner relative p-0'>
            <div className='absolute right-2 top-2 z-10'>
              <MiniBadge
                dotClassName={stator.data?.isExecuting ? 'bg-orange-500' : 'bg-gray-500'}
                className='bg-white text-zinc-800'
                title={stator.data?.isExecuting ? 'Executing' : 'Idle'}
              />
            </div>
            <AttachmentImage className='w-full h-full !mt-0 !p-0' mode='avatar' data={data.avatar} shortName='N/A' />
          </CardHeader>
          <CardContent className='pt-4 pb-2 px-2'>
            <CardTitle>{data.name}</CardTitle>
            <CardDescription className='line-clamp-2 h-10'>{data.description}</CardDescription>
          </CardContent>
          <CardFooter className='px-2 pb-2 flex gap-1'>
            <MiniBadge dotClassName='bg-green-500' title='Executed' count={stator.data?.success} />
            <MiniBadge dotClassName='bg-destructive' title='Failed' count={stator.data?.failed} />
            <p className='text-sm ml-auto text-border'>@{data.author.email.split('@')[0]}</p>
          </CardFooter>
        </Card>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem>
          <LoadableButton variant='ghost' size='sm' className='text-left p-0'>
            <PenBox className='w-4 h-4 mr-2' />
            Edit
          </LoadableButton>
        </ContextMenuItem>
        <ContextMenuItem className='text-destructive'>
          <LoadableButton
            onClick={handlePressDelete}
            loading={deletor.isPending}
            variant='ghost'
            size='sm'
            className='text-left p-0'
          >
            <Trash2 className='w-4 h-4 mr-2' />
            Delete
          </LoadableButton>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
