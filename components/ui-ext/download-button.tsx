import React from 'react'

import useImageBundler from '@/hooks/useImageBundler'
import { cn } from '@/lib/utils'
import AnimatedCircularProgressBar from '../ui/animated-circular-progress-bar'
import { Button } from '../ui/button'
import { Download } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { trpc } from '@/utils/trpc'

const DownloadImagesButton: IComponent<{
  workflowTaskId?: string
  className?: string
}> = ({ workflowTaskId, className }) => {
  const { data: attachments, refetch: refetchAttachments } = trpc.workflowTask.getOutputAttachmentUrls.useQuery(
    workflowTaskId!,
    {
      enabled: !!workflowTaskId,
      refetchOnWindowFocus: false
    }
  )
  const { bundleImages, isLoading, progress, error } = useImageBundler()

  const downloadFn = async (mode: 'jpg' | 'raw' = 'jpg') => {
    if (isLoading) return
    try {
      const images = attachments
        ?.filter((a) => !!a)
        .filter((a) => !!a.raw?.url)
        .map((v) => {
          if (mode === 'jpg') return v.high!.url
          return v.raw!.url
        }) as string[]
      await bundleImages(images)
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className='flex items-center'>
        <Button size='icon' variant='ghost' className={className}>
          {isLoading ? (
            <div className='w-full overflow-hidden'>
              <AnimatedCircularProgressBar
                max={100}
                min={0}
                className={cn('w-full h-full text-xs')}
                value={progress}
                gaugePrimaryColor='rgb(255 255 255)'
                gaugeSecondaryColor='rgba(0, 0, 0, 0.1)'
              />
            </div>
          ) : (
            <Download width={16} height={16} />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side='left' align='center'>
        <DropdownMenuItem onClick={() => downloadFn('jpg')} className='cursor-pointer text-sm'>
          <span>Download compressed JPG</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => downloadFn()} className='cursor-pointer text-sm'>
          <span>Download Raw</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default DownloadImagesButton
