import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { LoadingSVG } from './svg/LoadingSVG'
import { trpc } from '@/utils/trpc'
import { Attachment } from '@/entities/attachment'

export const AttachmentImage: IComponent<{
  shortName: string
  data?: Attachment
  onClick?: () => void
}> = ({ data, shortName, onClick }) => {
  const enabled = !!data?.id
  const { data: image, isLoading } = trpc.attachment.get.useQuery(
    {
      id: data?.id!
    },
    {
      enabled
    }
  )
  const imageLoaded = !isLoading || !enabled

  return (
    <Avatar onClick={onClick} className='m-2 w-16 h-16 !rounded-md cursor-pointer btn'>
      <AvatarImage src={!image ? undefined : image?.url || undefined} alt={shortName} />
      <AvatarFallback className='rounded-md uppercase'>
        {!imageLoaded && <LoadingSVG width={16} height={16} className='repeat-infinite' />}
        {imageLoaded && shortName}
      </AvatarFallback>
    </Avatar>
  )
}
