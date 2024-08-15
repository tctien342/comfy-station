import { Collection, Entity, ManyToOne, OneToMany, PrimaryKey, Property } from '@mikro-orm/core'
import { v4 } from 'uuid'
import { User } from './user'
import { TokenPermission } from './token_permission'
import { WorkflowTask } from './workflow_task'
import { ETokenType } from './enum'

@Entity({ tableName: 'token' })
export class Token {
  @PrimaryKey({ type: 'uuid' })
  id = v4()

  @Property({ nullable: true })
  description?: string

  @Property({ default: false })
  isMaster!: boolean // Allow execute all workflows

  @Property({ default: ETokenType.Both })
  type!: ETokenType

  @Property({ default: -1 })
  balance!: number

  @Property({ default: 0 })
  weightOffset!: number

  @ManyToOne({ entity: 'User', inversedBy: 'tokens' })
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
    entity: 'WorkflowTask',
    mappedBy: 'byToken'
  })
  executedWorkflows = new Collection<WorkflowTask>(this)

  constructor(created_by: User) {
    this.createdBy = created_by
  }
}
