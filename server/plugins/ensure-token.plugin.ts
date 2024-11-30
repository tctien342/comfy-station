import { Token } from '@/entities/token'
import { BackendENV } from '@/env'
import { MikroORMInstance } from '@/services/mikro-orm'
import Elysia, { t } from 'elysia'
import { verify } from 'jsonwebtoken'
import { EnsureMikroORMPlugin } from './ensure-mikro-orm.plugin'

export const EnsureTokenPlugin = new Elysia()
  .guard({
    headers: t.Object({
      authorization: t.TemplateLiteral('Bearer ${string}', { default: 'Bearer XXXX-XXXX-XXXX-XXXX' })
    })
  })
  .use(EnsureMikroORMPlugin)
  .resolve({ as: 'scoped' }, async ({ headers: { authorization }, set, em }) => {
    const bearerToken = authorization.split(' ')[1]
    const token = await em!.findOne(Token, { id: bearerToken }, { populate: ['grantedWorkflows.*', 'createdBy'] })
    if (!token) {
      set.status = 401
      throw new Error('Unauthorized')
    }
    return {
      token
    }
  })
