import { IconPicker } from '@/components/IconPicker'
import { LoadableButton } from '@/components/LoadableButton'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectGroup,
  SelectSeparator
} from '@/components/ui/select'
import { EValueSelectionType, EValueType } from '@/entities/enum'
import { IMapperInput } from '@/entities/workflow'
import { VariableIcon } from '@heroicons/react/24/outline'
import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronLeft, ArrowRight, PlusIcon } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

export const CreateInputNode: IComponent<{
  config?: IMapperInput
  onHide: () => void
}> = ({ onHide, config }) => {
  const formSchema = z.object({
    // Regex is url host name
    type: z.union([z.nativeEnum(EValueType), z.nativeEnum(EValueSelectionType)]),
    icon: z.string().optional(),
    costRelated: z.boolean().default(false),
    costPerUnit: z.number().optional(),
    default: z.union([z.string(), z.number(), z.boolean()]).optional(),
    min: z.number().optional(),
    max: z.number().optional(),
    name: z.string(),
    description: z.string().optional()
  })
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: config?.type,
      icon: config?.iconName,
      costRelated: config?.cost?.related,
      costPerUnit: config?.cost?.costPerUnit,
      default: config?.default,
      min: config?.min,
      max: config?.max,
      name: config?.key,
      description: config?.description
    }
  })

  const handleSubmit = form.handleSubmit((data) => {})

  return (
    <Form {...form}>
      <form className='w-full h-full flex flex-col' onSubmit={handleSubmit}>
        <div className='flex-1'>
          <h1 className='font-semibold'>CREATE INPUT NODE</h1>
          <FormField
            name='type'
            render={({ field }) => (
              <FormItem>
                <FormLabel>CHOOSE YOUR TYPE OF INPUT</FormLabel>
                <div className='flex gap-2'>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select a verified email to display' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Normal input</SelectLabel>
                        <SelectItem value={EValueType.Number} className='flex flex-row'>
                          Number
                        </SelectItem>
                        <SelectItem value={EValueType.String}>String</SelectItem>
                        <SelectItem value={EValueType.Image}>Image</SelectItem>
                        <SelectItem value={EValueType.File}>File</SelectItem>
                        <SelectItem value={EValueType.Boolean}>Boolean</SelectItem>
                        <SelectItem value={EValueType.Seed}>Seed</SelectItem>
                      </SelectGroup>
                      <SelectSeparator />
                      <SelectGroup>
                        <SelectLabel>Selection input</SelectLabel>
                        <SelectItem value={EValueSelectionType.Checkpoint}>Checkpoint</SelectItem>
                        <SelectItem value={EValueSelectionType.Lora}>Lora</SelectItem>
                        <SelectItem value={EValueSelectionType.Sampler}>Sampler</SelectItem>
                        <SelectItem value={EValueSelectionType.Scheduler}>Scheduler</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <IconPicker value={form.watch('icon')} onSelect={(name) => form.setValue('icon', name)} />
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className='flex gap-2 w-full justify-end items-center'>
          <Button onClick={onHide} variant='secondary' className=''>
            Back
            <ChevronLeft width={16} height={16} className='ml-2' />
          </Button>
          <LoadableButton>
            Add
            <PlusIcon width={16} height={16} className='ml-2' />
          </LoadableButton>
        </div>
      </form>
    </Form>
  )
}
