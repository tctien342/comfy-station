import { z } from 'zod'
import { privateProcedure } from '../procedure'
import { router } from '../trpc'
import { WorkflowTask } from '@/entities/workflow_task'
import { EClientStatus, ETaskStatus, ETriggerBy, EUserRole } from '@/entities/enum'
import { observable } from '@trpc/server/observable'
import CachingService from '@/services/caching'

const cacher = CachingService.getInstance()

export const taskRouter = router({
  lastTasks: privateProcedure
    .input(
      z.object({
        limit: z.number().default(30),
        clientId: z.string().optional()
      })
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.session?.user) {
        return []
      }
      let trigger: any = {}
      if (ctx.session.user.role !== EUserRole.Admin) {
        trigger = {
          type: ETriggerBy.User,
          user: { id: ctx.session.user.id }
        }
      }
      return await ctx.em.find(
        WorkflowTask,
        {
          trigger,
          client: { id: input.clientId }
        },
        { limit: input.limit, orderBy: { createdAt: 'DESC' }, populate: ['trigger', 'trigger.user'] }
      )
    }),
  countStats: privateProcedure.subscription(async ({ ctx }) => {
    if (!ctx.session?.user) {
      throw new Error('Unauthorized')
    }
    let trigger: any = {}
    if (ctx.session.user.role !== EUserRole.Admin) {
      trigger = {
        type: ETriggerBy.User,
        user: { id: ctx.session.user.id }
      }
    }
    const getStats = async () => {
      const executed = await ctx.em.count(
        WorkflowTask,
        {
          trigger,
          status: {
            $in: [ETaskStatus.Success, ETaskStatus.Failed]
          }
        },
        { populate: ['trigger', 'trigger.user'] }
      )
      const pending = await ctx.em.count(
        WorkflowTask,
        {
          trigger,
          status: {
            $nin: [ETaskStatus.Success, ETaskStatus.Failed]
          }
        },
        { populate: ['trigger', 'trigger.user'] }
      )
      return {
        pending,
        executed
      }
    }

    return observable<Awaited<ReturnType<typeof getStats>>>((subscriber) => {
      getStats().then((data) => subscriber.next(data))
      const off = cacher.onCategory('CLIENT_STATUS', (ev) => {
        if ([EClientStatus.Executing, EClientStatus.Online].includes(ev.detail.value)) {
          getStats().then((data) => subscriber.next(data))
        }
      })
      return off
    })
  })
})
