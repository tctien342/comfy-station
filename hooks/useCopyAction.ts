import { useState, useCallback } from 'react'

/**
 * Custom hook that provides a function to copy text to the clipboard and show a notification.
 * @returns {Function} A function to copy text to the clipboard.
 */
const useCopyAction = () => {
  const [isCopied, setIsCopied] = useState(false)

  /**
   * Copies the provided text to the clipboard and shows a notification.
   * @param {string} text - The text to be copied to the clipboard.
   */
  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2000) // Reset the copied state after 2 seconds
      })
      .catch((err) => {
        console.error('Failed to copy text: ', err)
      })
  }, [])

  return { copyToClipboard, isCopied }
}

export default useCopyAction
