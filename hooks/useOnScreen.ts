import { useEffect, useState, useRef } from 'react'

export function useOnScreen(ref: React.RefObject<HTMLElement>) {
  const [isOnScreen, setIsOnScreen] = useState(false)
  const observerRef = useRef<IntersectionObserver>()

  useEffect(() => {
    observerRef.current = new IntersectionObserver(([entry]) => setIsOnScreen(entry.isIntersecting))
  }, [])

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
