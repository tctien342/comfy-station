import { Attachment } from '@/entities/attachment'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useEffect, useRef } from 'react'
import { AttachmentImage } from './AttachmentImage'
import { delay } from '@/utils/tools'
import { useActionDebounce, useActionThreshold } from '@/hooks/useAction'

export const ImageGallery: IComponent<{
  rows: Array<{ loading: true } | Attachment>
  onFetchMore?: () => void
  hasNextPage: boolean
  isFetchingNextPage: boolean
}> = ({ rows, hasNextPage, isFetchingNextPage, onFetchMore }) => {
  const parentRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const firstLoaded = useRef(false)
  const debounce = useActionDebounce(300, true)

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (i) => 100,
    overscan: 5,
    lanes: 3
  })

  useEffect(
    () => {
      if (rows.length > 0 && !firstLoaded.current) {
        delay(200).then(() => {
          firstLoaded.current = true
        })
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rows]
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
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative'
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const item = rows[virtualRow.index]!
            return (
              <div
                key={virtualRow.key}
                data-index={virtualRow.index}
                ref={rowVirtualizer.measureElement}
                className={virtualRow.index % 2 ? 'ListItemOdd' : 'ListItemEven'}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: `${(virtualRow.lane * 100) / 3}%`,
                  width: 'calc(100%/3)',
                  height: 'fit-content',
                  aspectRatio: 'loading' in item ? 1 : item.ratio,
                  transform: `translateY(${virtualRow.start}px)`
                }}
              >
                {!('loading' in item) && (
                  <AttachmentImage className='w-full h-full object-cover' tryPreivew data={item} shortName='NA' />
                )}
                {'loading' in item && <AttachmentImage loading className='w-full h-full object-cover' />}
              </div>
            )
          })}
        </div>
        <div
          id='bottom'
          ref={bottomRef}
          className='w-full flex items-center justify-center mt-4 pt-4 pb-24 text-gray-400'
        >
          {isFetchingNextPage && <div className='flex'>Loading more data...</div>}
          {!isFetchingNextPage && !hasNextPage && <div className='flex'>No more data</div>}
        </div>
      </div>
    </>
  )
}
