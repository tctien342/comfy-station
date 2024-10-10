import { Tag } from '@/entities/tag'
import { adminProcedure, privateProcedure } from '../procedure'
import { router } from '../trpc'
import { z } from 'zod'
import { observable } from '@trpc/server/observable'
import { EUserRole } from '@/entities/enum'
import CachingService from '@/services/caching'
import { WorkflowTask } from '@/entities/workflow_task'

export const watchRouter = router({
  historyList: privateProcedure.subscription(async ({ ctx }) => {
    const cacher = CachingService.getInstance()
    return observable<number>((subscriber) => {
      if (ctx.session.user!.role === EUserRole.Admin) {
        return cacher.onCategory('HISTORY_LIST', (ev) => {
          subscriber.next(ev.detail.value)
        })
      } else {
        return cacher.on('HISTORY_LIST', ctx.session.user!.id, (ev) => {
          subscriber.next(ev.detail)
        })
      }
    })
  }),
  historyItem: privateProcedure.input(z.string()).subscription(async ({ input, ctx }) => {
    const cacher = CachingService.getInstance()
    if (ctx.session.user!.role !== EUserRole.Admin) {
      const taskInfo = await ctx.em.findOneOrFail(
        WorkflowTask,
        { id: input },
        { populate: ['trigger', 'trigger.user'] }
      )
      if (taskInfo.trigger?.user?.id !== ctx.session.user!.id) {
        throw new Error('Unauthorized')
      }
    }
    return observable<number>((subscriber) => {
      return cacher.onCategory('HISTORY_ITEM', (ev) => {
        if (ev.detail.id === input) subscriber.next(ev.detail.value)
      })
    })
  })
})
