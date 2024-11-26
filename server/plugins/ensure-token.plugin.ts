import { Token } from '@/entities/token'
import { BackendENV } from '@/env'
import { MikroORMInstance } from '@/services/mikro-orm'
import Elysia, { t } from 'elysia'
import { verify } from 'jsonwebtoken'

export const EnsureTokenPlugin = new Elysia()
  .guard({
    headers: t.Object({
      authorization: t.TemplateLiteral('Bearer ${string}', { default: 'Bearer XXXX-XXXX-XXXX-XXXX' })
    })
  })
  .resolve({ as: 'scoped' }, async ({ headers: { authorization } }) => {
    const bearerToken = authorization.split(' ')[1]
    const { tokenId } = verify(bearerToken, BackendENV.NEXTAUTH_SECRET) as { tokenId: string }
    const em = await MikroORMInstance.getInstance().getEM()
    const token = await em.findOne(Token, { id: tokenId })
    return {
      token
    }
  })
  .onBeforeHandle(({ token, set }) => {
    if (!token) {
      set.status = 401
      return 'Unauthorized'
    }
  })
