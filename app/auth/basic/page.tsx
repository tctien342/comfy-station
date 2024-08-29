'use client'

import { Button } from '@/components/ui/button'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { EnterIcon, ExternalLinkIcon } from '@radix-ui/react-icons'
import { useForm } from 'react-hook-form'

const Page: IComponent = () => {
  const form = useForm<{
    username: string
  }>({
    defaultValues: {
      username: ''
    }
  })
  return (
    <>
      <Form {...form}>
        <form className='space-y-4'>
          <FormField
            name='username'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder='Enter your username here...' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name='password'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type='password' placeholder='Enter your password here...' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className='flex justify-between w-full'>
            <Button variant='link' type='button'>
              Github <ExternalLinkIcon className='ml-2 w-4 h-4' />
            </Button>
            <Button type='submit'>
              Submit <EnterIcon className='ml-2 w-4 h-4' />
            </Button>
          </div>
        </form>
      </Form>
      <Button variant='ghost' type='button' className='mx-auto text-sm font-medium'>
        Forgot your password ? Click here
      </Button>
    </>
  )
}

export default Page
