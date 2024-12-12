import { Cascade, Entity, ManyToOne, OneToMany, PrimaryKey, Property } from '@mikro-orm/core'
import { ETaskStatus, EValueType } from './enum'

import type { WorkflowTask } from './workflow_task'
import type { Attachment } from './attachment'

@Entity()
export class WorkflowTaskEvent {
  @PrimaryKey({ type: 'bigint' })
  id!: number

  @ManyToOne({ entity: 'WorkflowTask', inversedBy: 'events', index: true, deleteRule: 'cascade' })
  task: WorkflowTask

  @Property({ type: 'varchar', default: ETaskStatus.Queuing, index: true })
  status!: ETaskStatus

  @Property({ type: 'string', nullable: true })
  details?: string

  @Property({ type: 'json', nullable: true })
  data?: Record<string, any>

  @Property({ type: 'timestamp' })
  createdAt = new Date()

  @OneToMany({
    entity: 'Attachment',
    mappedBy: 'taskEvent',
    cascade: [Cascade.REMOVE]
  })
  attachments = new Set<Attachment>()

  constructor(WorkflowTask: WorkflowTask) {
    this.task = WorkflowTask
  }
}
