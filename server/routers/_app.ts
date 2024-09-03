import { router } from '../trpc'
import { attachmentRouter } from './attachment'
import { helloRouter } from './hello'
import { taskRouter } from './task'

export const appRouter = router({
  hello: helloRouter,
  task: taskRouter,
  attachment: attachmentRouter
})

// Export only the type of a router!
// This prevents us from importing server code on the client.
export type AppRouter = typeof appRouter
