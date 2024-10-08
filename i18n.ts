import { notFound } from 'next/navigation'
import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'

const config: ReturnType<typeof getRequestConfig> = getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!routing.locales.includes(locale as any)) notFound()

  return {
    messages: (await import(`./languages/${locale}.json`)).default
  }
})

export default config
