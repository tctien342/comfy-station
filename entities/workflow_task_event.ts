import { Entity, ManyToOne, OneToMany, PrimaryKey, Property } from '@mikro-orm/core'
import { ETaskStatus, EValueType } from './enum'
import { WorkflowTask } from './workflow_task'
import { WorkflowAttachment } from './workflow_attachment'

export interface ITaskEventData {
  type: EValueType
  /**
   * Will be ID if type is File or Image
   */
  value: string | number | boolean
}

@Entity({ tableName: 'workflow_task_event' })
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
  data?: { [key: string]: ITaskEventData }

  @Property()
  createdAt = new Date()

  @OneToMany({
    entity: () => WorkflowAttachment,
    mappedBy: 'taskEvent'
  })
  attachments = new Set<WorkflowAttachment>()

  constructor(WorkflowTask: WorkflowTask) {
    this.task = WorkflowTask
  }
}
