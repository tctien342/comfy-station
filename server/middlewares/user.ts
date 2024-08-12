import { TRPCError } from '@trpc/server'
import { middleware } from '../trpc'

export const authChecker = middleware(({ next, ctx }) => {
  const user = ctx.session

  if (!user?.auth) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }

  return next()
})

export const adminChecker = middleware(({ next, ctx }) => {
  const user = ctx.session

  if (!user?.admin) {
    throw new TRPCError({ code: 'FORBIDDEN' })
  }

  return next()
})
