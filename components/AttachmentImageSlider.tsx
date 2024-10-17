import { trpc } from '@/utils/trpc'
import { PhotoSlider } from 'react-photo-view'
import { LoadingSVG } from './svg/LoadingSVG'

export const AttachmentImageSlider: IComponent<{
  images: string[]
  show: boolean
  onHide?: () => void
}> = ({ show, images, onHide }) => {
  const lister = trpc.attachment.getList.useQuery(images, {
    enabled: show && images.length > 0
  })
  const imagesURL = lister.data?.filter((item) => !!item.urls.raw).map((item) => item.urls.raw!.url) ?? []
  return (
    <PhotoSlider
      images={imagesURL.map((item) => ({ src: item, key: item }))}
      visible={show}
      onClose={() => onHide?.()}
      loadingElement={
        <div className='flex justify-center items-center h-full w-full'>
          <LoadingSVG width={32} height={32} />
        </div>
      }
    />
  )
}
