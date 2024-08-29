import { Collection, Entity, ManyToOne, OneToMany, PrimaryKey, Property } from '@mikro-orm/core'
import { v4 } from 'uuid'
import { ETokenType } from './enum'

import type { User } from './user'
import type { TokenPermission } from './token_permission'
import type { TokenShared } from './token_shared'
import type { Trigger } from './trigger'

@Entity({ tableName: 'token' })
export class Token {
  @PrimaryKey({ type: 'uuid' })
  id = v4()

  @Property({ nullable: true })
  description?: string

  /**
   * Allow execute all workflows and client actions.
   *
   * Only admin role can create master token.
   */
  @Property({ default: false })
  isMaster!: boolean

  /**
   * Every workflow has a default token, which is used to execute the workflow.
   */
  @Property({ default: false })
  isWorkflowDefault!: boolean

  @Property({ default: ETokenType.Both, index: true })
  type!: ETokenType

  @Property({ default: -1 })
  balance!: number

  @Property({ default: 0 })
  weightOffset!: number

  @ManyToOne('User', 'tokens')
  createdBy: User

  @Property({ nullable: true })
  expireAt?: Date

  @Property()
  createdAt = new Date()

  @Property({ onUpdate: () => new Date() })
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
