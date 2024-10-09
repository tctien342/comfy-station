import { z } from 'zod'
import { privateProcedure } from '../procedure'
import { router } from '../trpc'
import { WorkflowTask } from '@/entities/workflow_task'
import { ETaskStatus, ETriggerBy, EUserRole } from '@/entities/enum'
import { Workflow } from '@/entities/workflow'
import { Trigger } from '@/entities/trigger'
import CachingService from '@/services/caching'
import { v4 } from 'uuid'
import { WorkflowTaskEvent } from '@/entities/workflow_task_event'

export const workflowTaskRouter = router({
  get: privateProcedure.input(z.string()).query(async ({ input, ctx }) => {
    const task = await ctx.em.findOneOrFail(WorkflowTask, { id: input }, { populate: ['trigger', 'events'] })
    if (ctx.session.user?.role && ctx.session.user?.role >= EUserRole.Editor) {
      return task
    }
    if (task.trigger.type === ETriggerBy.User && task.trigger.user!.id === ctx.session.user?.id) {
      return task
    }
    throw new Error('Unauthorized')
  }),
  workflowTaskStats: privateProcedure.input(z.string()).query(async ({ input, ctx }) => {
    const isUserLevel = !ctx.session.user?.role || ctx.session.user?.role < EUserRole.Editor
    const trigger = isUserLevel ? { user: { id: ctx.session.user?.id } } : {}
    const [success, failed, isExecuting] = await Promise.all([
      ctx.em.count(WorkflowTask, {
        workflow: {
          id: input
        },
        trigger,
        status: ETaskStatus.Success
      }),
      ctx.em.count(WorkflowTask, {
        workflow: {
          id: input
        },
        trigger,
        status: ETaskStatus.Failed
      }),
      ctx.em.findOne(WorkflowTask, {
        workflow: {
          id: input
        },
        trigger,
        status: { $in: [ETaskStatus.Queuing, ETaskStatus.Pending, ETaskStatus.Running] }
      })
    ])
    return {
      success,
      failed,
      isExecuting: !!isExecuting
    }
  }),
  executeTask: privateProcedure
    .input(
      z.object({
        input: z.record(z.string(), z.union([z.string(), z.number()])),
        workflowId: z.string()
      })
    )
    .mutation(async ({ input, ctx }) => {
      const workflow = await ctx.em.findOneOrFail(Workflow, {
        id: input.workflowId
      })
      const trigger = ctx.em.create(
        Trigger,
        {
          type: ETriggerBy.User,
          user: ctx.session.user
        },
        { partial: true }
      )

      const task = ctx.em.create(
        WorkflowTask,
        {
          id: v4(),
          workflow,
          inputValues: input.input,
          trigger,
          computedWeight: 1
        },
        {
          partial: true
        }
      )
      const taskEvent = ctx.em.create(
        WorkflowTaskEvent,
        {
          task
        },
        { partial: true }
      )
      task.events.add(taskEvent)
      await ctx.em.persist(trigger).persist(task).persist(taskEvent).flush()
      await CachingService.getInstance().set('LAST_TASK_CLIENT', -1, Date.now())
      return true
    })
})
