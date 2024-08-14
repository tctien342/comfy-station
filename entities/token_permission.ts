import { Entity, ManyToOne, Property } from '@mikro-orm/core'
import { Workflow } from './workflow'
import { Token } from './token'

@Entity()
export class TokenPermission {
  @ManyToOne({ primary: true })
  token: Token

  @ManyToOne({ primary: true })
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
