import { useState, useEffect, useRef } from 'react'

const DB_NAME = 'myDatabase'
const STORE_NAME = 'myStore'
const DB_VERSION = 1

function openDB() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result)
    }

    request.onerror = (event) => {
      reject((event.target as IDBOpenDBRequest).error)
    }
  })
}

async function getData(key: string): Promise<any> {
  const db = await openDB()
  return await new Promise<any>((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.get(key)

    request.onsuccess = (event) => {
      resolve((event.target as IDBRequest).result)
    }

    request.onerror = (event_1) => {
      reject((event_1.target as IDBRequest).error)
    }
  })
}

async function setData(key: string, value: any): Promise<void> {
  const db = await openDB()
  return await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.put(value, key)

    request.onsuccess = () => {
      resolve()
    }

    request.onerror = (event) => {
      reject((event.target as IDBRequest).error)
    }
  })
}

function useIndexDBState<T>(key: string, initialValue: T): [T, (value: T | ((prevValue: T) => T)) => void] {
  const loadedRef = useRef(false)
  const [state, setState] = useState<T>(initialValue)

  useEffect(() => {
    loadedRef.current = false
    getData(key).then((storedValue) => {
      if (storedValue !== undefined) {
        setState(storedValue)
        loadedRef.current = true
      }
    })
  }, [key])

  const setStoredState = (value: T | ((prevValue: T) => T)) => {
    if (!loadedRef.current) {
      return
    }
    setState((prevState) => {
      const newValue = typeof value === 'function' ? (value as (prevValue: T) => T)(prevState) : value
      setData(key, newValue)
      return newValue
    })
  }

  return [state, setStoredState]
}

export { useIndexDBState }
