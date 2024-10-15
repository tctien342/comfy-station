import './globals.scss'

import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'

import TRPCLayout from './layout.trpc'
import { BackgroundSVG } from '@/components/svg/BackgroundSVG'
import { SessionLayout } from './layout.session'
import { ClientLayout } from './layout.client'

export const metadata: Metadata = {
  title: 'Home | ComfyUI-Station',
  description: 'A station for all your comfyui instance'
}

export default async function RootLayout({
  children,
  params: { session, locale }
}: Readonly<{
  children: React.ReactNode
  params: { locale: string; session: any }
}>) {
  const messages = await getMessages()

  return (
    <html lang={locale} className=''>
      <body>
        <SessionLayout session={session}>
          <NextIntlClientProvider timeZone='UTC' messages={messages}>
            <BackgroundSVG
              preserveAspectRatio='none'
              className='-z-10 absolute top-0 left-0 w-screen h-screen object-fill'
            />
            <TRPCLayout>
              <div className='w-screen h-screen md:p-2 lg:p-4 flex justify-center items-center relative'>
                <ClientLayout>{children}</ClientLayout>
              </div>
            </TRPCLayout>
          </NextIntlClientProvider>
        </SessionLayout>
      </body>
    </html>
  )
}
