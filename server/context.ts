import type { CreateNextContextOptions } from '@trpc/server/adapters/next'
import type { CreateWSSContextFnOptions } from '@trpc/server/adapters/ws'

/**
 * Creates context for an incoming request
 * @link https://trpc.io/docs/v11/context
 */
export const createContext = async (opts: CreateNextContextOptions | CreateWSSContextFnOptions) => {
  const session = {
    auth: false,
    admin: false
  }

  return {
    session
  }
}

export type Context = Awaited<ReturnType<typeof createContext>>
