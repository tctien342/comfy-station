import { Entity, ManyToOne, OneToMany, PrimaryKey, Property } from '@mikro-orm/core'
import { ETaskStatus, EValueType } from './enum'

import type { WorkflowTask } from './workflow_task'
import type { Attachment } from './attachment'

export interface ITaskEventData {
  type: EValueType
  /**
   * Will be ID if type is File or Image
   */
  value: string | number | boolean
}

@Entity()
export class WorkflowTaskEvent {
  @PrimaryKey({ type: 'bigint' })
  id!: number

  @ManyToOne({ entity: 'WorkflowTask', inversedBy: 'events', index: true })
  task: WorkflowTask

  @Property({ type: 'varchar', default: ETaskStatus.Queuing, index: true })
  status!: ETaskStatus

  @Property({ type: 'string', nullable: true })
  details?: string

  @Property({ type: 'json', nullable: true })
  data?: { [key: string]: ITaskEventData }

  @Property({ type: 'timestamp' })
  createdAt = new Date()

  @OneToMany({
    entity: 'Attachment',
    mappedBy: 'taskEvent'
  })
  attachments = new Set<Attachment>()

  constructor(WorkflowTask: WorkflowTask) {
    this.task = WorkflowTask
  }
}
