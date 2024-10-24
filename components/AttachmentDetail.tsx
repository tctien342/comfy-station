import { trpc } from '@/utils/trpc'
import { Attachment } from '@/entities/attachment'
import { cn } from '@/lib/utils'
import { Button } from './ui/button'
import { Download } from 'lucide-react'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import { useCallback, useRef } from 'react'
import { useOnScreen } from '@/hooks/useOnScreen'
import { EValueType, EValueUltilityType } from '@/entities/enum'
import { isArray } from 'lodash'
import LoadableImage from './LoadableImage'
import { IconPicker } from './IconPicker'
import { IMapperInput } from '@/entities/workflow'
import { AttachmentReview } from './AttachmentReview'

export const AttachmentDetail: IComponent<{
  attachment: Attachment | { id: string }
  imageURL?: string
  onPressDownloadHigh?: () => void
  onPressDownloadRaw?: () => void
}> = ({ attachment, imageURL, onPressDownloadHigh, onPressDownloadRaw }) => {
  const viewRef = useRef<HTMLDivElement>(null)
  const isVisible = useOnScreen(viewRef)
  const { data: detail, isLoading } = trpc.attachment.taskDetail.useQuery(attachment?.id!, {
    enabled: attachment?.id !== undefined && isVisible,
    staleTime: Infinity
  })
  const configMap = detail?.workflow?.mapInput || {}
  const config = detail?.task?.inputValues || {}

  const renderMapperInput = useCallback((config: IMapperInput, inputVal: any) => {
    const value = inputVal || config.default
    if (config.type === EValueType.Image && isArray(value)) {
      return (
        <div className='flex flex-col'>
          <strong>{config.key}</strong>
          <div className='flex gap-2 mt-2'>
            {value.map((v) => (
              <AttachmentReview key={v} data={{ id: v }} mode='avatar' />
            ))}
          </div>
        </div>
      )
    }
    return (
      <div className='flex flex-col'>
        <div className='flex gap-2 items-center'>
          {!!config.iconName && <IconPicker readonly value={config.iconName} />}
          <strong>{config.key}</strong>
        </div>
        <span className='break-words'>{value}</span>
      </div>
    )
  }, [])

  return (
    <div className='w-full h-full'>
      <div ref={viewRef} className='w-full h-full flex flex-col md:flex-row'>
        <div className='flex-1 w-full md:w-1/2 h-1/2 md:h-full'>
          <TransformWrapper centerZoomedOut centerOnInit initialScale={1}>
            <TransformComponent wrapperStyle={{ width: '100%', height: '100%' }}>
              {!!imageURL && (
                <div className='h-[50vh] md:h-screen w-screen md:w-[calc(100vw-480px)]'>
                  <LoadableImage className='object-contain w-full h-full' src={imageURL} alt='test' />
                </div>
              )}
            </TransformComponent>
          </TransformWrapper>
        </div>
        <div className='w-full md:w-1/2 lg:w-[480px] h-1/2 md:h-full'>
          <div className='w-full h-full overflow-x-hidden overflow-y-auto p-3 pr-0 shadow-inner'>
            <h1 className='text-xl font-bold uppercase'>{detail?.workflow?.name}</h1>
            <h1 className='text-sm uppercase'>{detail?.workflow?.description}</h1>
            <code className='whitespace-pre-wrap flex flex-col gap-2 mt-2'>
              {Object.entries(config)
                .filter(([key]) => configMap[key].type !== EValueUltilityType.Prefixer)
                .map(([key, value], idx) => {
                  return (
                    <div
                      key={key}
                      className={cn('w-full p-1', {
                        'bg-secondary': idx % 2 === 0
                      })}
                    >
                      {renderMapperInput(configMap[key], value)}
                    </div>
                  )
                })}
            </code>
            <div className='mt-4 flex gap-2 pb-4'>
              <Button onClick={onPressDownloadHigh} className='rounded-full'>
                <Download width={16} height={16} className='mr-2' /> Compressed JPG
              </Button>
              <Button onClick={onPressDownloadRaw} className='rounded-full' variant='secondary'>
                <Download width={16} height={16} className='mr-2' /> Raw image
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
