import { IconPicker } from '@/components/IconPicker'
import { LoadableButton } from '@/components/LoadableButton'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
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
import { IMapperInput, IMapTarget } from '@/entities/workflow'
import {
  BeakerIcon,
  BoldIcon,
  CalendarDaysIcon,
  CheckIcon,
  CubeIcon,
  DocumentArrowUpIcon,
  LanguageIcon,
  ListBulletIcon,
  PhotoIcon,
  PuzzlePieceIcon,
  SparklesIcon,
  VariableIcon
} from '@heroicons/react/24/outline'
import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronLeft, PlusIcon, Trash } from 'lucide-react'
import { useContext, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { SelectResourceList } from './SelectResourceList'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ConnectionList } from './ConnectionList'
import { AddWorkflowDialogContext } from '..'
import e from 'cors'

export const CreateInputNode: IComponent<{
  config?: IMapperInput
  onHide: () => void
}> = ({ onHide, config }) => {
  const isUpdating = !!config
  const { workflow, setWorkflow } = useContext(AddWorkflowDialogContext)
  const [selections, setSelections] = useState<
    {
      id?: string
      value: string
    }[]
  >(config?.selections ?? [])
  const [connections, setConnections] = useState<Array<IMapTarget>>(config?.target ?? [])
  const formSchema = z.object({
    // Regex is url host name
    type: z.union([z.nativeEnum(EValueType), z.nativeEnum(EValueSelectionType)]),
    icon: z.string().optional(),
    costRelated: z.boolean().default(false),
    costPerUnit: z.coerce.number().optional(),
    default: z.union([z.string(), z.number(), z.boolean()]).optional(),
    min: z.coerce.number().optional(),
    max: z.coerce.number().optional(),
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

  const mappingType = form.watch('type')

  const isSelectionType = z.nativeEnum(EValueSelectionType).safeParse(mappingType)
  const allowDefaultType = z
    .enum([EValueType.Boolean, EValueType.String, EValueType.Number, EValueType.Seed])
    .safeParse(mappingType)

  useEffect(() => {
    if (mappingType === config?.type) return
    switch (mappingType) {
      case EValueType.Number:
        form.setValue('icon', 'VariableIcon')
        break
      case EValueType.String:
        form.setValue('icon', 'LanguageIcon')
        break
      case EValueType.Image:
        form.setValue('icon', 'PhotoIcon')
        break
      case EValueType.File:
        form.setValue('icon', 'DocumentArrowUpIcon')
        break
      case EValueType.Boolean:
        form.setValue('icon', 'CheckIcon')
        break
      case EValueType.Seed:
        form.setValue('icon', 'SparklesIcon')
        break
      case EValueSelectionType.Checkpoint:
        form.setValue('icon', 'CubeIcon')
        break
      case EValueSelectionType.Lora:
        form.setValue('icon', 'PuzzlePieceIcon')
        break
      case EValueSelectionType.Sampler:
        form.setValue('icon', 'BeakerIcon')
        break
      case EValueSelectionType.Scheduler:
        form.setValue('icon', 'CalendarDaysIcon')
        break
      case EValueSelectionType.Custom:
        form.setValue('icon', 'ListBulletIcon')
        break
    }
    setSelections([])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mappingType])

  const handleSubmit = form.handleSubmit((data) => {
    if (config) {
      // Update current config
      setWorkflow?.((prev) => ({
        ...workflow,
        mapInput: {
          ...prev?.mapInput,
          [config.key]: {
            ...config,
            ...data,
            key: data.name,
            iconName: data.icon,
            selections,
            cost: {
              related: data.costRelated ?? false,
              costPerUnit: data.costPerUnit ?? 0
            },
            target: connections
          }
        }
      }))
    } else {
      setWorkflow?.((prev) => ({
        ...workflow,
        mapInput: {
          ...prev?.mapInput,
          [data.name]: {
            ...data,
            iconName: data.icon,
            key: data.name,
            cost: {
              related: data.costRelated ?? false,
              costPerUnit: data.costPerUnit ?? 0
            },
            selections,
            target: connections
          }
        }
      }))
    }
    onHide()
  })

  const handlePressDelete = () => {
    if (config) {
      setWorkflow?.((prev) => {
        const { [config.key]: _, ...rest } = prev?.mapInput || {}
        return {
          ...prev,
          mapInput: rest
        }
      })
    }
    onHide()
  }

  const handleUpdateConnections = (connections: IMapTarget[], defaultVal?: string | number | boolean) => {
    setConnections(connections)
    const crrDefault = form.getValues('default')?.toString() ?? ''
    if (!!defaultVal && crrDefault.trim() === '') {
      form.setValue('default', defaultVal)
    }
  }

  return (
    <Form {...form}>
      <form className='w-full h-full flex flex-col' onSubmit={handleSubmit}>
        <div className='space-y-2 h-auto'>
          <h1 className='font-semibold mb-1'>{isUpdating ? 'UPDATE' : 'CREATE'} INPUT NODE</h1>
          <FormField
            name='type'
            render={({ field }) => (
              <FormItem>
                <FormLabel>CHOOSE YOUR TYPE OF INPUT</FormLabel>
                <div className='flex gap-2'>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select type of input' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Normal input</SelectLabel>
                        <SelectItem value={EValueType.Number}>
                          <div className='flex items-center'>
                            <VariableIcon className='mr-2 h-4 w-4' />
                            Number
                          </div>
                        </SelectItem>
                        <SelectItem value={EValueType.String}>
                          <div className='flex items-center'>
                            <LanguageIcon className='mr-2 h-4 w-4' />
                            String
                          </div>
                        </SelectItem>
                        <SelectItem value={EValueType.Boolean}>
                          <div className='flex items-center'>
                            <CheckIcon className='mr-2 h-4 w-4' />
                            Boolean
                          </div>
                        </SelectItem>
                        <SelectItem value={EValueType.Seed}>
                          <div className='flex items-center'>
                            <SparklesIcon className='mr-2 h-4 w-4' />
                            Seed
                          </div>
                        </SelectItem>
                        <SelectSeparator />
                        <SelectGroup>
                          <SelectLabel>Upload input</SelectLabel>
                          <SelectItem value={EValueType.Image}>
                            <div className='flex items-center'>
                              <PhotoIcon className='mr-2 h-4 w-4' />
                              Image
                            </div>
                          </SelectItem>
                          <SelectItem value={EValueType.File}>
                            <div className='flex items-center'>
                              <DocumentArrowUpIcon className='mr-2 h-4 w-4' />
                              File
                            </div>
                          </SelectItem>
                        </SelectGroup>
                      </SelectGroup>
                      <SelectSeparator />
                      <SelectGroup>
                        <SelectLabel>Selection input</SelectLabel>
                        <SelectItem value={EValueSelectionType.Checkpoint}>
                          <div className='flex items-center'>
                            <CubeIcon className='mr-2 h-4 w-4' />
                            Checkpoint
                          </div>
                        </SelectItem>
                        <SelectItem value={EValueSelectionType.Lora}>
                          <div className='flex items-center'>
                            <PuzzlePieceIcon className='mr-2 h-4 w-4' />
                            Lora
                          </div>
                        </SelectItem>
                        <SelectItem value={EValueSelectionType.Sampler}>
                          <div className='flex items-center'>
                            <BeakerIcon className='mr-2 h-4 w-4' />
                            Sampler
                          </div>
                        </SelectItem>
                        <SelectItem value={EValueSelectionType.Scheduler}>
                          <div className='flex items-center'>
                            <CalendarDaysIcon className='mr-2 h-4 w-4' />
                            Scheduler
                          </div>
                        </SelectItem>
                        <SelectItem value={EValueSelectionType.Custom}>
                          <div className='flex items-center'>
                            <ListBulletIcon className='mr-2 h-4 w-4' />
                            Custom
                          </div>
                        </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <IconPicker value={form.watch('icon')} onSelect={(name) => form.setValue('icon', name)} />
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          {isSelectionType.success && (
            <SelectResourceList
              defaultValue={form.watch('default') as string}
              onChangeDefault={(value) => form.setValue('default', value)}
              selected={selections}
              onChange={setSelections}
              type={isSelectionType.data}
            />
          )}
          {mappingType === EValueType.Number && (
            <>
              <FormField
                name='costRelated'
                render={({ field }) => (
                  <FormItem>
                    <div className='flex items-center space-x-2'>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                      <Label htmlFor='airplane-mode'>Cost related</Label>
                    </div>
                    <FormDescription>
                      If this input is related to cost, you can set the cost per unit below.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {form.watch('costRelated') && (
                <FormField
                  name='costPerUnit'
                  disabled={!form.watch('costRelated')}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cost per value</FormLabel>
                      <FormControl>
                        <Input placeholder='0' type='number' {...field} />
                      </FormControl>
                      <FormDescription>New cost = base + costPerUnit * value</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                name='min'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Min value</FormLabel>
                    <FormControl>
                      <Input placeholder='Specify to enable....' type='number' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name='max'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max value</FormLabel>
                    <FormControl>
                      <Input placeholder='Specify to enable....' type='number' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
          <div className='w-full flex flex-col gap-2 mt-2'>
            <ConnectionList connections={connections} onUpdate={handleUpdateConnections} />
          </div>
          {allowDefaultType.success && (
            <FormField
              name='default'
              render={({ field }) => {
                if (mappingType === EValueType.Boolean) {
                  return (
                    <FormItem className='flex flex-col mt-2'>
                      <FormLabel>Default value</FormLabel>
                      <div className='flex items-center space-x-2'>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                        <Label htmlFor='airplane-mode'>Default value is {field.value ? 'true' : 'false'}</Label>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )
                }
                return (
                  <FormItem>
                    <FormLabel>Default value</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='...'
                        type={
                          [EValueType.Number, EValueType.Seed].includes(mappingType as EValueType) ? 'number' : 'text'
                        }
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )
              }}
            />
          )}
          <FormField
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder='Your input name...' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name='description'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder='Your input description...' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className='flex gap-2 pt-2 w-full items-center'>
          {isUpdating && (
            <Button onClick={handlePressDelete} variant='destructive' className=''>
              Delete
              <Trash width={16} height={16} className='ml-2' />
            </Button>
          )}
          <Button onClick={onHide} variant='secondary' className='ml-auto'>
            Back
            <ChevronLeft width={16} height={16} className='ml-2' />
          </Button>
          <LoadableButton>
            {isUpdating ? 'Update' : 'Create'}
            {isUpdating ? <CheckIcon width={16} height={16} className='ml-2' /> : <PlusIcon width={16} height={16} />}
          </LoadableButton>
        </div>
      </form>
    </Form>
  )
}
