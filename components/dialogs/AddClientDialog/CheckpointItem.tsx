import { LoadableButton } from '@/components/LoadableButton'
import { LoadingSVG } from '@/components/svg/LoadingSVG'
import { MultiSelect } from '@/components/ui-ext/multi-select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { EAttachmentStatus, EResourceType } from '@/entities/enum'
import { useActionDebounce } from '@/hooks/useAction'
import { useToast } from '@/hooks/useToast'
import { trpc } from '@/utils/trpc'
import { CheckIcon, PlusIcon } from '@heroicons/react/24/outline'
import { zodResolver } from '@hookform/resolvers/zod'
import { Tag } from 'lucide-react'
import { ComponentType, FocusEventHandler, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

export const CheckpointItem: IComponent<{
  ckptName: string
}> = ({ ckptName }) => {
  const fileRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const debounce = useActionDebounce(1000, true)
  const { data, isLoading, refetch } = trpc.resource.get.useQuery(
    {
      name: ckptName,
      type: EResourceType.Checkpoint
    },
    {
      refetchOnMount: false,
      refetchOnWindowFocus: false
    }
  )
  const { data: image, isLoading: imageLoading } = trpc.attachment.get.useQuery(
    {
      id: data?.image?.id!
    },
    {
      enabled: !!data?.image?.id
    }
  )

  const { data: tags, refetch: refetchTags } = trpc.tag.list.useQuery()

  const createTag = trpc.tag.create.useMutation()
  const creator = trpc.resource.create.useMutation()
  const uploader = trpc.attachment.upload.useMutation()
  const updater = trpc.resource.update.useMutation()

  const shortName = ckptName.slice(0, 2)
  const formSchema = z.object({
    displayName: z.string().optional().nullable().default(''),
    description: z.string().optional().nullable().default('')
  })
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema)
  })
  const handlePressSubmit = form.handleSubmit(async (formData) => {
    let id = data?.id
    if (!id) {
      const item = await creator.mutateAsync({
        name: ckptName,
        type: EResourceType.Checkpoint
      })
      id = item.id
    }
    debounce(async () => {
      updater
        .mutateAsync({
          id,
          title: formData.displayName ?? '',
          description: formData.description ?? ''
        })
        .then(() => refetch())
    })
  })

  useEffect(() => {
    if (data) {
      form.reset({
        displayName: data.displayName,
        description: data.description
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  const handleUploadImage = async (file: File) => {
    let id = data?.id
    if (!id) {
      const item = await creator.mutateAsync({
        name: ckptName,
        type: EResourceType.Checkpoint
      })
      id = item.id
    }
    const formData = new FormData()
    formData.append('file', file)
    formData.append('name', file.name)
    formData.append('maxWidthHeightSize', '512')
    formData.append('type', 'preview-image-jpg')
    await uploader.mutateAsync(formData).then((res) => {
      if (res.status === EAttachmentStatus.UPLOADED) {
        toast({
          title: 'Image uploaded'
        })
        updater
          .mutateAsync({
            id,
            imageId: res.id
          })
          .finally(refetch)
      } else {
        toast({
          title: 'Image upload failed',
          color: 'destructive'
        })
      }
    })
  }

  const handleFocusOut: FocusEventHandler<HTMLFormElement> = (event) => {
    const form = event.currentTarget
    if (!form.contains(event.relatedTarget)) {
      handlePressSubmit()
    }
  }

  const tagsOptions =
    tags?.map(
      (
        tag
      ): {
        label: string
        value: string
        icon?: ComponentType<{
          className?: string
        }>
      } => {
        return {
          label: tag.info.name,
          value: tag.info.id,
          icon: Tag
        }
      }
    ) ?? []

  return (
    <div className='w-full flex p-2 py-4 gap-2'>
      <input
        ref={fileRef}
        type='file'
        className='hidden'
        accept='image/*'
        multiple={false}
        onChange={(e) => {
          if (e.target.files?.item(0)) {
            handleUploadImage(e.target.files.item(0)!)
          }
        }}
      />
      <Avatar onClick={() => fileRef.current?.click()} className='m-2 w-16 h-16 !rounded-md cursor-pointer btn'>
        <AvatarImage src={uploader.isPending ? undefined : image?.url || undefined} alt={ckptName || '@checkpoint'} />
        <AvatarFallback className='rounded-md uppercase'>
          {uploader.isPending && <LoadingSVG width={16} height={16} className='repeat-infinite' />}
          {!uploader.isPending && shortName}
        </AvatarFallback>
      </Avatar>
      <div className='w-full flex flex-col gap-2'>
        <span className='text-sm font-semibold'>{ckptName}</span>
        <Form {...form}>
          <form className='space-y-4 min-w-80' onBlur={handleFocusOut}>
            <FormField
              name='displayName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Name</FormLabel>
                  <FormControl>
                    <Input placeholder='Same as file name...' {...field} />
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
                    <Textarea placeholder='A cool model for anime drawing...' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <div className='w-full flex flex-wrap items-center'>
          <MultiSelect
            options={tagsOptions}
            onValueChange={(e) => {}}
            onCreateNew={(tag) => {
              createTag.mutateAsync(tag).then(() => refetchTags())
            }}
            defaultValue={[]}
            placeholder='Select frameworks'
            variant='inverted'
            animation={2}
            maxCount={3}
          />
          {!!data?.id && (
            <div className='ml-auto'>
              <Tooltip>
                <TooltipTrigger className='flex items-center gap-1'>
                  {!!data?.updateAt && (
                    <span className='text-xs text-secondary-foreground'>
                      {new Date(data?.updateAt).toLocaleString()}
                    </span>
                  )}
                  <LoadableButton loading={updater.isPending} variant='ghost' size='icon'>
                    <CheckIcon className='text-green-500' width={18} height={18} />
                  </LoadableButton>
                </TooltipTrigger>
                <TooltipContent side='left'>
                  Resource&apos;s information is {updater.isPending ? 'updating...' : 'saved'}
                </TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
