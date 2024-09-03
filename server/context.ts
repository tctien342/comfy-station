import type { CreateNextContextOptions } from '@trpc/server/adapters/next'
import type { CreateWSSContextFnOptions } from '@trpc/server/adapters/ws'
import { MikroORMInstance } from '@/services/mikro-orm'
import { getServerSession, Session } from 'next-auth'
import { NextAuthOptions } from '@/app/api/auth/[...nextauth]/route'
import { getSession } from 'next-auth/react'
import { FetchHandlerRequestOptions } from '@trpc/server/adapters/fetch'
import { headers } from 'next/headers'

/**
 * Creates context for an incoming request
 * @link https://trpc.io/docs/v11/context
 */
export const createContext = async (opts: FetchHandlerRequestOptions<any>) => {
  const orm = await MikroORMInstance.getInstance().getORM()
  const _headers = new Headers(headers())
  const session = await getServerSession(NextAuthOptions)
  _headers.set('x-trpc-source', 'rsc')

  return {
    session,
    em: orm.em.fork(),
    headers: Object.fromEntries(_headers)
  }
}

export const createContextWs = async (opts: CreateWSSContextFnOptions) => {
  const orm = await MikroORMInstance.getInstance().getORM()
  const session = await getSession({ req: opts.req as any })
  return {
    session,
    em: orm.em.fork()
  }
}

export type Context = Awaited<ReturnType<typeof createContext>>
