import { Entity, ManyToOne, PrimaryKey, PrimaryKeyProp, Property } from '@mikro-orm/core'
import { EWorkflowEditType } from './enum'

import type { Workflow } from './workflow'
import type { User } from './user'

export interface IEditAction {
  key: string
  from: string | number | null
  to: string | number | null
}

@Entity({ tableName: 'workflow_edit_event' })
export class WorkflowEditEvent {
  @PrimaryKey()
  id!: number

  @ManyToOne({ entity: 'Workflow', inversedBy: 'editedActions', index: true })
  workflow: Workflow

  @ManyToOne({ entity: 'User', inversedBy: 'editWorkflowActions', index: true })
  user: User

  @Property({ default: EWorkflowEditType.Create, index: true })
  type!: EWorkflowEditType

  @Property({ type: 'json', nullable: true })
  info?: { [key: string]: IEditAction }

  @Property()
  createdAt = new Date()

  constructor(workflow: Workflow, user: User) {
    this.workflow = workflow
    this.user = user
  }
}
