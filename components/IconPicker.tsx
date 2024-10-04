import React, { useEffect, useState } from 'react'
import * as Icons from '@heroicons/react/16/solid'
import { Button } from '@/components/ui/button'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'

export const IconPicker: IComponent<{
  value?: string
  readonly?: boolean
  onSelect?: (iconName: string) => void
}> = ({ value, readonly, onSelect }) => {
  const [showIconPicker, setShowIconPicker] = useState(false)
  const [selectedIconName, setSelectedIconName] = useState<string>(value ?? 'ArrowDownIcon')

  const IconComponent = Icons[selectedIconName as keyof typeof Icons]

  // Get the list of icon names from lucide-react
  const iconNames = Object.keys(Icons)

  useEffect(() => {
    if (value !== selectedIconName) {
      setSelectedIconName(value ?? 'ArrowDownIcon')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  const handleSelectionIcon = (iconName: string) => {
    onSelect?.(iconName)
    setSelectedIconName(iconName)
    setShowIconPicker(false)
  }

  if (readonly) {
    return <IconComponent className='h-4 w-4' />
  }

  return (
    <Popover modal open={showIconPicker} onOpenChange={setShowIconPicker}>
      <PopoverTrigger asChild>
        <Button variant='outline'>
          <IconComponent className='h-4 w-4' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-[300px] p-4 max-h-96 overflow-y-auto'>
        <div className='grid grid-cols-6 gap-2'>
          {iconNames.map((iconName) => {
            const Icon = Icons[iconName as keyof typeof Icons]
            return (
              <Button key={iconName} variant='ghost' size='icon' onClick={() => handleSelectionIcon(iconName)}>
                <Icon className='h-4 w-4' />
              </Button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
