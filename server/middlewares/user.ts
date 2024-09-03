import { TRPCError } from '@trpc/server'
import { middleware } from '../trpc'

export const authChecker = middleware(({ next, ctx }) => {
  const user = ctx.session

  if (!user?.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }

  console.log('USER LOGGER', user)
  return next()
})

export const adminChecker = middleware(({ next, ctx }) => {
  const user = ctx.session

  if (!user?.user?.email?.includes('admin')) {
    throw new TRPCError({ code: 'FORBIDDEN' })
  }

  return next()
})
