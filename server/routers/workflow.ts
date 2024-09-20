import { privateProcedure } from '../procedure'
import { router } from '../trpc'
import { z } from 'zod'
import { Workflow } from '@/entities/workflow'

export const workflowRouter = router({
  list: privateProcedure
    .input(
      z.object({
        search: z.string().optional(),
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(),
        direction: z.enum(['forward', 'backward'])
      })
    )
    .query(async ({ input, ctx }) => {
      const limit = input.limit ?? 50
      const { cursor, direction } = input

      const data = await ctx.em.findByCursor(
        Workflow,
        {},
        direction === 'forward'
          ? {
              first: limit,
              after: { endCursor: cursor || null }
            }
          : {
              last: limit,
              before: { startCursor: cursor || null }
            }
      )
      let nextCursor: typeof cursor | undefined = undefined
      if (data.items.length > limit) {
        const nextItem = data.items.pop()
        nextCursor = nextItem!.id
      }
      return {
        items: data.items,
        nextCursor
      }
    })
})
