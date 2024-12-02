import Elysia, { NotFoundError, t } from 'elysia'
import { ETaskStatus, ETriggerBy, EValueType, EValueUltilityType } from '@/entities/enum'
import { EnsureTokenPlugin } from '../plugins/ensure-token.plugin'
import { WorkflowInputSchema, WorkflowOutputSchema } from '../schemas/workflow'
import { EnsureMikroORMPlugin } from '../plugins/ensure-mikro-orm.plugin'
import { convertObjectToArrayOfObjects, delay } from '@/utils/tools'
import { WorkflowTask } from '@/entities/workflow_task'
import { v4 } from 'uuid'
import { WorkflowTaskEvent } from '@/entities/workflow_task_event'
import { Trigger } from '@/entities/trigger'
import { Workflow } from '@/entities/workflow'

export const WorkflowPlugin = new Elysia({ prefix: '/workflow', detail: { tags: ['Workflow'] } })
  .use(EnsureMikroORMPlugin)
  .use(EnsureTokenPlugin)
  .get(
    '/list',
    async ({ em, token }) => {
      let workflows = token!.grantedWorkflows.map((wf) => wf.workflow)
      if (token.isMaster) {
        workflows = await em.find(Workflow, {})
      }
      return workflows.map((wf) => ({
        id: wf.id,
        name: wf.name,
        cost: wf.cost,
        input: Object.keys(wf.mapInput ?? {}).reduce(
          (acc, cur) => {
            const val = wf.mapInput![cur]
            console.log(val)
            acc[cur] = {
              key: val.key,
              type: val.type as EValueType,
              description: val.description,
              default: val.default
            }
            return acc
          },
          {} as Record<string, { key: string; type: EValueType; description?: string; default: any }>
        ),
        output: Object.values(wf.mapOutput ?? {}).reduce(
          (acc, cur) => {
            acc[cur.key] = {
              type: cur.type as EValueType,
              description: cur.description
            }
            return acc
          },
          {} as Record<string, { type: EValueType; description?: string }>
        ),
        description: wf.description,
        createdAt: wf.createdAt.toISOString(),
        updatedAt: wf.updateAt.toISOString()
      }))
    },
    {
      detail: {
        description: 'Return list of granted workflows',
        responses: {
          200: {
            description: 'List of workflows',
            content: {
              'application/json': {
                schema: t.Array(
                  t.Object({
                    id: t.String({ description: 'Workflow ID', default: 'xxx-xxx-xxxxxx' }),
                    name: t.String({ description: 'Workflow name', default: 'Workflow Name' }),
                    cost: t.Number({ description: 'Workflow cost', default: 0 }) as any,
                    input: WorkflowInputSchema,
                    output: WorkflowOutputSchema,
                    description: t.String({ description: 'Workflow description', default: 'Workflow Description' }),
                    createdAt: t.String({
                      description: 'Workflow created at',
                      default: '2021-01-01T00:00:00.000Z'
                    }),
                    updatedAt: t.String({ description: 'Workflow updated at', default: '2021-01-01T00:00:00.000Z' })
                  })
                )
              }
            }
          }
        }
      }
    }
  )
  .post(
    '/:id/execute',
    async ({ token, em, params: { id }, body: { input, repeat = 1 } }) => {
      let workflow = token!.grantedWorkflows.find((wf) => wf.workflow.id === id)?.workflow

      if (token.isMaster) {
        workflow = (await em.findOne(Workflow, { id })) ?? undefined
      }

      if (!workflow) {
        throw new NotFoundError('Workflow not found')
      }

      for (const key in input) {
        const keyConfig = workflow.mapInput?.[key]
        if (!keyConfig) continue
        if (keyConfig.type === EValueType.Number) {
          const temp = Number(input[key])
          if (keyConfig.min && temp < keyConfig.min) {
            throw new Error(`Value of ${key} is less than min value`)
          }
          if (keyConfig.max && temp > keyConfig.max) {
            throw new Error(`Value of ${key} is greater than max value`)
          }
        }
        if (keyConfig.type === EValueType.File || keyConfig.type === EValueType.Image) {
          const temp = input[key]
          if (Array.isArray(temp) && temp.length === 0) {
            throw new Error(`Value of ${key} is empty`)
          }
        }
      }

      const tasks = convertObjectToArrayOfObjects(input)
      const isBatch = repeat > 1 || tasks.length > 1

      // 5 minutes bias [0 -> 2] weight add on, eirly job will have lower weight -> more priority
      const timeWeight = (Date.now() % 300000) / 150000
      // Weight calculation
      const computedWeight = timeWeight + workflow.baseWeight + token.weightOffset

      // Cost calculation
      let computedCost = workflow.cost
      for (const [key, value] of Object.entries(input)) {
        if (workflow.mapInput?.[key]?.cost?.related) {
          computedCost += workflow.mapInput[key].cost.costPerUnit * Number(value)
        }
      }
      computedCost *= repeat ?? 1
      computedCost *= tasks.length

      if (token.balance !== -1 && computedCost > token.balance) {
        throw new Error('Insufficient balance')
      }
      if (token.balance !== -1) {
        token.balance -= computedCost
      }

      // Create Parent Task
      const trigger = em.create(
        Trigger,
        {
          type: ETriggerBy.Token,
          token
        },
        { partial: true }
      )

      const parentTask = em.create(
        WorkflowTask,
        {
          id: v4(),
          workflow,
          repeatCount: repeat,
          inputValues: input,
          trigger,
          status: isBatch ? ETaskStatus.Parent : ETaskStatus.Queuing,
          computedWeight,
          computedCost
        },
        {
          partial: true
        }
      )
      em.persist(trigger).persist(parentTask)
      if (!isBatch) {
        const taskEvent = em.create(
          WorkflowTaskEvent,
          {
            task: parentTask
          },
          { partial: true }
        )
        parentTask.events.add(taskEvent)
        em.persist(taskEvent)
      }

      const createTask = (inputValues = input, parent?: WorkflowTask, weightOffset = 0) => {
        const trigger = em.create(
          Trigger,
          {
            type: ETriggerBy.Token,
            token
          },
          { partial: true }
        )
        const task = em.create(
          WorkflowTask,
          {
            id: v4(),
            workflow,
            status: ETaskStatus.Queuing,
            repeatCount: 1,
            inputValues,
            trigger,
            parent,
            computedWeight: computedWeight + weightOffset,
            computedCost
          },
          {
            partial: true
          }
        )
        const taskEvent = em.create(
          WorkflowTaskEvent,
          {
            task
          },
          { partial: true }
        )
        task.events.add(taskEvent)
        em.persist(trigger).persist(task).persist(taskEvent)
        return task
      }

      if (isBatch) {
        let newSeed = 0
        const seedConf = Object.values(workflow.mapInput ?? {}).find((v) => v.type === EValueUltilityType.Seed)
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
            // 0.1 weight add on for each repeat
            const offsetWeight = i / 10
            createTask(newInput, parentTask, offsetWeight)
          }
        }
      }
      await em.flush()
      return {
        taskId: parentTask.id,
        cost: computedCost,
        repeatCount: repeat
      }
    },
    {
      body: t.Object({
        repeat: t.Optional(t.Number({ description: 'Repeat times', default: 1 })),
        input: t.Record(t.String(), t.Union([t.Optional(t.String()), t.Number(), t.Array(t.String())]))
      }),
      detail: {
        responses: {
          200: {
            description: 'Task created',
            content: {
              'application/json': {
                schema: t.Object({
                  taskId: t.String({ description: 'Task ID', default: 'xxx-xxx-xxxxxx' }),
                  cost: t.Number({ description: 'Task cost', default: 0 }),
                  repeatCount: t.Number({ description: 'Repeat count', default: 1 })
                })
              } as any
            }
          }
        }
      }
    }
  )
