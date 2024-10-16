import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { LoadingSVG } from './svg/LoadingSVG'
import { trpc } from '@/utils/trpc'
import { Attachment } from '@/entities/attachment'
import { cn } from '@/lib/utils'
import { PhotoView } from 'react-photo-view'
import { Button } from './ui/button'
import { Download, Star } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip'

export const AttachmentImage: IComponent<{
  shortName?: string
  data?: Attachment | { id: string }
  mode?: 'avatar' | 'image'
  onClick?: () => void
  onPressFavorite?: (imageId: string) => void
  isFavorited?: boolean
  loading?: boolean
  className?: string
  tryPreivew?: boolean
}> = ({
  data,
  mode = 'image',
  shortName = 'N/A',
  onClick,
  className,
  tryPreivew,
  isFavorited,
  loading,
  onPressFavorite
}) => {
  const enabled = !!data?.id
  const { data: image, isLoading } = trpc.attachment.get.useQuery(
    {
      id: data?.id!
    },
    {
      enabled,
      staleTime: Infinity
    }
  )

  const downloadFn = () => window.open(image?.raw?.url, '_blank')
  const imageLoaded = !loading && (!isLoading || !enabled)

  if (mode === 'image') {
    return (
      <div
        className={cn('w-16 h-16 rounded-xl cursor-pointer btn bg-secondary overflow-hidden relative group', className)}
      >
        <PhotoView src={image?.raw?.url}>
          <div className='w-full h-full flex items-center justify-center'>
            {imageLoaded && (
              // eslint-disable-next-line @next/next/no-img-element
              <img loading='lazy' src={image?.preview?.url} alt={shortName} className='w-full h-full object-cover' />
            )}
            {!imageLoaded && <LoadingSVG width={16} height={16} className='repeat-infinite' />}
          </div>
        </PhotoView>
        <div
          className={cn('z-10 group-hover:block absolute top-1 left-1', {
            hidden: !isFavorited
          })}
        >
          <Tooltip>
            <TooltipTrigger>
              <Button onClick={() => onPressFavorite?.(data?.id!)} size='icon' variant='ghost'>
                <Star
                  width={24}
                  height={24}
                  className={cn({
                    'fill-zinc-200 stroke-zinc-200': !isFavorited,
                    'fill-yellow-500 stroke-yellow-500': isFavorited
                  })}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent
              side='right'
              className='max-w-[128px] bg-background text-foreground z-10 border p-2 flex flex-col'
            >
              Set as thumbnail for this workflow
            </TooltipContent>
          </Tooltip>
        </div>
        <div className={cn('z-10 hidden group-hover:block absolute bottom-1 right-1')}>
          <Tooltip>
            <TooltipTrigger>
              <Button onClick={() => downloadFn()} size='icon' variant='ghost'>
                <Download width={24} height={24} />
              </Button>
            </TooltipTrigger>
            <TooltipContent
              side='right'
              className='max-w-[128px] bg-background text-foreground z-10 border p-2 flex flex-col'
            >
              Download this images
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    )
  }

  return (
    <Avatar onClick={onClick} className={cn('w-16 h-16 rounded-none cursor-pointer btn', className)}>
      {imageLoaded && <AvatarImage src={!image ? undefined : image?.preview?.url || undefined} alt={shortName} />}
      <AvatarFallback
        className={cn('rounded-none uppercase', className, {
          'animate-pulse': loading
        })}
      >
        {!imageLoaded && <LoadingSVG width={16} height={16} className='repeat-infinite' />}
        {imageLoaded && shortName}
      </AvatarFallback>
    </Avatar>
  )
}
