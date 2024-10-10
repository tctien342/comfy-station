import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { LoadingSVG } from './svg/LoadingSVG'
import { trpc } from '@/utils/trpc'
import { Attachment } from '@/entities/attachment'
import { cn } from '@/lib/utils'

export const AttachmentImage: IComponent<{
  shortName: string
  data?: Attachment | { id: string }
  onClick?: () => void
  className?: string
  tryPreivew?: boolean
}> = ({ data, shortName, onClick, className, tryPreivew }) => {
  const enabled = !!data?.id
  const { data: image, isLoading } = trpc.attachment.get.useQuery(
    {
      id: data?.id!,
      tryPreview: !!tryPreivew
    },
    {
      enabled,
      staleTime: Infinity
    }
  )

  const imageLoaded = !isLoading || !enabled

  return (
    <Avatar onClick={onClick} className={cn('m-2 w-16 h-16 rounded-none cursor-pointer btn', className)}>
      <AvatarImage src={!image ? undefined : image?.url || undefined} alt={shortName} />
      <AvatarFallback className={cn('rounded-none uppercase', className)}>
        {!imageLoaded && <LoadingSVG width={16} height={16} className='repeat-infinite' />}
        {imageLoaded && shortName}
      </AvatarFallback>
    </Avatar>
  )
}
