/**
 * Handle when key pressed
 */

import { useCallback, useEffect } from 'react'

export enum EKeyboardKey {
  Enter = 'Enter',
  Escape = 'Escape'
}

export enum ESpecialKey {
  Ctrl = 'Control',
  Alt = 'Alt',
  Shift = 'Shift'
}

export const useShortcutKeyEvent = (key: EKeyboardKey, callback: () => void, combo?: ESpecialKey) => {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      let comboActivated = true
      if (combo) {
        switch (combo) {
          case ESpecialKey.Ctrl:
            comboActivated = e.ctrlKey
            break
          case ESpecialKey.Alt:
            comboActivated = e.altKey
            break
          case ESpecialKey.Shift:
            comboActivated = e.shiftKey
            break
        }
      }
      if (e.key === key && comboActivated) {
        callback()
      }
    },
    [callback, combo, key]
  )
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])
}
