import { Attachment } from '@/entities/attachment'
import { useVirtualizer } from '@tanstack/react-virtual'
import { ReactNode, useEffect, useRef } from 'react'
import { AttachmentImage } from './AttachmentImage'
import { delay } from '@/utils/tools'
import { useActionDebounce, useActionThreshold } from '@/hooks/useAction'

export const ImageGallery: IComponent<{
  items: Array<{ loading: true } | Attachment>
  favoriteIds?: string[]
  onFetchMore?: () => void
  imgPerRow?: number
  hasNextPage: boolean
  isFetchingNextPage: boolean
  renderEmpty?: () => ReactNode
  onPressFavorite?: (imageId: string) => void
}> = ({
  items,
  hasNextPage,
  isFetchingNextPage,
  onPressFavorite,
  onFetchMore,
  renderEmpty,
  favoriteIds,
  imgPerRow = 3
}) => {
  const parentRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const firstLoaded = useRef(false)
  const debounce = useActionDebounce(300, true)

  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (i) => 100,
    getItemKey: (i) => {
      const item = items[i]
      if ('loading' in item) {
        return i
      }
      return (items[i] as Attachment)?.id ?? i
    },
    overscan: 5,
    lanes: imgPerRow
  })

  useEffect(
    () => {
      if (items.length > 0 && !firstLoaded.current) {
        delay(200).then(() => {
          firstLoaded.current = true
        })
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items]
  )

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (firstLoaded.current) {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (entry.target.id === 'bottom' && hasNextPage && !isFetchingNextPage) {
              debounce(() => {
                onFetchMore?.()
              })
            }
          }
        })
      }
    })
    if (bottomRef.current) {
      observer.observe(bottomRef.current)
    }
    return () => {
      observer.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasNextPage, isFetchingNextPage, onFetchMore])

  return (
    <>
      <div
        ref={parentRef}
        className='List'
        style={{
          height: `100%`,
          width: `100%`,
          overflow: 'auto'
        }}
      >
        {items.length === 0 && (
          <div className='absolute top-0 left-0 w-full h-full flex items-center justify-center'>
            {renderEmpty?.() || <span className='text-foreground/50 uppercase'>Empty</span>}
          </div>
        )}
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative'
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const item = items[virtualRow.index]!
            return (
              <div
                key={virtualRow.key}
                data-index={virtualRow.index}
                ref={rowVirtualizer.measureElement}
                className={'animate-fade duration-200 p-1'}
                style={{
                  animationDelay: `${virtualRow.index * 34}ms`,
                  position: 'absolute',
                  top: 0,
                  left: `${(virtualRow.lane * 100) / imgPerRow}%`,
                  width: `calc(100%/${imgPerRow})`,
                  height: 'fit-content',
                  aspectRatio: 'loading' in item ? 1 : item.ratio,
                  transform: `translateY(${virtualRow.start}px)`
                }}
              >
                {!('loading' in item) && (
                  <AttachmentImage
                    key={item.id}
                    isFavorited={favoriteIds?.includes(item.id)}
                    onPressFavorite={onPressFavorite}
                    className='w-full h-full object-cover'
                    tryPreivew
                    data={item}
                    shortName='NA'
                  />
                )}
                {'loading' in item && <AttachmentImage loading className='w-full h-full object-cover' />}
              </div>
            )
          })}
        </div>
        {items.length > 0 && (
          <div
            id='bottom'
            ref={bottomRef}
            className='w-full flex items-center justify-center mt-4 pt-4 pb-24 text-gray-400'
          >
            {isFetchingNextPage && <div className='flex'>Loading more data...</div>}
            {!isFetchingNextPage && !hasNextPage && <div className='flex'>No more data</div>}
          </div>
        )}
      </div>
    </>
  )
}
