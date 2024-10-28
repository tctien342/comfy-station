/* eslint-disable jsx-a11y/alt-text */
'use client'
import { AttachmentReview } from '@/components/AttachmentReview'
import { LoadableButton } from '@/components/LoadableButton'
import { MiniBadge } from '@/components/MiniBadge'
import { LoadingSVG } from '@/components/svg/LoadingSVG'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { EUserRole } from '@/entities/enum'
import { User } from '@/entities/user'
import { ECompressPreset, useAttachmentUploader } from '@/hooks/useAttachmentUploader'
import { EGlobalEvent, useGlobalEvent } from '@/hooks/useGlobalEvent'
import { useToast } from '@/hooks/useToast'
import { cn } from '@/lib/utils'
import { trpc } from '@/utils/trpc'
import { zodResolver } from '@hookform/resolvers/zod'
import { CaretSortIcon, UpdateIcon } from '@radix-ui/react-icons'
import { DollarSign, Dumbbell, Image, Play, Trash2 } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useMemo, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const UpdateSchema = z.object({
  avatarId: z.string().optional(),
  role: z.nativeEnum(EUserRole).default(EUserRole.User).optional(),
  balance: z
    .number({
      coerce: true
    })
    .default(-1)
    .optional(),
  weightOffset: z
    .number({
      coerce: true
    })
    .default(1)
    .optional(),
  password: z.string().optional(),
  reEnterPassword: z.string().optional()
})

type TUpdateInput = z.infer<typeof UpdateSchema>

