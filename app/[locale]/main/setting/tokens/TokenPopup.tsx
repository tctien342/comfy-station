import { LoadableButton } from '@/components/LoadableButton'
import { MultiSelect } from '@/components/ui-ext/multi-select'
import { Button } from '@/components/ui/button'
import { Dialog, DialogHeader, DialogContent, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { ETokenType, EUserRole } from '@/entities/enum'
import { EGlobalEvent, useGlobalEvent } from '@/hooks/useGlobalEvent'
import { toast } from '@/hooks/useToast'
import { trpc } from '@/utils/trpc'
import { zodResolver } from '@hookform/resolvers/zod'
import { Check, X } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const TokenSchema = z.object({
  expiredAt: z
    .date({
      coerce: true
    })
    .optional(),
  type: z.nativeEnum(ETokenType),
  balance: z.number({ coerce: true }).optional(),
  description: z.string().optional(),
  weightOffset: z.number({ coerce: true }).optional(),
  workflowIds: z.array(z.string()).optional(),
  isMasterToken: z.boolean().optional().describe('Allow execute all workflow')
})

type TokenInput = z.infer<typeof TokenSchema>

export const TokenPopup: IComponent<{
  onRefresh?: () => void
}> = ({ onRefresh }) => {
  const query = useSearchParams()
  const pathname = usePathname()
  const route = useRouter()
  const tokenId = query.get('token_id')

  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)

  const form = useForm<TokenInput>({
    resolver: zodResolver(TokenSchema),
    defaultValues: {
      balance: -1,
      description: '',
      type: ETokenType.Both,
      weightOffset: 0,
      isMasterToken: false
    }
  })
  const tokenData = trpc.token.get.useQuery(
    { tokenId: tokenId! },
    {
      enabled: !!tokenId
    }
  )

  const workflows = trpc.workflow.listWorkflowSelections.useQuery()

  const isAdmin = session?.user?.role === EUserRole.Admin
  const isMasterToken = form.watch('isMasterToken')

  const creator = trpc.token.create.useMutation()
  const updater = trpc.token.update.useMutation()

  const handleSubmitToken = form.handleSubmit(async (input) => {
    if (tokenId) {
      updater
        .mutateAsync({ tokenId, ...input })
        .then(() => {
          setIsOpen(false)
          onRefresh?.()
        })
        .catch((err: Error) => {
          toast({
            title: err.message || 'Failed to update token'
          })
        })
    } else {
      creator
        .mutateAsync(input)
        .then(() => {
          setIsOpen(false)
          onRefresh?.()
        })
        .catch((err) => {
          toast({
            title: 'Failed to create token'
          })
        })
    }
  })

  useGlobalEvent(EGlobalEvent.BTN_CREATE_TOKEN, () => {
    setIsOpen(true)
  })

  useEffect(() => {
    if (tokenData.data) {
      form.setValue('description', tokenData.data.description ?? '')
      form.setValue('type', tokenData.data.type)
      form.setValue('balance', tokenData.data.balance)
      form.setValue('weightOffset', tokenData.data.weightOffset)
      form.setValue(
        'expiredAt',
        tokenData.data.expireAt ? (new Date(tokenData.data.expireAt).toISOString().substr(0, 10) as any) : undefined
      )
      form.setValue('isMasterToken', tokenData.data.isMaster)
      form.setValue('workflowIds', tokenData.data.grantedWorkflows?.map((v) => v.workflow.id) ?? [])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenData.data])

  useEffect(() => {
    // Clear tokenId from query
    if (!isOpen) {
      route.push(pathname)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  const workflowSelectionOptions = workflows.data?.map((v) => ({ value: v.id, label: v.name ?? '' })) ?? []

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle className='text-base font-bold'>{tokenId ? 'Update' : 'Create'} API Token</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleSubmitToken} className='grid gap-2'>
            <FormField
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormDescription>
                    A description of the token. This will help you identify the token later.
                  </FormDescription>
                  <FormControl>
                    <Textarea placeholder='This is a test token...' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name='type'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <FormDescription>
                    Type of this token. Set <strong>Both</strong> for running in Web and API.
                  </FormDescription>
                  <FormControl>
                    <Tabs value={field.value} onValueChange={(val) => field.onChange(val)} className='w-full'>
                      <TabsList>
                        <TabsTrigger value={ETokenType.Both}>Both</TabsTrigger>
                        <TabsTrigger value={ETokenType.Web}>Web</TabsTrigger>
                        <TabsTrigger value={ETokenType.Api}>Api</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </FormControl>
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
                    <FormDescription>
                      Balance of this token. Set <strong>-1</strong> for sync with owner balance. Any other value will
                      reduce your balance.
                    </FormDescription>
                    <FormControl>
                      <Input type='number' placeholder='-1' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name='weightOffset'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight Offset</FormLabel>
                    <FormDescription>
                      More offset mean lower priority. Only Admin can create negative offset.
                    </FormDescription>
                    <FormControl>
                      <Input type='number' placeholder='0' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              name='expiredAt'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expired At</FormLabel>
                  <FormDescription>Set expired date for this token. Leave empty for no expired date.</FormDescription>
                  <div className='flex items-center space-x-2'>
                    <Switch
                      id='unlimited-mode'
                      checked={!form.watch('expiredAt')}
                      onCheckedChange={(val) => {
                        field.onChange(val ? undefined : (new Date().toISOString().substr(0, 10) as any))
                      }}
                    />
                    <Label htmlFor='unlimited-mode'>Never Expired</Label>
                  </div>
                  <FormControl>
                    <Input disabled={form.watch('expiredAt') === undefined} type='date' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name='isMasterToken'
              disabled={!isAdmin}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Master Token</FormLabel>
                  <FormDescription>
                    Allow execute all workflow. Only Admin can create this type of token.
                  </FormDescription>
                  <FormControl>
                    <Switch disabled={!isAdmin} checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name='workflowIds'
              disabled={isMasterToken}
              render={() => (
                <FormItem>
                  <FormLabel>Workflows</FormLabel>
                  <FormDescription>Select workflows that this token can execute.</FormDescription>
                  <FormControl>
                    <MultiSelect
                      disabled={isMasterToken}
                      modalPopover
                      defaultValue={form.watch('workflowIds') ?? []}
                      options={workflowSelectionOptions}
                      onValueChange={(val) => {
                        form.setValue('workflowIds', val)
                      }}
                      placeholder='Select Workflows'
                      variant='inverted'
                      animation={1}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className='mt-2'>
              <Button
                type='button'
                disabled={creator.isPending || updater.isPending}
                onClick={() => setIsOpen(false)}
                variant='secondary'
              >
                Cancel <X size={16} className='ml-1' />
              </Button>
              <LoadableButton type='submit' loading={creator.isPending || updater.isPending}>
                {!tokenId ? 'Create' : 'Update'} <Check size={16} className='ml-1' />
              </LoadableButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
