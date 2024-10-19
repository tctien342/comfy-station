import './globals.scss'

import type { Metadata, Viewport } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'

import TRPCLayout from './layout.trpc'
import { BackgroundSVG } from '@/components/svg/BackgroundSVG'
import { SessionLayout } from './layout.session'
import { ClientLayout } from './layout.client'
import Head from 'next/head'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false
}

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
      <Head>
        <link rel='icon' type='image/png' sizes='32x32' href='/favicons/favicon-32x32.png' />
        <link rel='icon' type='image/png' sizes='16x16' href='/favicons/favicon-16x16.png' />
      </Head>
      <body>
        <SessionLayout session={session}>
          <NextIntlClientProvider timeZone='UTC' messages={messages}>
            <BackgroundSVG
              preserveAspectRatio='none'
              className='-z-10 absolute top-0 left-0 w-full h-full object-fill'
            />
            <TRPCLayout>
              <div className='w-full h-full md:p-2 lg:p-4 flex justify-center items-center relative overflow-x-hidden'>
                <ClientLayout>{children}</ClientLayout>
              </div>
            </TRPCLayout>
          </NextIntlClientProvider>
        </SessionLayout>
      </body>
    </html>
  )
}
