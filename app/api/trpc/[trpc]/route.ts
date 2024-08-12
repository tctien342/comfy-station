import { createContext } from '@/server/context'
import { appRouter } from '@/server/routers/_app'
import { fetchRequestHandler } from '@trpc/server/adapters/fetch'

const handler = (request: Request) => {
  console.log('handler', 'incoming request', { url: new URL(request.url).pathname })
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req: request,
    router: appRouter,
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    createContext: createContext as any
  })
}

export { handler as GET, handler as POST }
