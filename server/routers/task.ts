import { z } from 'zod'
import { privateProcedure } from '../procedure'
import { router } from '../trpc'
import { WorkflowTask } from '@/entities/workflow_task'
import { ETriggerBy } from '@/entities/enum'

export const taskRouter = router({
  lastTasks: privateProcedure
    .input(
      z.object({
        limit: z.number().default(30)
      })
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.session?.user) {
        return []
      }
      return await ctx.em.find(
        WorkflowTask,
        {
          trigger: {
            type: ETriggerBy.User,
            user: { id: ctx.session.user.id }
          }
        },
        { limit: input.limit, orderBy: { createdAt: 'DESC' }, populate: ['trigger', 'trigger.user'] }
      )
    })
})
