import { Workflow } from '@/entities/workflow'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card'
import { trpc } from '@/utils/trpc'
import { MiniBadge } from './MiniBadge'

export const WorkflowCard: IComponent<{
  data: Workflow
}> = ({ data }) => {
  const { data: stats } = trpc.workflowTask.workflowTaskStats.useQuery(data.id)
  return (
    <Card className='h-fit overflow-hidden flex-1 min-w-[240px] md:max-w-[320px] w-full !pb-0'>
      <CardHeader className='w-full aspect-video bg-secondary rounded-b-xl shadow-inner border relative'>
        <div className='absolute right-2 top-2'>
          <MiniBadge
            dotClassName={stats?.isExecuting ? 'bg-orange-500' : 'bg-gray-500'}
            className='bg-white'
            title={stats?.isExecuting ? 'Executin' : 'Idle'}
          />
        </div>
      </CardHeader>
      <CardContent className='pt-4 pb-2 px-2'>
        <CardTitle>{data.name}</CardTitle>
        <CardDescription className='line-clamp-2 h-10'>{data.description}</CardDescription>
      </CardContent>
      <CardFooter className='px-2 pb-2 flex gap-1'>
        <MiniBadge dotClassName='bg-green-500' title='Executed' count={stats?.success} />
        <MiniBadge dotClassName='bg-destructive' title='Failed' count={stats?.failed} />
        <p className='text-sm ml-auto text-border'>@{data.author.email.split('@')[0]}</p>
      </CardFooter>
    </Card>
  )
}
