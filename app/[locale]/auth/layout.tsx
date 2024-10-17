'use client'
import { Card } from '@/components/ui/card'

import AuthBackground from '@/assets/auth-background.jpg'
import Image from 'next/image'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SimpleTransitionLayout } from '@/components/SimpleTranslation'
import { useLocale, useTranslations } from 'next-intl'
import { usePathname, useRouter } from '@/routing'
import PackageInfo from '@/package.json'
import { Metadata } from 'next'
import { useEffect } from 'react'

const Layout: IComponent = ({ children }) => {
  const route = useRouter()
  const t = useTranslations()
  const pathName = usePathname()
  const locale = useLocale()
  const currentTab = pathName.includes('token') ? 'token' : 'account'

  useEffect(() => {
    document.title = 'Login | ComfyUI-Station'
  }, [])

  return (
    <Card className='bg-background flex flex-col md:flex-row overflow-hidden relative h-fit rounded-none md:rounded-xl'>
      <Image alt='Login background' className='object-cover w-full md:w-[400px]' height={400} src={AuthBackground} />
      <div className='flex justify-start flex-col p-8 w-full md:w-[460px] gap-4'>
        <Tabs value={currentTab}>
          <TabsList className='grid w-full grid-cols-2'>
            <TabsTrigger onClick={() => route.push('/auth/basic')} value='account'>
              {t('auth.tabs.Account')}
            </TabsTrigger>
            <TabsTrigger onClick={() => route.push('/auth/token')} value='token'>
              {t('auth.tabs.Token')}
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <div className='flex flex-col'>
          <h1 className='text-xl font-semibold text-foreground'>{t('app.name')}</h1>
          <p className='text-sm font-normal text-muted-foreground'>{t('app.description')}</p>
        </div>
        <SimpleTransitionLayout deps={[currentTab]} className='w-full flex flex-col gap-4 min-h-[264px]'>
          {children}
        </SimpleTransitionLayout>
      </div>
      <div className='absolute bottom-1 right-2 text-sm font-normal text-secondary-foreground opacity-50'>
        {t('app.version')} {PackageInfo.version}
      </div>
      <Card className='fixed top-4 right-4'>
        <Tabs value={locale}>
          <TabsList className='grid w-full grid-cols-2'>
            <TabsTrigger onClick={() => route.push(pathName, { locale: 'en' })} value='en'>
              {t('lang.en')}
            </TabsTrigger>
            <TabsTrigger onClick={() => route.push(pathName, { locale: 'vi' })} value='vi'>
              {t('lang.vi')}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </Card>
    </Card>
  )
}

export default Layout
