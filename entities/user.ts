import { Collection, Entity, OneToMany, OneToOne, PrimaryKey, Property } from '@mikro-orm/core'
import { v4 } from 'uuid'
import { createHmac } from 'crypto'
import { EUserRole } from './enum'

import type { Workflow } from './workflow'
import type { Token } from './token'
import type { WorkflowEditEvent } from './workflow_edit_event'
import type { TokenShared } from './token_shared'
import type { Job } from './job'
import type { UserNotification } from './user_notifications'
import type { Attachment } from './attachment'
import type { Trigger } from './trigger'

export interface IMaper {
  key: string
  target: string
  description: string
}

@Entity({
  tableName: 'user'
})
export class User {
  @PrimaryKey({ type: 'uuid' })
  id = v4()

  @Property({ unique: true })
  email: string

  @Property({ lazy: true })
  password: string

  @OneToOne({ entity: 'Attachment', inversedBy: 'user', nullable: true })
  avatar?: Attachment

  @Property({ default: EUserRole.User, index: true })
  role!: EUserRole

  @Property({ default: -1 })
  balance!: number

  @Property({ default: 0 })
  weightOffset!: number

  @Property()
  createdAt = new Date()

  @Property({ onUpdate: () => new Date() })
  updateAt = new Date()

  @OneToMany({
    entity: 'Workflow',
    mappedBy: 'author'
  })
  workflows = new Collection<Workflow>(this)

  @OneToMany({
    entity: 'Token',
    mappedBy: 'createdBy'
  })
  tokens = new Collection<Token>(this)

  @OneToMany({
    entity: 'TokenShared',
    mappedBy: 'user'
  })
  sharedTokens = new Collection<TokenShared>(this)

  @OneToMany({
    entity: 'WorkflowEditEvent',
    mappedBy: 'user'
  })
  editWorkflowActions = new Collection<WorkflowEditEvent>(this)

  @OneToMany({
    entity: 'Job',
    mappedBy: 'owner'
  })
  jobs = new Collection<Job>(this)

  @OneToMany({
    entity: 'UserNotification',
    mappedBy: 'user'
  })
  notifications = new Collection<UserNotification>(this)

  @OneToMany({
    entity: 'Trigger',
    mappedBy: 'user'
  })
  triggers = new Collection<Trigger>(this)

  constructor(email: string, password: string) {
    this.email = email
    this.password = User.hashPassword(password)
  }

  static hashPassword(password: string): string {
    return createHmac('sha256', password).digest('hex')
  }
}
