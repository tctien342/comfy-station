import { useEffect } from 'react'

export enum EGlobalEvent {
  RLOAD_CLIENTS = 'RLOAD_CLIENTS',
  RLOAD_WORKFLOW = 'RLOAD_WORKFLOW',
  RLOAD_USER_LIST = 'RLOAD_USER_LIST'
}

export const useGlobalEvent = (eventKey: EGlobalEvent, onEvent?: () => void) => {
  useEffect(() => {
    const handleEvent = () => {
      onEvent?.()
    }

    window.addEventListener(eventKey, handleEvent)

    return () => {
      window.removeEventListener(eventKey, handleEvent)
    }
  }, [eventKey, onEvent])
}

export const dispatchGlobalEvent = (eventKey: EGlobalEvent) => {
  window.dispatchEvent(new Event(eventKey))
}
