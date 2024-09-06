'use client'
import useDarkMode from '@/hooks/useDarkmode'
import { PropsWithChildren, useEffect } from 'react'

export const ThemeLayout: React.FC<PropsWithChildren> = ({ children }) => {
  const isDarkMode = useDarkMode()

  useEffect(() => {
    const root = document.getElementsByTagName('html')?.[0]
    if (root) {
      if (isDarkMode) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    }
  }, [isDarkMode])

  return <>{children}</>
}
