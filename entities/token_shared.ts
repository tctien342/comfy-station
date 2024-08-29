import { Entity, ManyToOne, Property } from '@mikro-orm/core'
import { Workflow } from './workflow'
import { Token } from './token'
import { User } from './user'

@Entity({ tableName: 'token_shared' })
export class TokenShared {
  @ManyToOne({ primary: true, index: true })
  token: Token

  @ManyToOne({ primary: true, index: true })
  user: User

  @Property()
  createdAt = new Date()

  constructor(token: Token, user: User) {
    this.token = token
    this.user = user
  }
}
