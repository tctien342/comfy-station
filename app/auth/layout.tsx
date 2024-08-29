'use client'
import { Card } from '@/components/ui/card'

import AuthBackground from '@/assets/auth-background.jpg'
import Image from 'next/image'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { usePathname, useRouter } from 'next/navigation'
import { SimpleTranslation } from '@/components/SimpleTranslation'

const Layout: IComponent = ({ children }) => {
  const route = useRouter()
  const pathName = usePathname()
  const currentTab = pathName.includes('token') ? 'token' : 'account'
  return (
    <Card className='bg-background flex overflow-hidden relative'>
      <Image alt='Login background' className='object-cover' height={400} width={400} src={AuthBackground} />
      <div className='flex justify-start flex-col p-8 w-[460px] gap-4'>
        <Tabs value={currentTab}>
          <TabsList className='grid w-full grid-cols-2'>
            <TabsTrigger onClick={() => route.push('/auth/basic')} value='account'>
              Account
            </TabsTrigger>
            <TabsTrigger onClick={() => route.push('/auth/token')} value='token'>
              Token
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <div className='flex flex-col'>
          <h1 className='text-xl font-semibold text-foreground'>COMFY STATION</h1>
          <p className='text-sm font-normal text-muted-foreground'>
            A opensource for image generative using multiple of ComfyUI instances
          </p>
        </div>
        <SimpleTranslation deps={[currentTab]} className='w-full flex flex-col gap-4 min-h-[264px]'>
          {children}
        </SimpleTranslation>
      </div>
      <div className='absolute bottom-1 right-2 text-sm font-normal text-secondary-foreground opacity-50'>
        Ver 1.0.0
      </div>
    </Card>
  )
}

export default Layout
