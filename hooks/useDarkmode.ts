import { useAppStore } from '@/states/app'
import { useEffect, useState } from 'react'

export const useSystemDarkMode = (): boolean => {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  const [isDarkMode, setIsDarkMode] = useState<boolean>(mediaQuery.matches)

  useEffect(() => {
    const handleChange = (event: MediaQueryListEvent) => {
      setIsDarkMode(event.matches)
    }

    mediaQuery.addEventListener('change', handleChange)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [mediaQuery])

  return isDarkMode
}

const useDarkMode = (): boolean => {
  const { theme } = useAppStore()
  const isDarkMode = useSystemDarkMode()

  return theme === 'dark' || (theme === 'system' && isDarkMode)
}

export default useDarkMode
