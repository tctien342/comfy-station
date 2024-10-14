import { useCallback, useEffect, useState } from 'react'

/**
 * Make dynamic value base on client screen status
 */
export const useDynamicValue = (
  breakPoints = [720, 960],
  mode: 'width' | 'height' = 'width'
): (<T = undefined>(values: [T, T, T]) => T) => {
  const [sel, setSel] = useState(0)

  const handleResize = useCallback(() => {
    const currentSize = mode === 'width' ? document.documentElement.clientWidth : document.documentElement.clientHeight
    if (currentSize > breakPoints[1]) {
      setSel(2)
    } else if (currentSize <= breakPoints[1] && currentSize > breakPoints[0]) {
      setSel(1)
    } else {
      setSel(0)
    }
  }, [breakPoints, mode])

  useEffect(() => {
    handleResize()
    window.addEventListener('resize', handleResize)
    return (): void => window.removeEventListener('resize', handleResize)
  }, [handleResize])

  /**
   * Return size base on screen status
   * @param values [small,medium,large] dynamic size to be used
   */
  const getValue = <T = undefined>(values: [T, T, T]): T => {
    return values[sel]
  }
  return getValue
}
