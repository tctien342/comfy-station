/* Portal handle for popup or when you need put your component on top of app */

import { useWindowResize } from '@/hooks/useWindowResize'
import { getWindowRelativeOffset } from '@/utils/tools'
import { uniqueId } from 'lodash'
import React, { MutableRefObject, ReactNode, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const FORCE_RECALCULATE_KEY = 'FORCE_RECALCULATE_KEY'

/**
 * Portal for popup element
 */
export const Portal: IComponent<{
  /**
   * Target of parent object
   */
  targetRef?: MutableRefObject<HTMLDivElement | HTMLSpanElement | null> | string
  /**
   * Wait for target to be ready before render (DEFAULT `false`)
   */
  waitForTarget?: boolean
  /**
   * Scrollable element that contain this portal (DEFAULT `bodyRef.current`)
   */
  scrollElement?: MutableRefObject<HTMLDivElement | HTMLSpanElement | null>
  /**
   * Enabled follow scroll
   */
  followScroll?: boolean
  /**
   * FPS update portal when scroll (DEFAULT 60)
   */
  fpsScroll?: number
  /**
   * Whether user can interact with children inside or not
   */
  interactive?: boolean
}> = ({
  children,
  targetRef,
  waitForTarget = false,
  followScroll = true,
  scrollElement = null,
  interactive = true
}) => {
  const bodyRef = useRef(document.getElementsByTagName('body')[0])
  const [target, setTarget] = useState(
    typeof targetRef === 'string' ? document.getElementById(targetRef) : targetRef?.current
  )
  const [portalID] = useState(uniqueId('portal'))
  const mount = useRef<HTMLDivElement | null>(null)
  const el = useRef<HTMLDivElement | null>(null)
  const [result, setResult] = useState(<div />)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const childrenWrapper: ReactNode = interactive ? <div style={{ pointerEvents: 'visible' }}>{children}</div> : children

  const watchTarget = () => {
    if (!target) {
      if (typeof targetRef === 'string') {
        setTarget(document.getElementById(targetRef))
      } else if (targetRef?.current) {
        setTarget(targetRef.current)
      }
    } else {
      return
    }
    setTimeout(watchTarget, 100)
  }

  useEffect(() => {
    /* Prevent bug on nextJS, we will call document after rendered */
    mount.current = document.getElementById('portal-root') as HTMLDivElement
    if (!mount.current) {
      const portalRoot = document.createElement('div')
      portalRoot.id = 'portal-root'
      if (interactive === false) {
        portalRoot.style.pointerEvents = 'none'
      }
      bodyRef.current?.appendChild(portalRoot)
      mount.current = portalRoot
    }
    if (!el.current) {
      const bootstrapDiv = document.createElement('div')
      bootstrapDiv.id = portalID
      bootstrapDiv.className += ' transition-all duration-300'
      el.current = bootstrapDiv
    }
    setResult(createPortal(childrenWrapper as any, el.current))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const reCalculate = () => {
    /**
     * Set to new position on mouse scroll (WORKAROUND)
     * TODO: Optimize this some day, use relative offset for avoid re-calculating
     */
    const top = window.pageYOffset || document.documentElement.scrollTop
    const left = window.pageXOffset || document.documentElement.scrollLeft
    /* Bind your component into portal, place on top of app */
    if (target && el.current && bodyRef.current) {
      el.current.style.width = target.offsetWidth ? `${target.offsetWidth}px` : target.style.width
      el.current.style.height = target.offsetHeight ? `${target.offsetHeight}px` : target.style.height
      const offset = getWindowRelativeOffset(scrollElement?.current || bodyRef.current, target)
      const ele = document.getElementById(portalID)
      if (ele) {
        ele.style.left = `${offset.left + left}px`
        ele.style.top = `${offset.top - top}px`
        ele.style.pointerEvents = 'none'
        ele.style.position = 'absolute'
      }
    }
  }

  useEffect((): (() => void) | void => {
    /* Bind your component into portal, place on top of app */
    if (target === null) {
      if (!waitForTarget) setTarget((bodyRef.current as any) || document.getElementsByTagName('body')[0])
      return
    }
    if (target && el.current && bodyRef.current) {
      const offset = getWindowRelativeOffset(scrollElement?.current || bodyRef.current, target)
      el.current.style.position = 'absolute'
      el.current.style.width = target.offsetWidth ? `${target.offsetWidth}px` : target.style.width
      el.current.style.height = target.offsetHeight ? `${target.offsetHeight}px` : target.style.height
      el.current.style.left = `${offset.left}px`
      el.current.style.top = `${offset.top + window.scrollY}px`
      el.current.style.pointerEvents = 'none'
    }
    if (mount.current && el.current) {
      mount.current.appendChild(el.current)
      return () => {
        if (el.current) {
          mount.current?.removeChild(el.current)
        }
      }
    }
  }, [el, mount, target, scrollElement, waitForTarget])

  useWindowResize(() => {
    reCalculate()
  }, true)

  useEffect(() => {
    if (followScroll) window.addEventListener('scroll', reCalculate, true)
    window.addEventListener(FORCE_RECALCULATE_KEY, reCalculate)

    return () => {
      if (followScroll) window.removeEventListener('scroll', reCalculate)
      window.removeEventListener(FORCE_RECALCULATE_KEY, reCalculate)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target])

  useEffect((): void => {
    if (el.current) {
      setResult(createPortal(childrenWrapper as any, el.current))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [children])

  useEffect(() => {
    if (waitForTarget) {
      watchTarget()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [waitForTarget])

  return result
}

/**
 * Listen on portal recalculate event
 * @param callback Callback when update portal
 */
export const onRecalculatePortalEvent = (callback: () => void): void => {
  window?.addEventListener(FORCE_RECALCULATE_KEY, callback)
}

/**
 * Remove listener of portal update's event
 * @param callback Callback when portal update
 */
export const removeRecalculatePortalEvent = (callback: () => void): void => {
  window?.removeEventListener(FORCE_RECALCULATE_KEY, callback)
}

/**
 * Call portal to re-calculate position
 */
export const forceRecalculatePortal = (): void => {
  window?.dispatchEvent(new Event(FORCE_RECALCULATE_KEY))
}
