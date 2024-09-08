import { Entity, ManyToOne, PrimaryKey, PrimaryKeyProp, Property } from '@mikro-orm/core'
import { EWorkflowEditType } from './enum'

import type { Workflow } from './workflow'
import type { User } from './user'

export interface IEditAction {
  key: string
  from: string | number | null
  to: string | number | null
}

@Entity()
export class WorkflowEditEvent {
  @PrimaryKey({ type: 'bigint' })
  id!: number

  @ManyToOne({ entity: 'Workflow', inversedBy: 'editedActions', index: true, deleteRule: 'cascade' })
  workflow: Workflow

  @ManyToOne({ entity: 'User', inversedBy: 'editWorkflowActions', index: true, deleteRule: 'cascade' })
  user: User

  @Property({ type: 'varchar', default: EWorkflowEditType.Create, index: true })
  type!: EWorkflowEditType

  @Property({ type: 'json', nullable: true })
  info?: { [key: string]: IEditAction }

  @Property({ type: 'timestamp' })
  createdAt = new Date()

  constructor(workflow: Workflow, user: User) {
    this.workflow = workflow
    this.user = user
  }
}
