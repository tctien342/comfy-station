import { Entity, ManyToOne, Property } from '@mikro-orm/core'
import type { Token } from './token'
import type { User } from './user'

@Entity()
export class TokenShared {
  @ManyToOne({ entity: 'Token', inversedBy: 'sharedUsers', primary: true, index: true })
  token: Token

  @ManyToOne({ entity: 'User', inversedBy: 'sharedTokens', primary: true, index: true })
  user: User

  @Property({ type: 'timestamp' })
  createdAt = new Date()

  constructor(token: Token, user: User) {
    this.token = token
    this.user = user
  }
}
