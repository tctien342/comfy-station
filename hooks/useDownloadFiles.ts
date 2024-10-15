import { delay } from '@/utils/tools'
import { useCallback } from 'react'

/**
 * Custom hook to trigger the download of an array of files.
 * @param fileUrls - Array of file URLs to download.
 * @returns A function to trigger the download of the files.
 */
const useDownloadFiles = (fileUrls: string[]) => {
  /**
   * Function to download files.
   */
  const downloadFiles = useCallback(async () => {
    fileUrls.map((url) => window.open(url))
  }, [fileUrls])

  return downloadFiles
}

export default useDownloadFiles
