import Elysia, { t } from 'elysia'
import { EValueType } from '@/entities/enum'
import { EnsureTokenPlugin } from '../plugins/ensure-token.plugin'

export const WorkflowPlugin = new Elysia({ prefix: '/workflow' }).use(EnsureTokenPlugin).get(
  '/list',
  async ({ token }) => {
    const workflows = token!.grantedWorkflows.map((wf) => wf.workflow)
    return workflows.map((wf) => ({
      id: wf.id,
      name: wf.name,
      cost: wf.cost,
      description: wf.description,
      createdAt: wf.createdAt.toISOString(),
      updatedAt: wf.updateAt.toISOString()
    }))
  },
  {
    detail: {
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
                  input: t.Record(t.String(), t.Enum(EValueType), {
                    description: 'Workflow input',
                    default: {
                      caption: EValueType.String,
                      negative: EValueType.String
                    }
                  }),
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
