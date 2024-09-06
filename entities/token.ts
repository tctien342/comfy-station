import { Collection, Entity, ManyToOne, OneToMany, PrimaryKey, Property } from '@mikro-orm/core'
import { v4 } from 'uuid'
import { ETokenType } from './enum'

import type { User } from './user'
import type { TokenPermission } from './token_permission'
import type { TokenShared } from './token_shared'
import type { Trigger } from './trigger'

@Entity()
export class Token {
  @PrimaryKey({ type: 'string' })
  id = v4()

  @Property({ type: 'string', nullable: true })
  description?: string

  /**
   * Allow execute all workflows and client actions.
   *
   * Only admin role can create master token.
   */
  @Property({ type: 'boolean', default: false })
  isMaster!: boolean

  /**
   * Every workflow has a default token, which is used to execute the workflow.
   */
  @Property({ type: 'boolean', default: false })
  isWorkflowDefault!: boolean

  @Property({ type: 'varchar', default: ETokenType.Both, index: true })
  type!: ETokenType

  @Property({ type: 'float', default: -1 })
  balance!: number

  @Property({ type: 'float', default: 0 })
  weightOffset!: number

  @ManyToOne('User', 'tokens')
  createdBy: User

  @Property({ type: 'timestamp', nullable: true })
  expireAt?: Date

  @Property({ type: 'timestamp' })
  createdAt = new Date()

  @Property({ type: 'timestamp', onUpdate: () => new Date() })
  updateAt = new Date()

  @OneToMany({
    entity: 'TokenPermission',
    mappedBy: 'token'
  })
  grantedWorkflows = new Collection<TokenPermission>(this)

  @OneToMany({
    entity: 'TokenShared',
    mappedBy: 'token'
  })
  sharedUsers = new Collection<TokenShared>(this)

  @OneToMany({
    entity: 'Trigger',
    mappedBy: 'token'
  })
  triggers = new Collection<Trigger>(this)

  constructor(createdBy: User) {
    this.createdBy = createdBy
  }
}
