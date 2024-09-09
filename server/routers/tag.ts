import { Tag } from '@/entities/tag'
import { privateProcedure } from '../procedure'
import { router } from '../trpc'

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
  })
})
