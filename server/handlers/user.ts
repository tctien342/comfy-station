import { User } from '@/entities/user'
import { BackendENV } from '@/env'
import { MikroORMInstance } from '@/services/mikro-orm'
import { IncomingMessage, ServerResponse } from 'http'
import { verify } from 'jsonwebtoken'

const mikro = MikroORMInstance.getInstance()

export const handleGetUserByCredentials = async (
  req: IncomingMessage,
  res: ServerResponse<IncomingMessage> & {
    req: IncomingMessage
  }
) => {
  let body = ''
  req.on('data', (chunk) => {
    body += chunk.toString()
  })
  req.on('end', async () => {
    try {
      const { email, password } = JSON.parse(body)
      // Check if email and password are correct
      const em = await mikro.getEM()
      const user = await em.findOne(User, { email, password: User.hashPassword(password) })
      if (!user) {
        res.writeHead(401)
        res.end()
        return
      }
      // Return the user
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify(user))
    } catch (e) {
      res.writeHead(500)
      res.end()
    }
  })
}

export const handleGetUserByJWT = async (
  req: IncomingMessage,
  res: ServerResponse<IncomingMessage> & {
    req: IncomingMessage
  }
) => {
  let body = ''
  req.on('data', (chunk) => {
    body += chunk.toString()
  })
  req.on('end', async () => {
    try {
      const { token } = JSON.parse(body)
      // Check if email and password are correct
      const em = await mikro.getEM()
      const tokenInfo = verify(token, BackendENV.NEXTAUTH_SECRET ?? 'secret') as { email: string }
      const user = await em.fork().findOne(User, { email: tokenInfo.email })
      if (!user) {
        res.writeHead(401)
        res.end()
        return
      }
      // Return the user
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify(user))
    } catch (e) {
      res.writeHead(500)
      res.end()
    }
  })
}
