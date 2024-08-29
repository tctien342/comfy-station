import createMiddleware from 'next-intl/middleware'
import { routing } from './routing'

export default createMiddleware(routing)

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(vi|en)/:path*']
}
