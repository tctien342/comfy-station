import { Extension } from '@/entities/client_extension'
import { privateProcedure } from '../procedure'
import { router } from '../trpc'
import { z } from 'zod'

export const extensionRouter = router({
  filter: privateProcedure
    .input(
      z.object({
        labels: z.array(z.string())
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await ctx.em.find(Extension, {
        name: { $in: input.labels }
      })
    })
})