const UserUpdater: IComponent<{
  user: User
  onRefresh?: () => void
}> = ({ user, onRefresh }) => {
  const { toast } = useToast()
  const session = useSession()
  const fileRef = useRef<HTMLInputElement>(null)
  const updater = trpc.user.adminUpdate.useMutation()
  const deletor = trpc.user.delete.useMutation()
  const { uploader, uploadAttachment } = useAttachmentUploader()
  const updateForm = useForm<TUpdateInput>({
    resolver: zodResolver(UpdateSchema),
    defaultValues: {
      avatarId: user.avatar?.id,
      role: user.role,
      balance: user.balance,
      weightOffset: user.weightOffset,
      password: '',
      reEnterPassword: ''
    }
  })

  const handleRefresh = () => {
    if (user.id === session.data?.user.id) {
      session.update()
    }
    onRefresh?.()
  }

  const handleUpdate = updateForm.handleSubmit(async (data) => {
    if (data.password?.length) {
      if (data.password.length < 8) {
        updateForm.setError('password', {
          type: 'manual',
          message: 'Password must be at least 8 characters'
        })
        return
      }
      if (data.password !== data.reEnterPassword) {
        updateForm.setError('reEnterPassword', {
          type: 'manual',
          message: 'Password does not match'
        })
        return
      }
    }
    await updater
      .mutateAsync({
        id: user.id,
        avatarId: data.avatarId,
        role: data.role,
        balance: data.balance,
        weightOffset: data.weightOffset,
        password: data.password
      })
      .then(() => {
        toast({
          title: 'User updated',
          description: 'User has been updated successfully'
        })
      })
      .catch(() => {
        toast({
          title: 'User update failed',
          description: 'Failed to update user',
          variant: 'destructive'
        })
      })
    handleRefresh()
  })
  const handlePressDelete = async () => {
    if (user.id === session.data?.user.id) {
      toast({
        title: 'Delete failed',
        description: 'You cannot delete yourself',
        variant: 'destructive'
      })
      return
    }
    await deletor
      .mutateAsync({ id: user.id })
      .then(() => {
        toast({
          title: 'User deleted',
          description: 'User has been deleted successfully'
        })
      })
      .catch(() => {
        toast({
          title: 'User delete failed',
          description: 'Failed to delete user',
          variant: 'destructive'
        })
      })
    handleRefresh()
  }
  const handleUploadAvatar = async (file: File) => {
    await uploadAttachment(file, {
      resizeToMax: 512,
      compressPreset: ECompressPreset.PREVIEW
    })
      .then(async (res) => {
        await updater.mutateAsync({
          id: user.id,
          avatarId: res.id
        })
        toast({
          title: 'Avatar uploaded'
        })
        handleRefresh()
      })
      .catch((e) => {
        toast({
          title: 'Avatar upload failed',
          color: 'destructive'
        })
      })
  }
  const handleReset = () => updateForm.reset()

  return (
    <Form {...updateForm}>
      <input
        ref={fileRef}
        type='file'
        className='hidden'
        accept='image/*'
        multiple={false}
        onChange={(e) => {
          if (e.target.files?.item(0)) {
            handleUploadAvatar(e.target.files.item(0)!)
          }
        }}
      />
      <form className='gap-2 p-2 flex flex-wrap items-center' onSubmit={handleUpdate}>
        <FormField
          name='role'
          render={({ field }) => (
            <FormItem className='w-1/2'>
              <FormLabel>Type of user</FormLabel>
              <div className='flex gap-2'>
                <Select
                  onValueChange={(val: any) => field.onChange(EUserRole[val as EUserRole])}
                  value={EUserRole[field.value]}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select type of user' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={EUserRole[EUserRole.Admin]}>
                      <div className='flex items-center'>Admin</div>
                    </SelectItem>
                    <SelectItem value={EUserRole[EUserRole.Editor]}>
                      <div className='flex items-center'>Editor</div>
                    </SelectItem>
                    <SelectItem value={EUserRole[EUserRole.User]}>
                      <div className='flex items-center'>User</div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <FormDescription>Set the role of the user</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className='w-full grid grid-cols-2 gap-2'>
          <FormField
            name='balance'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Balance</FormLabel>
                <FormControl>
                  <Input type='number' placeholder='-1' {...field} />
                </FormControl>
                <FormDescription>Set the balance of the user (-1 for infinity)</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name='weightOffset'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority</FormLabel>
                <FormControl>
                  <Input type='number' placeholder='-1' {...field} />
                </FormControl>
                <FormDescription>Set the priority of the user (higher mean lower priority)</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className='w-full grid grid-cols-2 gap-2'>
          <FormField
            name='password'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input placeholder='****' type='password' {...field} />
                </FormControl>
                <FormDescription>Set new password for user</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name='reEnterPassword'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Repeat password</FormLabel>
                <FormControl>
                  <Input placeholder='****' type='password' {...field} />
                </FormControl>
                <FormDescription>Re-enter your new password</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className='w-full flex flex-wrap gap-2'>
          <LoadableButton loading={updater.isPending} type='submit'>
            <UpdateIcon className='w-4 h-4 mr-2' /> Update
          </LoadableButton>
          <Button disabled={deletor.isPending} onClick={handlePressDelete} type='button' variant='destructive'>
            <Trash2 className='w-4 h-4 mr-2' />
            Delete
          </Button>
          <LoadableButton
            variant='outline'
            type='button'
            loading={uploader.isPending}
            onClick={() => {
              fileRef.current?.click()
            }}
          >
            <Image className='w-4 h-4 mr-2' /> Update avatar
          </LoadableButton>
          <Button disabled={updater.isPending} type='button' onClick={handleReset} className='ml-auto' variant='ghost'>
            Reset
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default function SettingUserPage() {
  const users = trpc.user.list.useQuery()

  useGlobalEvent(EGlobalEvent.RLOAD_USER_LIST, () => users.refetch())

  const renderUserList = useMemo(() => {
    if (!users.data || users.isLoading) return null
    return users.data
      .sort((a, b) => b.user.role - a.user.role)
      .map(({ user, runCount }, idx) => {
        const shortName = user.email.split('@')[0].slice(0, 2).toUpperCase()
        return (
          <Collapsible key={user.id}>
            <CollapsibleTrigger asChild>
              <div
                className={cn('w-full flex flex-row gap-2 p-2 cursor-pointer', {
                  'bg-secondary/30': idx % 2 === 0
                })}
              >
                <AttachmentReview mode='avatar' shortName={shortName} data={user.avatar} className='rounded' />
                <div className='flex-1 h-full flex flex-col gap-2'>
                  <div>
                    <span>{user.email}</span>
                  </div>
                  <div className='flex flex-wrap gap-1'>
                    <MiniBadge
                      title={EUserRole[user.role]}
                      className={cn('w-min', {
                        'bg-green-500 text-white border-none': user.role === EUserRole.Admin,
                        'bg-blue-500 text-white border-none': user.role === EUserRole.Editor,
                        'bg-black text-white border-none': user.role === EUserRole.User
                      })}
                    />
                    <MiniBadge Icon={DollarSign} title='Balance' count={user.balance} />
                    <MiniBadge Icon={Dumbbell} title='Priority' count={user.weightOffset} />
                    <MiniBadge Icon={Play} title='Tasks' count={`${runCount}`} />
                  </div>
                </div>
                <CaretSortIcon className='h-4 w-4 my-auto mr-2' />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className='space-y-2 w-full'>
              <UserUpdater onRefresh={users.refetch} user={user} />
            </CollapsibleContent>
          </Collapsible>
        )
      })
  }, [users.data, users.isLoading, users.refetch])

  return (
    <div className='w-full h-full relative overflow-hidden'>
      {users.isLoading && <LoadingSVG className='w-6 h-6 m-auto' />}
      <div className='absolute top-0 left-0 w-full h-full overflow-x-hidden overflow-y-auto divide-y-[1px] pb-10'>
        {renderUserList}
      </div>
    </div>
  )
}
