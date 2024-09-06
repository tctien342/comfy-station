import { Client } from '@/entities/client'
import { EClientStatus } from '@/entities/enum'
import { cn } from '@/lib/utils'
import { trpc } from '@/utils/trpc'
import { TMonitorEvent } from '@saintno/comfyui-sdk'
import { useEffect, useMemo, useRef, useState } from 'react'
import { MonitoringStat } from './MonitoringStat'

import { ArrowPathIcon, CircleStackIcon, CpuChipIcon, TrashIcon } from '@heroicons/react/24/outline'
import { Button } from './ui/button'
import { HamburgerMenuIcon, SquareIcon } from '@radix-ui/react-icons'
import { TaskBar } from './TaskBar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from './ui/dropdown-menu'
import { LoadableButton } from './LoadableButton'
import { OverflowText } from './OverflowText'

export const ClientInfoMonitoring: IComponent<{
  client: Client
}> = ({ client }) => {
  const [actioning, setActioning] = useState(false)
  const [status, setStatus] = useState<EClientStatus>()
  const [monitoring, setMonitoring] = useState<TMonitorEvent>()
  const {
    data: clientTasks,
    isLoading: taskLoading,
    refetch: reloadTask
  } = trpc.task.lastTasks.useQuery({
    clientId: client.id,
    limit: 20
  })

  trpc.client.monitoringClient.useSubscription(client.id, {
    onData: (data) => {
      setMonitoring(data)
    }
  })
  trpc.client.clientStatus.useSubscription(client.id, {
    onData: (data) => {
      setStatus(data)
    }
  })

  const { mutateAsync } = trpc.client.control.useMutation()

  const handlePressAction = async (mode: 'FREE_VRAM' | 'REBOOT' | 'INTERRUPT') => {
    setActioning(true)
    mutateAsync({
      clientId: client.id,
      mode
    }).finally(() => {
      setActioning(false)
    })
  }

  useEffect(() => {
    reloadTask()
  }, [status])

  const renderStats = useMemo(() => {
    if (status === EClientStatus.Offline)
      return (
        <div className='h-full flex justify-center items-center text-foreground/20 font-bold px-4'>
          <span>OFFLINE</span>
        </div>
      )
    if (!monitoring) return null
    return (
      <>
        <MonitoringStat
          icon={<CpuChipIcon width={12} height={12} />}
          title='CPU'
          value={`${monitoring.cpu_utilization}%`}
        />
        <MonitoringStat
          icon={<CircleStackIcon width={12} height={12} />}
          title='RAM'
          value={`${monitoring.ram_used_percent}%`}
        />
        {monitoring.gpus.map((gpu, idx) => {
          return [
            <MonitoringStat
              key={'GPU_UL' + idx}
              icon={<CpuChipIcon width={12} height={12} />}
              title={`GPU ${idx + 1}`}
              value={`${gpu.gpu_utilization}%`}
            />,
            <MonitoringStat
              key={'GPU_RAM' + idx}
              icon={<CircleStackIcon width={12} height={12} />}
              title={`VRAM ${idx + 1}`}
              value={`${Number(gpu.vram_used_percent).toFixed(2)}%`}
            />
          ]
        })}
      </>
    )
  }, [monitoring, status])

  return (
    <div className='w-full flex flex-row min-h-[120px]'>
      <div className='flex-1 flex flex-row'>
        <div className='flex-1 flex flex-col p-2 gap-3'>
          <div className='flex gap-2 w-full'>
            <DropdownMenu>
              <DropdownMenuTrigger className='flex items-center'>
                <LoadableButton loading={actioning} variant='outline' size='icon' className='aspect-square'>
                  <HamburgerMenuIcon width={16} height={16} />
                </LoadableButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side='bottom' align='start' className='w-48'>
                <DropdownMenuItem onClick={() => handlePressAction('REBOOT')} className='cursor-pointer'>
                  <ArrowPathIcon className='mr-2' width={16} height={16} />
                  <span className='min-w-[100px]'>Reboot</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handlePressAction('FREE_VRAM')} className='cursor-pointer'>
                  <TrashIcon className='mr-2' width={16} height={16} />
                  <span className='min-w-[100px]'>Free VRAM</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  disabled={status !== EClientStatus.Executing}
                  className='text-destructive cursor-pointer'
                  onClick={() => handlePressAction('INTERRUPT')}
                >
                  <SquareIcon className='mr-2' width={16} height={16} />
                  <span className='min-w-[100px]'>Cancel current task</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <div className='flex flex-col flex-auto'>
              <h1 className='uppercase text-sm font-bold'>{client.name || `NODE #${client.id.slice(0, 4)}`}</h1>
              <div className='text-xs relative h-4 w-full justify-center items-center'>
                <OverflowText className='w-full absolute'>{client.host}</OverflowText>
              </div>
            </div>
          </div>
          <TaskBar className='max-w-[200px]' tasks={clientTasks || []} loading={taskLoading} total={20} />
        </div>
        <div className='h-full p-2 flex flex-col gap-1 min-w-fit'>{renderStats}</div>
      </div>
      <div
        className={cn('w-2 transition-all', {
          'bg-blue-500': status === EClientStatus.Online,
          'bg-zinc-500': status === EClientStatus.Offline,
          'bg-destructive': status === EClientStatus.Error,
          'bg-orange-500': status === EClientStatus.Executing
        })}
      />
    </div>
  )
}
