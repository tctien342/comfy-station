import { Attachment } from '@/entities/attachment'
import LoadableImage, { LoadableImageProps } from './LoadableImage'
import { trpc } from '@/utils/trpc'

interface IAttachmentImage extends LoadableImageProps {
  data?: Attachment | { id: string }
  preferredSize?: 'preview' | 'high' | 'raw'
}

export const AttachmentImage: IComponent<IAttachmentImage> = ({ data, preferredSize = 'preview', ...props }) => {
  const { data: image, isLoading } = trpc.attachment.get.useQuery(
    {
      id: data?.id!
    },
    {
      enabled: !!data?.id,
      staleTime: Infinity
    }
  )

  const src = image?.[preferredSize || 'preview']?.url || image?.high?.url || image?.raw?.url

  return <LoadableImage {...props} src={src} loading={props.loading || isLoading} />
}
