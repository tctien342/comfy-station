import { useEffect, useState, useRef } from 'react'

export function useOnScreen(ref: React.RefObject<HTMLElement | null>, offset: string = '512px') {
  const [isOnScreen, setIsOnScreen] = useState(false)
  const observerRef = useRef<IntersectionObserver>(undefined)

  useEffect(() => {
    observerRef.current = new IntersectionObserver(([entry]) => setIsOnScreen(entry.isIntersecting), {
      rootMargin: offset
    })
  }, [offset])

  useEffect(() => {
    if (ref.current) {
      observerRef.current?.observe(ref.current)
    }
    return () => {
      observerRef.current?.disconnect()
    }
  }, [ref])

  return isOnScreen
}
