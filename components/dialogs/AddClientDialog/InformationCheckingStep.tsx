import { AnimateDiv } from '@/components/AnimateDiv'
import { ResourceItem } from '@/components/ResourceItem'
import { cn } from '@/lib/utils'
import { AddClientDialogContext } from '.'
import { useContext, useMemo, useState } from 'react'
import { trpc } from '@/utils/trpc'
import { SimpleTransitionLayout } from '@/components/SimpleTranslation'
import { CheckpointItem } from './CheckpointItem'

const extraCls = 'border rounded-lg bg-secondary/20 shadow-inner'

export const InformationCheckingStep: IComponent = () => {
  const [activeTab, setActiveTab] = useState(0)
  const { clientInfo } = useContext(AddClientDialogContext)
  const { data, isLoading } = trpc.client.resources.useQuery(
    {
      host: clientInfo!.host,
      auth: clientInfo!.auth,
      username: clientInfo!.username,
      password: clientInfo!.password
    },
    { enabled: clientInfo !== undefined }
  )

  const renderListContent = useMemo(() => {
    switch (activeTab) {
      case 0:
        return data?.checkpoints.map((ckptName) => <CheckpointItem key={ckptName} ckptName={ckptName} />)
      default:
        return <div></div>
    }
  }, [activeTab, data?.checkpoints])

  return (
    <div className='absolute top-0 w-full h-full flex gap-2'>
      <AnimateDiv className={cn('w-1/4 p-2 space-y-2', extraCls)}>
        <ResourceItem
          active={activeTab === 0}
          onClick={() => setActiveTab(0)}
          title='Checkpoints'
          description='List of available checkpoint in this server'
          loading={isLoading}
          count={data?.checkpoints.length}
        />
        <ResourceItem
          active={activeTab === 1}
          onClick={() => setActiveTab(1)}
          title='Extensions'
          description='List of available extensions in this server'
          loading={isLoading}
          count={data ? Object.keys(data.extensions).length : undefined}
        />
        <ResourceItem
          active={activeTab === 2}
          onClick={() => setActiveTab(2)}
          title='Loras'
          description='List of available lora in this server'
          loading={isLoading}
          count={data?.lora.length}
        />
        <ResourceItem
          active={activeTab === 3}
          onClick={() => setActiveTab(3)}
          title='Samplers'
          description={data?.samplerInfo.sampler[1]?.tooltip ?? 'List of available sampler in this server'}
          loading={isLoading}
          count={data?.samplerInfo.sampler[0]?.length}
        />
        <ResourceItem
          active={activeTab === 4}
          onClick={() => setActiveTab(4)}
          title='Schedulers'
          description={data?.samplerInfo.scheduler[1]?.tooltip ?? 'List of available scheduler in this server'}
          loading={isLoading}
          count={data?.samplerInfo.scheduler[0]?.length}
        />
      </AnimateDiv>
      <AnimateDiv delayShow={200} className={cn('w-2/4', extraCls)}>
        <SimpleTransitionLayout deps={[activeTab]} className='overflow-auto h-full divide-y-[1px]'>
          {renderListContent}
        </SimpleTransitionLayout>
      </AnimateDiv>
      <AnimateDiv delayShow={400} className={cn('w-1/4', extraCls)}></AnimateDiv>
    </div>
  )
}
