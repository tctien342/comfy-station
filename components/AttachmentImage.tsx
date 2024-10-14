import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { LoadingSVG } from './svg/LoadingSVG'
import { trpc } from '@/utils/trpc'
import { Attachment } from '@/entities/attachment'
import { cn } from '@/lib/utils'
import { PhotoView } from 'react-photo-view'

export const AttachmentImage: IComponent<{
  shortName?: string
  data?: Attachment | { id: string }
  mode?: 'avatar' | 'image'
  onClick?: () => void
  loading?: boolean
  className?: string
  tryPreivew?: boolean
}> = ({ data, mode = 'image', shortName = 'N/A', onClick, className, tryPreivew, loading }) => {
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

  const imageLoaded = !loading && (!isLoading || !enabled)

  if (mode === 'image') {
    return (
      <PhotoView src={image?.raw?.url}>
        <div
          className={cn(
            'w-16 h-16 rounded-xl cursor-pointer btn flex items-center justify-center bg-secondary overflow-hidden',
            className
          )}
        >
          {imageLoaded && (
            <img loading='lazy' src={image?.preview?.url} alt={shortName} className='w-full h-full object-cover' />
          )}
          {!imageLoaded && <LoadingSVG width={16} height={16} className='repeat-infinite' />}
        </div>
      </PhotoView>
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
