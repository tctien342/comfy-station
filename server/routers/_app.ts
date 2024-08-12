import { router } from '../trpc'
import { helloRouter } from './hello'

export const appRouter = router({
  hello: helloRouter
})

// Export only the type of a router!
// This prevents us from importing server code on the client.
export type AppRouter = typeof appRouter
