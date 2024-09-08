import { LoadableButton } from '@/components/LoadableButton'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { zodResolver } from '@hookform/resolvers/zod'
import { EnterIcon } from '@radix-ui/react-icons'
import { useContext, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { AddClientDialogContext, EImportStep } from '.'
import { trpc } from '@/utils/trpc'
import { useToast } from '@/hooks/useToast'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

export const InputClientInfoStep: IComponent = () => {
  const { clientInfo, setClientInfo, setStep } = useContext(AddClientDialogContext)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const formSchema = z.object({
    // Regex is url host name
    host: z
      .string()
      .min(2, { message: 'Host must be at least 2 characters' })
      .regex(/^(https?:\/\/)?(localhost:\d{1,5}|[a-zA-Z0-9.-]+(?:\.[a-zA-Z]{2,})?(:\d{1,5})?)$/, {
        message: 'Invalid host'
      }),
    auth: z.boolean().default(false),
    username: z.string().min(2, { message: 'Username must be at least 2 characters' }).optional(),
    password: z.string().min(6, { message: 'Password must be at least 6 characters' }).optional()
  })
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      host: clientInfo?.host ?? '',
      username: clientInfo?.username ?? '',
      password: clientInfo?.password ?? '',
      auth: clientInfo?.auth ?? false
    }
  })
  const { mutateAsync } = trpc.client.testClient.useMutation()

  const haveAuth = form.watch('auth')
  const handlePressSubmit = form.handleSubmit((data) => {
    setLoading(true)
    mutateAsync({
      host: data.host,
      auth: data.auth,
      username: data.username,
      password: data.password
    })
      .then((result) => {
        setClientInfo?.({
          host: data.host,
          auth: data.auth,
          username: data.username,
          password: data.password,
          result
        })
        setStep?.(EImportStep.FEATURE_CHECKING)
      })
      .catch((error: Error) => {
        if (error.message) {
          form.setError('host', { message: error.message })
        }
        toast({
          description: error.message,
          variant: 'destructive'
        })
      })
      .finally(() => {
        setLoading(false)
      })
  })
  return (
    <Form {...form}>
      <form className='space-y-4 min-w-80' onSubmit={handlePressSubmit}>
        <FormField
          name='host'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Server address</FormLabel>
              <FormControl>
                <Input placeholder='localhost:8188...' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name='auth'
          render={({ field }) => (
            <FormItem>
              <div className='flex items-center space-x-2'>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
                <Label htmlFor='airplane-mode'>Basic authentication</Label>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name='username'
          disabled={!haveAuth}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder='Enter your user name...' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name='password'
          disabled={!haveAuth}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type='password' placeholder='Enter your password' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className='flex justify-end w-full'>
          <LoadableButton loading={loading} type='submit' color='primary'>
            Next <EnterIcon className='ml-2 w-4 h-4' />
          </LoadableButton>
        </div>
      </form>
    </Form>
  )
}
