'use client'

import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/input'
import { EnterIcon, ExternalLinkIcon } from '@radix-ui/react-icons'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { signIn } from 'next-auth/react'
import { useRouter } from '@/routing'
import { useState } from 'react'
import { LoadableButton } from '@/components/LoadableButton'
import { NextPage } from 'next'
import { wsClient } from '@/utils/trpc'

const Page: NextPage = () => {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const t = useTranslations('auth.basic')
  const formSchema = z.object({
    username: z.string().min(2, { message: t('zod.username.min') }),
    password: z.string().min(6, { message: t('zod.password.min') })
  })
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      password: ''
    }
  })

  const handleLogin = form.handleSubmit((data) => {
    setSubmitting(true)
    signIn('credentials', {
      email: data.username,
      password: data.password,
      redirect: false
    })
      .then((response) => {
        if (!response) {
          return
        }
        if (response.error) {
          form.setError('username', { type: 'manual', message: t('invalidCredentials') })
          form.setError('password', { type: 'manual', message: t('invalidCredentials') })
        }
        if (response.ok) {
          // Reconnect to the websocket server to have the correct user session
          wsClient.reconnect()
          router.replace('/main')
        }
      })
      .finally(() => {
        setSubmitting(false)
      })
  })

  return (
    <>
      <Form {...form}>
        <form className='space-y-4' onSubmit={handleLogin}>
          <FormField
            name='username'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('username')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('usernamePlaceholder')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name='password'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('password')}</FormLabel>
                <FormControl>
                  <Input type='password' placeholder={t('passwordPlaceholder')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className='flex justify-between w-full'>
            <Button variant='link' type='button'>
              Github <ExternalLinkIcon className='ml-2 w-4 h-4' />
            </Button>
            <LoadableButton type='submit' loading={submitting}>
              {t('submit')} <EnterIcon className='ml-2 w-4 h-4' />
            </LoadableButton>
          </div>
        </form>
      </Form>
      <Button variant='ghost' type='button' className='mx-auto text-sm font-medium'>
        {t('forgotPassword')}
      </Button>
    </>
  )
}

export default Page
