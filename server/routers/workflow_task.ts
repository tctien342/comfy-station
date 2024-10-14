import { z } from 'zod'
import { privateProcedure } from '../procedure'
import { router } from '../trpc'
import { WorkflowTask } from '@/entities/workflow_task'
import { ETaskStatus, ETriggerBy, EUserRole, EValueType, EValueUltilityType } from '@/entities/enum'
import { Workflow } from '@/entities/workflow'
import { Trigger } from '@/entities/trigger'
import CachingService from '@/services/caching'
import { v4 } from 'uuid'
import { WorkflowTaskEvent } from '@/entities/workflow_task_event'
import { convertObjectToArrayOfObjects, delay, seed } from '@/utils/tools'

export const workflowTaskRouter = router({
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

      const extra =
        ctx.session.user!.role === EUserRole.User
          ? {
              trigger: {
                user: {
                  id: ctx.session.user?.id
                }
              }
            }
          : {}

      const data = await ctx.em.findByCursor(
        WorkflowTask,
        {
          parent: null,
          ...extra
        },
        direction === 'forward'
          ? {
              first: limit,
              after: { endCursor: cursor || null },
              orderBy: { createdAt: 'DESC' }
            }
          : {
              last: limit,
              before: { startCursor: cursor || null },
              orderBy: { createdAt: 'DESC' }
            }
      )
      return {
        items: data.items,
        nextCursor: data.endCursor
      }
    }),

  detail: privateProcedure.input(z.string()).query(async ({ input, ctx }) => {
    const task = await ctx.em.findOneOrFail(
      WorkflowTask,
      { id: input },
      { populate: ['workflow', 'trigger.user', 'events', 'subTasks.events'] }
    )
    if (ctx.session.user?.role && ctx.session.user?.role >= EUserRole.Editor) {
      return task
    }
    if (task.trigger.type === ETriggerBy.User && task.trigger.user!.id === ctx.session.user?.id) {
      return task
    }
    throw new Error('Unauthorized')
  }),
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
        input: z.record(z.string(), z.union([z.string(), z.number(), z.array(z.string())])),
        workflowId: z.string(),
        repeat: z.number().optional()
      })
    )
    .mutation(async ({ input, ctx }) => {
      const workflow = await ctx.em.findOneOrFail(Workflow, {
        id: input.workflowId
      })

      const tasks = convertObjectToArrayOfObjects(input.input)

      const isBatch = (input.repeat && input.repeat > 1) || tasks.length > 1
      // Weight calculation
      const computedWeight = workflow.baseWeight + ctx.session.user!.weightOffset

      // Cost calculation
      let computedCost = workflow.cost
      for (const [key, value] of Object.entries(input.input)) {
        if (workflow.mapInput?.[key]?.cost?.related) {
          computedCost += workflow.mapInput[key].cost.costPerUnit * Number(value)
        }
      }
      computedCost *= input.repeat ?? 1
      computedCost *= tasks.length

      // Create Parent Task
      const trigger = ctx.em.create(
        Trigger,
        {
          type: ETriggerBy.User,
          user: ctx.session.user
        },
        { partial: true }
      )
      const parentTask = ctx.em.create(
        WorkflowTask,
        {
          id: v4(),
          workflow,
          repeatCount: input.repeat ?? 1,
          inputValues: input.input,
          trigger,
          status: isBatch ? ETaskStatus.Parent : ETaskStatus.Queuing,
          computedWeight,
          computedCost
        },
        {
          partial: true
        }
      )
      ctx.em.persist(trigger).persist(parentTask)
      if (!isBatch) {
        const taskEvent = ctx.em.create(
          WorkflowTaskEvent,
          {
            task: parentTask
          },
          { partial: true }
        )
        parentTask.events.add(taskEvent)
        ctx.em.persist(taskEvent)
      }

      const createTask = (inputValues = input.input, parent?: WorkflowTask) => {
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
            status: ETaskStatus.Queuing,
            repeatCount: 1,
            inputValues,
            trigger,
            parent,
            computedWeight,
            computedCost
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
        ctx.em.persist(trigger).persist(task).persist(taskEvent)
        return task
      }

      if (isBatch) {
        let newSeed = 0
        const seedConf = Object.values(workflow.mapInput ?? {}).find((v) => v.type === EValueUltilityType.Seed)
        const repeat = input.repeat ?? 1
        for (let i = 0; i < repeat; i++) {
          for (const task of tasks) {
            if (!seedConf) {
              createTask(task, parentTask)
              continue
            }
            if (newSeed === 0) {
              newSeed = Math.floor(Number(task[seedConf.key!] ?? 1))
            }
            const newInput = {
              ...task,
              [seedConf?.key!]: ++newSeed
            }
            await delay(10)
            createTask(newInput, parentTask)
          }
        }
      }
      await Promise.all([
        ctx.em.flush(),
        CachingService.getInstance().set('LAST_TASK_CLIENT', -1, Date.now()),
        CachingService.getInstance().set('WORKFLOW', workflow.id, Date.now()),
        CachingService.getInstance().set('HISTORY_LIST', ctx.session.user!.id, Date.now())
      ])
      return true
    }),
  getRunning: privateProcedure
    .input(
      z.object({
        workflowId: z.string()
      })
    )
    .query(async ({ input, ctx }) => {
      return ctx.em.find(WorkflowTask, {
        workflow: {
          id: input.workflowId
        },
        status: {
          $in: [ETaskStatus.Pending, ETaskStatus.Queuing, ETaskStatus.Running]
        }
      })
    })
})
