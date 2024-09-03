import { createContext } from '@/server/context'
import { appRouter } from '@/server/routers/_app'
import { fetchRequestHandler } from '@trpc/server/adapters/fetch'

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: createContext as any
  })

export { handler as GET, handler as POST }
