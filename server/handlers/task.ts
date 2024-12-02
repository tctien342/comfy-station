import Elysia, { NotFoundError, t } from 'elysia'
import { EnsureTokenPlugin } from '../plugins/ensure-token.plugin'
import { EnsureMikroORMPlugin } from '../plugins/ensure-mikro-orm.plugin'
import { WorkflowTask } from '@/entities/workflow_task'
import { WorkflowTaskEvent } from '@/entities/workflow_task_event'
import { TaskEventSchema, TaskSchema } from '../schemas/task'
import { ETaskStatus } from '@/entities/enum'

export const TaskPlugin = new Elysia({ prefix: '/task', detail: { tags: ['Task'] } })
  .use(EnsureMikroORMPlugin)
  .use(EnsureTokenPlugin)
  .get(
    '/',
    async ({ token, em, query: { offset = 0, limit = 10 } }) => {
      const tasks = await em.find(WorkflowTask, { parent: null, trigger: { token } }, { offset, limit })
      return {
        data: tasks,
        total: await em.count(WorkflowTask, { parent: null, trigger: { token } })
      }
    },
    {
      detail: {
        description: 'Get list of tasks by given token',
        responses: {
          200: {
            description: 'List of tasks',
            content: {
              'application/json': {
                schema: t.Object({
                  data: t.Array(TaskSchema),
                  total: t.Number()
                })
              } as any
            }
          }
        }
      },
      query: t.Object({
        offset: t.Optional(t.Number({ default: 0 })),
        limit: t.Optional(t.Number({ default: 10 }))
      })
    }
  )
  .get(
    '/:id',
    async ({ em, params: { id } }) => {
      const task = await em.findOne(WorkflowTask, { id }, { populate: ['attachments', 'subTasks.attachments'] })
      if (!task) {
        return new NotFoundError("Task doesn't exist")
      }
      const events = await em.find(WorkflowTaskEvent, { task })
      return {
        task,
        events
      }
    },
    {
      detail: {
        description: 'Get task details by given id',
        responses: {
          200: {
            description: 'Task details with events',
            content: {
              'application/json': {
                schema: t.Object({
                  task: TaskSchema,
                  events: t.Array(TaskEventSchema)
                })
              } as any
            }
          }
        }
      }
    }
  )
  .get(
    '/:id/status',
    async ({ em, params: { id } }) => {
      const task = await em.findOne(WorkflowTask, { id }, { populate: ['subTasks.attachments'] })
      if (!task) {
        return new NotFoundError("Task doesn't exist")
      }
      return {
        status: task.status === ETaskStatus.Parent ? task.subTasks.map((v) => v.status) : task.status
      }
    },
    {
      detail: {
        description: 'Get task status by given id',
        responses: {
          200: {
            description: 'Task details with events',
            content: {
              'application/json': {
                schema: t.Object({
                  status: t.Union([t.Array(t.Enum(ETaskStatus)), t.Enum(ETaskStatus)])
                })
              } as any
            }
          }
        }
      }
    }
  )
