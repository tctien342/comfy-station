import { Entity, ManyToOne, Property } from '@mikro-orm/core'
import { Workflow } from './workflow'
import { Token } from './token'

@Entity({ tableName: 'token_permission' })
export class TokenPermission {
  @ManyToOne({ primary: true, index: true })
  token: Token

  @ManyToOne({ primary: true, index: true })
  workflow: Workflow

  @Property({ default: 0 })
  weightOffset!: number

  @Property()
  createdAt = new Date()

  constructor(workflow: Workflow, token: Token) {
    this.workflow = workflow
    this.token = token
  }
}
