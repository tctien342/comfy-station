import { Workflow } from '@/entities/workflow'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card'
import { trpc } from '@/utils/trpc'
import { MiniBadge } from './MiniBadge'
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from './ui/context-menu'
import { PenBox, Trash2 } from 'lucide-react'
import { LoadableButton } from './LoadableButton'
import { useToast } from '@/hooks/useToast'
import { dispatchGlobalEvent, EGlobalEvent } from '@/hooks/useGlobalEvent'
import { useRouter } from 'next/navigation'
import { AttachmentImage } from './AttachmentImage'
import { useSession } from 'next-auth/react'
import { EUserRole, EWorkflowActiveStatus } from '@/entities/enum'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'

export const WorkflowCard: IComponent<{
  data: Workflow
}> = ({ data }) => {
  const stator = trpc.workflowTask.workflowTaskStats.useQuery(data.id)
  const statusChanger = trpc.workflow.changeStatus.useMutation()
  const router = useRouter()
  const session = useSession()
  const { toast } = useToast()

  const handlePressActive = async () => {
    await statusChanger.mutateAsync({
      id: data.id,
      status: EWorkflowActiveStatus.Activated
    })
    toast({
      title: 'Workflow Activated'
    })
    dispatchGlobalEvent(EGlobalEvent.RLOAD_WORKFLOW)
  }

  const handlePressDelete = async () => {
    await statusChanger.mutateAsync({
      id: data.id,
      status: EWorkflowActiveStatus.Deleted
    })
    toast({
      title: 'Workflow Deleted'
    })
    dispatchGlobalEvent(EGlobalEvent.RLOAD_WORKFLOW)
  }

  const handlePresHide = async () => {
    await statusChanger.mutateAsync({
      id: data.id,
      status: EWorkflowActiveStatus.Deactivated
    })
    toast({
      title: 'Workflow Deactivated'
    })
    dispatchGlobalEvent(EGlobalEvent.RLOAD_WORKFLOW)
  }

  trpc.watch.workflow.useSubscription(data.id, {
    onData: () => stator.refetch()
  })

  return (
    <ContextMenu>
      <ContextMenuTrigger
        disabled={session.data!.user.role < EUserRole.Editor}
        className='h-fit flex-1 w-full !pb-0 shadow rounded-xl relative'
      >
        {data.status !== EWorkflowActiveStatus.Activated && (
          <div className='absolute w-full z-10 p-3 bg-background rounded-xl shadow border flex items-center flex-col'>
            {data.status === EWorkflowActiveStatus.Deactivated && (
              <EyeSlashIcon className={'w-6 h-6 text-orange-400 mb-2'} />
            )}
            {data.status === EWorkflowActiveStatus.Deleted && <Trash2 className={'w-6 h-6 mb-2 text-destructive'} />}
            <span className='font-bold uppercase text-sm'>{data.status}</span>
            {data.status === EWorkflowActiveStatus.Deactivated && (
              <p className='text-xs text-center max-w-52'>User still can get access to old tasks</p>
            )}
            {data.status === EWorkflowActiveStatus.Deleted && (
              <p className='text-xs text-center max-w-52'>User will loose access to old tasks</p>
            )}
          </div>
        )}
        <Card
          onClick={() => router.push(`/main/workflow/${data.id}`)}
          className={cn('shadow-none cursor-pointer hover:shadow-lg transition-all overflow-hidden', {
            'opacity-20': data.status !== EWorkflowActiveStatus.Activated
          })}
        >
          <CardHeader className='w-full aspect-video bg-secondary rounded-b-xl shadow-inner relative p-0'>
            <div className='absolute right-2 top-2 z-10'>
              <MiniBadge
                dotClassName={stator.data?.isExecuting ? 'bg-orange-500' : 'bg-gray-500'}
                className='bg-white text-zinc-800 border-none'
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
          <LoadableButton variant='ghost' size='sm' className='justify-start p-0 w-full'>
            <PenBox className='w-4 h-4 mr-2' />
            Edit
          </LoadableButton>
        </ContextMenuItem>
        {data.status !== EWorkflowActiveStatus.Activated && (
          <ContextMenuItem className='text-primary'>
            <LoadableButton
              onClick={handlePressActive}
              loading={statusChanger.isPending}
              variant='ghost'
              size='sm'
              className='justify-start p-0 w-full'
            >
              <EyeIcon className='w-4 h-4 mr-2' />
              Activated
            </LoadableButton>
          </ContextMenuItem>
        )}
        {data.status !== EWorkflowActiveStatus.Deactivated && (
          <ContextMenuItem className='text-orange-400'>
            <LoadableButton
              onClick={handlePresHide}
              loading={statusChanger.isPending}
              variant='ghost'
              size='sm'
              className='justify-start p-0 w-full'
            >
              <EyeSlashIcon className='w-4 h-4 mr-2' />
              Deactivated
            </LoadableButton>
          </ContextMenuItem>
        )}
        {data.status !== EWorkflowActiveStatus.Deleted && (
          <ContextMenuItem className='text-destructive'>
            <LoadableButton
              onClick={handlePressDelete}
              loading={statusChanger.isPending}
              variant='ghost'
              size='sm'
              className='justify-start p-0 w-full'
            >
              <Trash2 className='w-4 h-4 mr-2' />
              Delete
            </LoadableButton>
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  )
}
