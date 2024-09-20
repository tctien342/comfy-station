import React, { useState } from 'react'
import * as Icons from '@heroicons/react/16/solid'
import { Button } from '@/components/ui/button'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'

export const IconPicker: IComponent<{
  value?: string
  onSelect?: (iconName: string) => void
}> = ({ value, onSelect }) => {
  const [selectedIconName, setSelectedIconName] = useState<string>(value ?? 'ArrowDownIcon')

  const IconComponent = Icons[selectedIconName as keyof typeof Icons]

  // Get the list of icon names from lucide-react
  const iconNames = Object.keys(Icons)

  return (
    <Popover modal>
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
              <Button
                key={iconName}
                variant='ghost'
                size='icon'
                onClick={() => {
                  onSelect?.(iconName)
                  setSelectedIconName(iconName)
                }}
              >
                <Icon className='h-4 w-4' />
              </Button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
