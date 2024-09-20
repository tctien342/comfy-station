import { router } from '../trpc'
import { attachmentRouter } from './attachment'
import { clientRouter } from './client'
import { extensionRouter } from './extension'
import { resourceRouter } from './resource'
import { tagRouter } from './tag'
import { taskRouter } from './task'
import { workflowRouter } from './workflow'

export const appRouter = router({
  task: taskRouter,
  client: clientRouter,
  attachment: attachmentRouter,
  resource: resourceRouter,
  tag: tagRouter,
  workflow: workflowRouter,
  extension: extensionRouter
})

// Export only the type of a router!
// This prevents us from importing server code on the client.
export type AppRouter = typeof appRouter
