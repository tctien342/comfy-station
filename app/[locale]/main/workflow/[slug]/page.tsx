'use client'

import { WorkflowVisualize } from '@/components/WorkflowVisualize'
import { useCurrentRoute } from '@/hooks/useCurrentRoute'
import { trpc } from '@/utils/trpc'

// We will put the workflow map in here
export default function Map() {
  const { slug } = useCurrentRoute()
  const infoLoader = trpc.workflow.get.useQuery(slug!, {
    enabled: !!slug
  })

  const rawWorkflow: IWorkflow = JSON.parse(infoLoader.data?.rawWorkflow || '{}')
  return (
    <div className='w-full h-full flex-1 flex-wrap p-2 gap-2 shadow-inner'>
      {infoLoader.data && <WorkflowVisualize workflow={rawWorkflow} />}
    </div>
  )
}
