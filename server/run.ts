import { createServer } from 'http'
import { createHTTPHandler } from '@trpc/server/adapters/standalone'
import { appRouter } from './routers/_app'
import { createContext } from './context'
import { WebSocketServer } from 'ws'
import cors from 'cors'
import type { Socket } from 'net'
import { applyWSSHandler } from '@trpc/server/adapters/ws'
import AttachmentService from '@/services/attachment'
import CachingService from '@/services/caching'
import { ComfyPoolInstance } from '@/services/comfyui'
import { MikroORMInstance } from '@/services/mikro-orm'
import { handleGetUserByCredentials, handleGetUserByEmail } from './handlers/user'
import { SharedStorage } from '@/services/shared'
import swagger from '@elysiajs/swagger'

import { Elysia, t } from 'elysia'
import { WorkflowPlugin } from './handlers/workflow'
import { convertIMessToRequest } from './utils/request'
import { verify } from 'jsonwebtoken'
import { BackendENV } from '@/env'

/**
 * Initialize all services
 */
MikroORMInstance.getInstance()
ComfyPoolInstance.getInstance()
AttachmentService.getInstance()
CachingService.getInstance()
SharedStorage.getInstance()

const handler = createHTTPHandler({
  middleware: cors(),
  router: appRouter,
  createContext: createContext as any
})

/**
 * Allow external API to be accessed through token
 */
const elysia = new Elysia()
  // Bind Swagger to Elysia
  .use(swagger())
  // Bind Internal Path
  .use(
    new Elysia({ prefix: '/ext/api' }).guard(
      {
        headers: t.Object({
          authorization: t.TemplateLiteral('Bearer ${string}', { default: 'Bearer XXXX-XXXX-XXXX-XXXX' })
        }),
        beforeHandle: async ({ headers, set }) => {
          const bearerToken = headers.authorization
          if (!bearerToken) {
            set.status = 401
            return 'Unauthorized'
          }
          const token = bearerToken.split('Bearer ')[1]
          try {
            verify(token, BackendENV.NEXTAUTH_SECRET)
          } catch (e) {
            set.status = 401
            return 'Unauthorized'
          }
        }
      },
      (app) =>
        app
          // Bind Workflow Plugin
          .use(WorkflowPlugin)
    )
  )

const server = createServer(async (req, res) => {
  try {
    // Check if req is /user/get
    if (req.url === '/user/credential' && req.method === 'POST') {
      await handleGetUserByCredentials(req, res)
      return
    }
    if (req.url === '/user/email' && req.method === 'POST') {
      await handleGetUserByEmail(req, res)
      return
    }
    if (req.url?.startsWith('/swagger') || req.url?.startsWith('/ext/api')) {
      const request = await convertIMessToRequest(req)
      const output = await elysia.handle(request)
      res.writeHead(output.status, {
        'Content-Type': output.headers.get('content-type') ?? 'application/json'
      })
      const data = await output.text()
      res.write(data)
      res.end()
      return
    }
  } catch (e) {
    console.error(e)
    res.writeHead(500)
    res.end()
  }
  /**
   * Handle the request however you like,
   * just call the tRPC handler when you're ready
   */
  handler(req, res)
})

const wss = new WebSocketServer({ server })
const handlerWs = applyWSSHandler({ wss, router: appRouter, createContext: createContext as any })

process.on('SIGTERM', () => {
  console.log('SIGTERM')
  handlerWs.broadcastReconnectNotification()
})

server.on('upgrade', (req, socket, head) => {
  wss.handleUpgrade(req, socket as Socket, head, (ws) => {
    wss.emit('connection', ws, req)
  })
})

const originalOn = server.on.bind(server)
server.on = function (event, listener) {
  return event !== 'upgrade' ? originalOn(event, listener) : server
}

/**
 * Start the server
 */
server.listen(3001, '0.0.0.0')
