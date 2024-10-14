import { useDropzone } from 'react-dropzone'

import React, { useCallback, useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { X } from 'lucide-react'
import { PhotoView } from 'react-photo-view'

const DropFileInput: IComponent<{
  defaultFiles?: File[]
  maxFiles?: number
  disabled?: boolean
  onChanges?: (files: File[]) => void
}> = ({ defaultFiles, disabled, onChanges, maxFiles }) => {
  const [files, setFiles] = useState<File[]>(defaultFiles || [])

  const addFiles = useCallback(
    (newFiles: File[]) => {
      if (disabled) return
      if (maxFiles && files.length + newFiles.length > maxFiles) {
        setFiles([...newFiles])
        onChanges?.([...newFiles])
      } else {
        setFiles([...files, ...newFiles])
        onChanges?.([...files, ...newFiles])
      }
    },
    [disabled, files, maxFiles, onChanges]
  )

  const removeFile = useCallback(
    (file: File) => {
      if (disabled) return
      setFiles(files.filter((f) => f !== file))
      onChanges?.(files.filter((f) => f !== file))
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [disabled, files]
  )

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      addFiles(acceptedFiles)
    },
    [addFiles]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, maxFiles, disabled })

  const renderFiles = useMemo(() => {
    return files.map((file) => {
      const isImage = file.type.startsWith('image/')
      if (isImage) {
        return (
          <div key={file.name} className='flex items-center gap-2 relative group'>
            <PhotoView src={URL.createObjectURL(file)}>
              <Avatar className='!rounded-md w-20 h-20'>
                <AvatarImage src={URL.createObjectURL(file)} />
                <AvatarFallback>{file.name}</AvatarFallback>
              </Avatar>
            </PhotoView>
            <div className='absolute bottom-1 right-1 hidden group-hover:block'>
              <button
                onClick={() => removeFile(file)}
                className='bg-destructive text-white p-1 rounded-full active:scale-75 transition-all'
              >
                <X width={16} height={16} />
              </button>
            </div>
          </div>
        )
      } else {
        // Other file types
        const shortName = file.name.slice(0, 4)
        const extension = file.name.split('.').pop()
        return (
          <div key={file.name} className='flex items-center gap-2 relative group'>
            <Avatar className='!rounded-md w-20 h-20'>
              <AvatarFallback className='!rounded-md flex flex-col gap-2'>
                {shortName} <span className='text-xs bg-zinc-200 px-2 py-[2px] rounded-lg'>{extension}</span>
              </AvatarFallback>
            </Avatar>
            <div className='absolute bottom-1 right-1 hidden group-hover:block'>
              <button
                onClick={() => removeFile(file)}
                className='bg-destructive text-white p-1 rounded-full active:scale-75 transition-all'
              >
                <X width={16} height={16} />
              </button>
            </div>
          </div>
        )
      }
    })
  }, [files, removeFile])

  return (
    <div
      className={cn('flex flex-col gap-2', {
        'opacity-75 cursor-not-allowed': disabled
      })}
    >
      <div
        {...getRootProps()}
        className={cn(
          'border px-10 py-5 rounded-xl border-dashed text-center hover:border-blue-300 cursor-pointer transition-all',
          {
            'bg-gray-100': isDragActive,
            'cursor-not-allowed': disabled
          }
        )}
      >
        <input {...getInputProps()} />
        {isDragActive ? <p>Drop the files here ...</p> : <p>Drag and drop some files here, or click to select files</p>}
      </div>
      <div className='w-full flex gap-1 overflow-auto'>{renderFiles}</div>
    </div>
  )
}

export default DropFileInput
