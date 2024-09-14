import superjson from 'superjson'

import {
  createWSClient,
  httpBatchLink,
  httpLink,
  isNonJsonSerializable,
  loggerLink,
  splitLink,
  wsLink
} from '@trpc/client'
import { createTRPCNext } from '@trpc/next'
import { ssrPrepass } from '@trpc/next/ssrPrepass'
import type { AppRouter } from '@/server/routers/_app'
import { BackendENV } from '@/env'
import { getSession } from 'next-auth/react'

let AuthToken = ''

export const wsClient = createWSClient({
  url: `${getBaseWsUrl()}/api/trpc`,
  connectionParams() {
    return {
      Authorization: `Bearer ${AuthToken}`
    }
  }
})

export function setAuthToken(newToken: string) {
  /**
   * You can also save the token to cookies, and initialize from
   * cookies above.
   */
  AuthToken = newToken
  wsClient.reconnect()
}

export function getBaseUrl() {
  return BackendENV.BACKEND_URL
}

function getBaseWsUrl() {
  const BackendURL = BackendENV.BACKEND_URL
  if (BackendURL.includes('https')) {
    return BackendURL.replace('https', 'wss')
  }
  return BackendURL.replace('http', 'ws')
}

export const trpc = createTRPCNext<AppRouter>({
  transformer: superjson,
  config(opts) {
    const { ctx } = opts
    if (typeof window !== 'undefined') {
      // during client requests
      return {
        links: [
          loggerLink({
            enabled: (opts) =>
              process.env.NODE_ENV === 'development' || (opts.direction === 'down' && opts.result instanceof Error)
          }),
          splitLink({
            condition: (op) => op.type === 'subscription',
            true: wsLink({
              client: wsClient,
              transformer: superjson
            }),
            /**
             * Add support for file uploads
             */
            false: splitLink({
              condition: (op) => isNonJsonSerializable(op.input),
              true: httpLink({
                url: getBaseUrl(),
                transformer: {
                  serialize: (data) => data as FormData,
                  deserialize: superjson.deserialize
                },
                async headers() {
                  return {
                    authorization: `Bearer ${AuthToken}`
                  }
                }
              }),
              false: httpBatchLink({
                url: getBaseUrl(),
                transformer: superjson,
                async headers() {
                  return {
                    authorization: `Bearer ${AuthToken}`
                  }
                }
              })
            })
          })
        ]
      }
    }
    return {
      headers() {
        return {
          cookie: ctx?.req?.headers.cookie
        }
      },
      links: [
        httpBatchLink({
          /**
           * If you want to use SSR, you need to use the server's full URL
           * @link https://trpc.io/docs/v11/ssr
           **/
          url: `${getBaseUrl()}`,
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
