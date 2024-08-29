import { Entity, ManyToOne, PrimaryKey, PrimaryKeyProp, Property } from '@mikro-orm/core'
import { Workflow } from './workflow'
import { User } from './user'
import { EWorkflowEditType } from './enum'

export interface IEditAction {
  key: string
  from: string | number | null
  to: string | number | null
}

@Entity({ tableName: 'workflow_edit_event' })
export class WorkflowEditEvent {
  @PrimaryKey()
  id!: number

  @ManyToOne({ index: true })
  workflow: Workflow

  @ManyToOne({ index: true })
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
