import React, { CSSProperties, useCallback, useEffect, useRef } from 'react'
import { VirtualItem, useVirtualizer } from '@tanstack/react-virtual'
import { delay } from '@/utils/tools'

export type VirtualListProps<T> = {
  className?: string
  style?: CSSProperties
  itemClassName?: string
  itemStyle?: CSSProperties
  items: T[]
  getItemKey: (item: T, index: number) => string | number
  renderItem: (item: T, virtualItem: VirtualItem) => React.ReactNode
  estimateSize: (index: number) => number
  overscan?: number
  onFetchMore?: () => void
  hasNextPage: boolean
  isFetchingNextPage: boolean
}

export function VirtualList<T>({
  style,
  itemStyle,
  items,
  getItemKey,
  estimateSize,
  renderItem,
  hasNextPage,
  isFetchingNextPage,
  overscan,
  onFetchMore
}: VirtualListProps<T>) {
  const isAtBottom = useRef(false)
  const firstLoaded = useRef(false)

  const scrollableRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const scrollPosRef = useRef(0)

  const getItemKeyCallback = useCallback((index: number) => getItemKey(items[index]!, index), [getItemKey, items])
  const virtualizer = useVirtualizer({
    count: items.length,
    getItemKey: getItemKeyCallback,
    getScrollElement: () => scrollableRef.current,
    estimateSize,
    overscan,
    debug: true
  })

  useEffect(
    () => {
      if (items.length > 0 && !firstLoaded.current) {
        // delay(340).then(() => {
        virtualizer.scrollToOffset(virtualizer.getTotalSize())
        firstLoaded.current = true
        // })
        return
      }
      if (isAtBottom.current) {
        virtualizer.scrollToOffset(virtualizer.getTotalSize())
      } else if (scrollableRef.current) {
        virtualizer.scrollToOffset(
          virtualizer.getTotalSize() - scrollPosRef.current - scrollableRef.current!.clientHeight
        )
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items]
  )

  useEffect(() => {
    if (virtualizer.isScrolling) {
      const scrollOffset = virtualizer.scrollOffset ?? 0
      const scrollHeight = virtualizer.getTotalSize()

      scrollPosRef.current = scrollHeight - (scrollOffset ?? 0) - scrollableRef.current!.clientHeight
      isAtBottom.current = scrollPosRef.current < 30
    }
  }, [virtualizer, virtualizer.isScrolling, virtualizer.scrollOffset])

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (firstLoaded.current) {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (entry.target.id === 'bottom' && hasNextPage && !isFetchingNextPage) {
              onFetchMore?.()
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
  }, [hasNextPage, isFetchingNextPage, onFetchMore])

  const virtualItems = virtualizer.getVirtualItems()
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column-reverse',
        ...style
      }}
    >
      <div
        ref={scrollableRef}
        style={{
          height: '100%',
          overflow: 'auto'
        }}
      >
        <div
          style={{
            width: '100%',
            position: 'relative',
            height: virtualizer.getTotalSize()
          }}
        >
          <div id='bottom' ref={bottomRef} />
          <div
            className='divide-y divide-secondary px-2'
            style={{
              position: 'absolute',
              top: '0',
              left: '0',
              width: '100%',
              transform: `translateY(${virtualItems[0]?.start ?? 0}px)`
            }}
          >
            {virtualItems.map((virtualItem) => {
              const item = items[virtualItem.index]!

              return (
                <div
                  key={virtualItem.key}
                  className='animate-fade'
                  ref={virtualizer.measureElement}
                  data-index={virtualItem.index}
                  style={{
                    ...itemStyle,
                    animationDelay: `${(items.length - virtualItem.index) * 34}ms`
                  }}
                >
                  {renderItem(item, virtualItem)}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
