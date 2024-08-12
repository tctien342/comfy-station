import superjson from 'superjson'

import { createWSClient, httpBatchLink, splitLink, wsLink } from '@trpc/client'
import { createTRPCNext } from '@trpc/next'
import { ssrPrepass } from '@trpc/next/ssrPrepass'
import type { AppRouter } from '@/server/routers/_app'

const wsClient = createWSClient({
  url: 'ws://localhost:3000/api/ws'
})

function getBaseUrl() {
  if (typeof window !== 'undefined')
    // browser should use relative path
    return ''
  if (process.env.VERCEL_URL)
    // reference for vercel.com
    return `https://${process.env.VERCEL_URL}`
  if (process.env.RENDER_INTERNAL_HOSTNAME)
    // reference for render.com
    return `http://${process.env.RENDER_INTERNAL_HOSTNAME}:${process.env.PORT}`
  // assume localhost
  return `http://localhost:${process.env.PORT ?? 3000}`
}

export const trpc = createTRPCNext<AppRouter>({
  transformer: superjson,
  config(opts) {
    const { ctx } = opts
    if (typeof window !== 'undefined') {
      // during client requests
      return {
        links: [
          splitLink({
            condition: (op) => op.type === 'subscription',
            true: wsLink({
              client: wsClient,
              transformer: superjson
            }),
            false: httpBatchLink({
              url: '/api/trpc',
              transformer: superjson
            })
          })
        ]
      }
    }
    return {
      links: [
        httpBatchLink({
          /**
           * If you want to use SSR, you need to use the server's full URL
           * @link https://trpc.io/docs/v11/ssr
           **/
          url: `${getBaseUrl()}/api/trpc`,
          // You can pass any HTTP headers you wish here
          async headers() {
            if (!ctx?.req?.headers) {
              return {}
            }
            // To use SSR properly, you need to forward client headers to the server
            // This is so you can pass through things like cookies when we're server-side rendering
            return {
              cookie: ctx.req.headers.cookie
            }
          },
          transformer: superjson
        })
      ]
    }
  },
  /**
   * @link https://trpc.io/docs/v11/ssr
   **/
  ssr: true,
  ssrPrepass
})
