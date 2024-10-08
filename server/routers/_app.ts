import { router } from '../trpc'
import { attachmentRouter } from './attachment'
import { clientRouter } from './client'
import { extensionRouter } from './extension'
import { resourceRouter } from './resource'
import { tagRouter } from './tag'
import { taskRouter } from './task'
import { watchRouter } from './watch'
import { workflowRouter } from './workflow'
import { workflowTaskRouter } from './workflow_task'

export const appRouter = router({
  task: taskRouter,
  client: clientRouter,
  attachment: attachmentRouter,
  resource: resourceRouter,
  tag: tagRouter,
  extension: extensionRouter,
  workflow: workflowRouter,
  workflowTask: workflowTaskRouter,
  watch: watchRouter
})

// Export only the type of a router!
// This prevents us from importing server code on the client.
export type AppRouter = typeof appRouter
