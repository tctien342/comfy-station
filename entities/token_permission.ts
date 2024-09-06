import { Entity, ManyToOne, Property } from '@mikro-orm/core'
import type { Workflow } from './workflow'
import type { Token } from './token'

@Entity()
export class TokenPermission {
  @ManyToOne({ entity: 'Token', inversedBy: 'grantedWorkflows', primary: true, index: true })
  token: Token

  @ManyToOne({ entity: 'Workflow', inversedBy: 'grantedTokens', primary: true, index: true })
  workflow: Workflow

  @Property({ type: 'float', default: 0 })
  weightOffset!: number

  @Property({ type: 'timestamp' })
  createdAt = new Date()

  constructor(workflow: Workflow, token: Token) {
    this.workflow = workflow
    this.token = token
  }
}
