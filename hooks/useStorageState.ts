/**
 * Use State with localStorage
 */
import { cloneDeep } from 'lodash'
import { useState } from 'react'

export const useStorageState = <T>(
  key: string,
  defaultValue: T
): [T, (value: T | ((prevValue: T) => T), filter?: (obj: T) => T) => void, () => void] => {
  const [state, setState] = useState<T>(() => {
    const storedValue = localStorage.getItem(key)
    if (storedValue === 'undefined') {
      localStorage.removeItem(key)
      return defaultValue
    }
    return storedValue ? JSON.parse(storedValue) : defaultValue
  })

  const reloadNewValue = () => {
    const storedValue = localStorage.getItem(key)
    if (storedValue === 'undefined') {
      localStorage.removeItem(key)
      setState(defaultValue)
    } else {
      setState(storedValue ? JSON.parse(storedValue) : defaultValue)
    }
  }

  const setStoredValue = (value: T | ((prevValue: T) => T), storagefilter?: (obj: T) => T) => {
    setState((prevValue) => {
      const newValue = value instanceof Function ? value(prevValue) : value
      const storeValue = cloneDeep(newValue)
      localStorage.setItem(key, JSON.stringify(storagefilter ? storagefilter(storeValue) : storeValue))
      return newValue
    })
  }

  return [state, setStoredValue, reloadNewValue]
}
