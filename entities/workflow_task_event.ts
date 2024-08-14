import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core'
import { ETaskStatus } from './enum'
import { WorkflowTask } from './workflow_task'

@Entity()
export class WorkflowTaskEvent {
  @PrimaryKey()
  id!: number

  @ManyToOne()
  task: WorkflowTask

  @Property({ default: ETaskStatus.Queuing })
  status!: ETaskStatus

  @Property({ type: 'string', nullable: true })
  details?: string

  @Property({ type: 'json', nullable: true })
  data?: { [key: string]: string | number }

  @Property()
  createdAt = new Date()

  constructor(WorkflowTask: WorkflowTask) {
    this.task = WorkflowTask
  }
}
