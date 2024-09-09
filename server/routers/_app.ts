import { router } from '../trpc'
import { attachmentRouter } from './attachment'
import { clientRouter } from './client'
import { resourceRouter } from './resource'
import { tagRouter } from './tag'
import { taskRouter } from './task'

export const appRouter = router({
  task: taskRouter,
  client: clientRouter,
  attachment: attachmentRouter,
  resource: resourceRouter,
  tag: tagRouter
})

// Export only the type of a router!
// This prevents us from importing server code on the client.
export type AppRouter = typeof appRouter
