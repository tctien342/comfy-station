import { Workflow } from '@/entities/workflow'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { EValueSelectionType, EValueType } from '@/entities/enum'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select'
import DropFileInput from './DropFileInput'
import { CardDescription } from './ui/card'
import { Input } from './ui/input'
import { useEffect, useState } from 'react'
import { z } from 'zod'
import { IconPicker } from './IconPicker'
import { OverflowText } from './OverflowText'
import { Button } from './ui/button'
import { Dice5 } from 'lucide-react'
import { seed } from '@/utils/tools'
import { useWorkflowVisStore } from './WorkflowVisualize/state'

const SelectionSchema = z.nativeEnum(EValueSelectionType)

export const WorkflowInputArea: IComponent<{
  workflow: Partial<Workflow>
  disabled?: boolean
  data?: Record<string, any>
  onChange?: (data: Record<string, any>) => void
}> = ({ data, workflow, disabled, onChange }) => {
  const [inputData, setInputData] = useState<Record<string, any>>(data || {})
  const { updateSelecting, recenter } = useWorkflowVisStore()

  const inputKeys: Array<keyof typeof workflow.mapInput> = Object.keys(workflow?.mapInput || {}) as any

  const renderInput = inputKeys.map((val) => {
    const input = workflow?.mapInput?.[val]
    const target = input?.target || []
    const mainItem = target[0]
    if (!input) return null

    return (
      <div
        key={val}
        onFocus={() => {
          if (mainItem) {
            updateSelecting(mainItem.mapVal.split('.')[0])
          }
        }}
        onBlur={() => {
          updateSelecting()
        }}
        className='w-full px-2 flex flex-col gap-2 mb-2'
      >
        <div className='flex items-center gap-1'>
          <IconPicker readonly value={input.iconName} />
          <Label>{input.key}</Label>
        </div>
        {!!input.description && <CardDescription>{input.description}</CardDescription>}
        {input.type === EValueType.String && (
          <Textarea
            disabled={disabled}
            className='min-h-[240px] max-w-full'
            onChange={(e) => {
              setInputData((prev) => ({ ...prev, [val]: e.target.value }))
            }}
            value={inputData[val]}
            defaultValue={String(input.default ?? '')}
          />
        )}
        {[EValueType.File, EValueType.Image].includes(input.type as EValueType) && (
          <DropFileInput
            disabled={disabled}
            maxFiles={1}
            onChanges={(files) => {
              setInputData((prev) => ({ ...prev, [val]: files }))
            }}
            defaultFiles={inputData[val]}
          />
        )}
        {[EValueType.Number, EValueType.Seed].includes(input.type as EValueType) && (
          <div className='w-full gap-2 flex'>
            <Input
              disabled={disabled}
              defaultValue={String(input.default ?? '')}
              value={inputData[val]}
              onChange={(e) => {
                setInputData((prev) => ({ ...prev, [val]: e.target.value }))
              }}
              min={input.min}
              max={input.max}
              type='number'
            />
            {input.type === EValueType.Seed && (
              <Button
                onClick={() => {
                  setInputData((prev) => ({ ...prev, [val]: seed() }))
                }}
                variant='outline'
                size='icon'
              >
                <Dice5 className='w-4 h-4' />
              </Button>
            )}
          </div>
        )}
        {SelectionSchema.safeParse(input.type).success && (
          <Select
            defaultValue={String(input.default ?? '')}
            value={inputData[val]}
            onValueChange={(value) => {
              setInputData((prev) => ({ ...prev, [val]: value }))
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder='Select...' />
            </SelectTrigger>
            <SelectContent>
              {input.selections!.map((selection) => (
                <SelectItem key={selection.value} value={selection.value}>
                  <div className='w-[300px] whitespace-normal break-words text-left'>{selection.value}</div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    )
  })

  useEffect(() => {
    onChange?.(inputData)
  }, [inputData])

  return (
    <div className='absolute top-0 left-0 w-full h-full flex flex-col'>
      <div
        className='mt-2 border-t w-full h-full relative overflow-auto pt-2 shadow-inner'
        onBlur={() => {
          recenter?.()
        }}
      >
        {renderInput}
      </div>
      <div className='flex flex-col border-t pb-2 px-2'>
        <div>
          <Label>Description</Label>
          <OverflowText className='text-sm w-full line-clamp-3 text-start'>{workflow?.description}</OverflowText>
        </div>
        <div>
          <Label>Base cost per run</Label>
          <p className='text-sm'>{workflow?.cost} Credits</p>
        </div>
        <div>
          <Label>Author</Label>
          <p className='text-sm'>@{workflow?.author?.email.split('@')[0]}</p>
        </div>
      </div>
    </div>
  )
}
