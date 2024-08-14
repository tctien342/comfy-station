import { Collection, Entity, OneToMany, PrimaryKey, Property, type Ref } from '@mikro-orm/core'
import { v4 } from 'uuid'
import { createHmac } from 'crypto'
import { Workflow } from './workflow'
import { Token } from './token'
import { WorkflowEditEvent } from './workflow_edit_event'
import { WorkflowTask } from './workflow_task'
import { EUserRole } from './enum'

export interface IMaper {
  key: string
  target: string
  description: string
}

@Entity()
export class User {
  @PrimaryKey({ type: 'uuid' })
  id = v4()

  @Property({ unique: true })
  email: string

  @Property({ lazy: true })
  password: string

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
    entity: () => Workflow,
    mappedBy: (o) => o.author
  })
  workflows = new Collection<Workflow>(this)

  @OneToMany({
    entity: () => Token,
    mappedBy: (o) => o.createdBy
  })
  tokens = new Collection<Token>(this)

  @OneToMany({
    entity: () => WorkflowEditEvent,
    mappedBy: (o) => o.user
  })
  editWorkflowActions = new Collection<WorkflowEditEvent>(this)

  @OneToMany({
    entity: () => WorkflowTask,
    mappedBy: (o) => o.byUser
  })
  executedWorkflows = new Collection<WorkflowTask>(this)

  constructor(email: string, password: string) {
    this.email = email
    this.password = User.hashPassword(password)
  }

  static hashPassword(password: string): string {
    return createHmac('sha256', password).digest('hex')
  }
}
