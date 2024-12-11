import swagger from '@elysiajs/swagger'
import { Logger } from '@saintno/needed-tools'
import Elysia from 'elysia'
import { UserPlugin } from './handlers/user'
import { AttachmentPlugin } from './handlers/attachment'
import { TaskPlugin } from './handlers/task'
import { TokenPlugin } from './handlers/token'
import { WorkflowPlugin } from './handlers/workflow'

export const ElysiaHandler = new Elysia()
  .decorate(() => {
    return {
      logger: new Logger('Elysia'),
      start: performance.now()
    }
  })
  .onAfterResponse(({ logger, start, request }) => {
    logger.i(request.method, request.url, {
      time: Math.round((performance.now() - start) / 1000) + 'ms'
    })
  })
  // Bind Swagger to Elysia
  .use(
    swagger({
      documentation: {
        tags: [
          { name: 'Others', description: 'Other app api' },
          { name: 'Workflow', description: 'Workflow apis' },
          { name: 'Task', description: 'Task apis' },
          { name: 'Attachment', description: 'Attachment apis' }
        ],
        components: {
          securitySchemes: {
            // Support bearer token
            BearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT'
            }
          }
        }
      }
    })
  )
  // User authentication
  .use(UserPlugin)
  // Bind Internal Path
  .use(
    new Elysia({ prefix: '/ext/api' })
      .get(
        '/health',
        () => {
          return {
            status: 'ok'
          }
        },
        {
          detail: {
            tags: ['Others']
          }
        }
      )
      .guard(
        {
          detail: { security: [{ BearerAuth: [] }] }
        },
        (app) =>
          app
            // Token Plugin
            .use(TokenPlugin)
            // Bind Workflow Plugin
            .use(WorkflowPlugin)
            // Task Plugin
            .use(TaskPlugin)
            // Attachment plugin
            .use(AttachmentPlugin)
      )
  )
