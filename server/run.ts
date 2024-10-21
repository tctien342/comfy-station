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
