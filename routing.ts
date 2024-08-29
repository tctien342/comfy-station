import { defineRouting } from 'next-intl/routing'
import { createSharedPathnamesNavigation } from 'next-intl/navigation'

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['en', 'vi'],

  // Used when no locale matches
  defaultLocale: 'en'
})

// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration

const routeUlt = createSharedPathnamesNavigation(routing)

export const { redirect, usePathname, useRouter } = routeUlt

const Link = routeUlt.Link as typeof import('next/link').default

export { Link }
