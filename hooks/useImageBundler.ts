import { useState } from 'react'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'

interface UseImageBundlerResult {
  bundleImages: (fileUrls: string[]) => Promise<void>
  isLoading: boolean
  error: string | null
  progress: number
}

const useImageBundler = (): UseImageBundlerResult => {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<number>(0)

  /**
   * Download a file from a URL with progress reporting
   * @param url - The URL of the file to download
   * @param onProgress - Callback to report download progress
   * @returns Promise<Blob> - The downloaded file as a Blob
   */
  const downloadFile = async (url: string, onProgress: (progress: number) => void): Promise<Blob> => {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to download file: ${url}`)
    }

    const reader = response.body?.getReader()
    const contentLength = response.headers.get('Content-Length')
    const total = contentLength ? parseInt(contentLength, 10) : 0
    let loaded = 0

    const chunks: Uint8Array[] = []
    while (true) {
      const { done, value } = await reader!.read()
      if (done) break
      chunks.push(value)
      loaded += value.length
      onProgress((loaded / total) * 100)
    }

    return new Blob(chunks)
  }

  /**
   * Bundle multiple image files into a zip file and save it to the user's computer
   * @param fileUrls - An array of file URLs to download and bundle
   */
  const bundleImages = async (fileUrls: string[]): Promise<void> => {
    setIsLoading(true)
    setError(null)
    setProgress(0)

    try {
      const zip = new JSZip()
      const totalFiles = fileUrls.length
      let completedFiles = 0
      let percents: number[] = Array(totalFiles).fill(0)

      // Download each file in parallel and add it to the zip
      await Promise.all(
        fileUrls.map(async (url, idx) => {
          const fileName = url.split('/').pop()?.split('?')[0] || 'file'
          const fileBlob = await downloadFile(url, (fileProgress) => {
            percents[idx] = fileProgress
            setProgress(percents.reduce((acc, cur) => acc + cur, 0) / totalFiles)
          })
          zip.file(fileName, fileBlob)
          completedFiles++
          setProgress((completedFiles / totalFiles) * 100)
        })
      )

      // Generate the zip file and save it
      const zipBlob = await zip.generateAsync({ type: 'blob' })
      saveAs(zipBlob, 'images.zip')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  return { bundleImages, isLoading, error, progress }
}

export default useImageBundler
