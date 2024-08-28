import { Collection, Entity, OneToMany, OneToOne, PrimaryKey, Property, type Ref } from '@mikro-orm/core'
import { v4 } from 'uuid'
import { createHmac } from 'crypto'
import { Workflow } from './workflow'
import { Token } from './token'
import { WorkflowEditEvent } from './workflow_edit_event'
import { WorkflowTask } from './workflow_task'
import { EUserRole } from './enum'
import { TokenShared } from './token_shared'
import { Job } from './job'
import { UserNotification } from './user_notifications'
import { Attachment } from './attachment'

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

  @OneToOne({ nullable: true })
  avatar?: Attachment

  @Property({ default: EUserRole.User })
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
    entity: 'WorkflowTask',
    mappedBy: 'byUser'
  })
  executedWorkflows = new Collection<WorkflowTask>(this)

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

  constructor(email: string, password: string) {
    this.email = email
    this.password = User.hashPassword(password)
  }

  static hashPassword(password: string): string {
    return createHmac('sha256', password).digest('hex')
  }
}
