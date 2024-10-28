import { User } from '@/entities/user'
import { BackendENV } from '@/env'
import { MikroORMInstance } from '@/services/mikro-orm'
import { SharedStorage } from '@/services/shared'
import { IncomingMessage, ServerResponse } from 'http'
import { verify } from 'jsonwebtoken'

const mikro = MikroORMInstance.getInstance()

export const handleGetUserByCredentials = async (
  req: IncomingMessage,
  res: ServerResponse<IncomingMessage> & {
    req: IncomingMessage
  }
) => {
  const auth = req.headers.authorization
  if (!auth || auth !== `Bearer ${BackendENV.INTERNAL_SECRET}`) {
    res.writeHead(401)
    res.end()
    return
  }

  let body = ''
  req.on('data', (chunk) => {
    body += chunk.toString()
  })
  req.on('end', async () => {
    try {
      const { email, password } = JSON.parse(body)
      // Check if email and password are correct
      const em = await mikro.getEM()
      const user = await em.findOne(User, { email, password: User.hashPassword(password) }, { populate: ['avatar'] })
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

export const handleGetUserByEmail = async (
  req: IncomingMessage,
  res: ServerResponse<IncomingMessage> & {
    req: IncomingMessage
  }
) => {
  const auth = req.headers.authorization
  if (!auth || auth !== `Bearer ${BackendENV.INTERNAL_SECRET}`) {
    res.writeHead(401)
    res.end()
    return
  }

  let body = ''
  req.on('data', (chunk) => {
    body += chunk.toString()
  })
  req.on('end', async () => {
    try {
      const { email } = JSON.parse(body)
      // Check if email and password are correct
      const em = await mikro.getEM()
      const user = await em.fork().findOne(User, { email: email }, { populate: ['avatar'] })
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
