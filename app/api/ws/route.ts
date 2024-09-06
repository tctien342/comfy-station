import 'server-only'

import { createContextWs } from '@/server/context'
import { appRouter } from '@/server/routers/_app'
import { getWSConnectionHandler } from '@trpc/server/adapters/ws'
import { NextRequest, NextResponse } from 'next/server'

export function SOCKET(client: import('ws').WebSocket, request: import('http').IncomingMessage) {
  if (request.url && !request.url?.startsWith('/api/ws')) {
    return
  }
  console.log('socket', 'A client connected!', { request: request.url })
  getWSConnectionHandler({
    router: appRouter,
    createContext: createContextWs as any
  })(client, request)
}

/**
 * Fake GET handler for avoid NextJS error msg
 */
export const GET = async (req: NextRequest, res: import('http').ServerResponse) => {
  return NextResponse.json('Hello World')
}
