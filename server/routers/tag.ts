import { Tag } from '@/entities/tag'
import { adminProcedure, privateProcedure } from '../procedure'
import { router } from '../trpc'
import { z } from 'zod'

export const tagRouter = router({
  list: privateProcedure.query(async ({ ctx }) => {
    const list = await ctx.em.find(Tag, {})
    return Promise.all(
      list.map(async (tag) => {
        return {
          info: tag,
          countExtension: await tag.extensions.loadCount(),
          countResource: await tag.resources.loadCount()
        }
      })
    )
  }),
  create: adminProcedure.input(z.string()).mutation(async ({ ctx, input }) => {
    const tag = ctx.em.create(Tag, { name: input }, { partial: true })
    await ctx.em.persistAndFlush(tag)
    return tag
  })
})
