'use client'

import { useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/useToast'

import create from 'zustand'

interface Download {
  id: number
  progress: number
  isDownloading: boolean
}

interface DownloadStore {
  downloads: Download[]
  addDownload: (download: Download) => void
  updateDownload: (id: number, progress: number, isDownloading: boolean) => void
}

const useDownloadStore = create<DownloadStore>((set) => ({
  downloads: [],
  addDownload: (download) =>
    set((state) => ({
      downloads: [...state.downloads, download]
    })),
  updateDownload: (id, progress, isDownloading) =>
    set((state) => ({
      downloads: state.downloads.map((download) =>
        download.id === id ? { ...download, progress, isDownloading } : download
      )
    }))
}))

export default function ToastProgress() {
  const { toast } = useToast()
  const downloads = useDownloadStore((state) => state.downloads)
  const addDownload = useDownloadStore((state) => state.addDownload)
  const updateDownload = useDownloadStore((state) => state.updateDownload)
  const toastIdRef = useRef<Map<number, ReturnType<typeof toast>>>(new Map())

  useEffect(() => {
    const intervals = downloads.map((download) => {
      if (download.isDownloading) {
        return setInterval(() => {
          updateDownload(
            download.id,
            download.progress + 10 >= 100 ? 100 : download.progress + 10,
            download.progress + 10 < 100
          )
        }, 500)
      }
      return null
    })

    return () => intervals.forEach((interval) => interval && clearInterval(interval))
  }, [downloads, updateDownload])

  useEffect(() => {
    downloads.forEach((download) => {
      if (download.isDownloading || download.progress > 0) {
        updateToast(download)
      }
    })
  }, [downloads])

  const simulateFileDownload = () => {
    const newDownload: Download = {
      id: Date.now(),
      progress: 0,
      isDownloading: true
    }
    addDownload(newDownload)
    toastIdRef.current.set(
      newDownload.id,
      toast({
        title: 'Downloading File',
        description: <ToastContent progress={0} />,
        duration: Infinity
      })
    )
  }

  const updateToast = (download: Download) => {
    const toastInstance = toastIdRef.current.get(download.id)
    if (toastInstance) {
      toastInstance.update({
        id: toastInstance.id,
        title: download.progress >= 100 ? 'Download Complete' : 'Downloading File',
        description: <ToastContent progress={download.progress} />,
        duration: download.progress >= 100 ? 3000 : Infinity
      })

      if (download.progress >= 100) {
        setTimeout(() => {
          toastInstance.dismiss()
          toastIdRef.current.delete(download.id)
        }, 3000)
      }
    }
  }

  const ToastContent = ({ progress }: { progress: number }) => (
    <div className='h-7'>
      <div className='absolute left-0 bottom-1 w-full px-4'>
        <Progress value={progress} className='w-full' />
        <p className='mt-2 text-sm text-muted-foreground'>{progress}% complete</p>
      </div>
    </div>
  )

  return (
    <div className='flex items-center justify-center min-h-screen'>
      <Button onClick={simulateFileDownload}>Start Download</Button>
    </div>
  )
}
