import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { PlusIcon } from '@heroicons/react/24/outline'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

export const CheckpointItem: IComponent<{
  ckptName: string
}> = ({ ckptName }) => {
  const shortName = ckptName.slice(0, 2)
  const formSchema = z.object({
    displayName: z.string().optional(),
    description: z.string().optional()
  })
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema)
  })
  const handlePressSubmit = form.handleSubmit((data) => {
    console.log(data)
  })
  return (
    <div className='w-full flex p-2 py-4 gap-2'>
      <Avatar className='m-2 w-16 h-16 !rounded-md'>
        {/* <AvatarImage src={avatarInfo?.url || undefined} alt={session.data?.user?.email || '@user'} /> */}
        <AvatarFallback className='rounded-md uppercase'>{shortName}</AvatarFallback>
      </Avatar>
      <div className='w-full flex flex-col gap-2'>
        <span className='text-sm font-semibold'>{ckptName}</span>
        <Form {...form}>
          <form className='space-y-4 min-w-80' onSubmit={handlePressSubmit}>
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
        <div className='w-full flex flex-wrap'>
          <Button variant='ghost' size='icon'>
            <PlusIcon width={16} height={16} />
          </Button>
        </div>
      </div>
    </div>
  )
}
