import { Collection, Entity, ManyToOne, OneToMany, OneToOne, PrimaryKey, Property } from '@mikro-orm/core'
import { ETaskStatus } from './enum'

import type { Client } from './client'
import type { Workflow } from './workflow'
import type { WorkflowTaskEvent } from './workflow_task_event'
import type { Attachment } from './attachment'
import type { Trigger } from './trigger'

@Entity()
export class WorkflowTask {
  @PrimaryKey({ type: 'string' })
  id: string

  @ManyToOne('Workflow', { index: true })
  workflow: Workflow

  @ManyToOne('Client', { nullable: true, index: true })
  client?: Client

  @Property({ type: 'varchar', default: ETaskStatus.Queuing, index: true })
  status!: ETaskStatus

  @Property({ type: 'int', default: 1 })
  repeatCount!: number

  @Property({ type: 'float', default: 1 })
  computedWeight!: number // More weight, lower priority

  @Property({ type: 'json', nullable: true })
  inputValues?: { [key: string]: string | number }

  @Property({ type: 'int', nullable: true })
  executionTime?: number

  @OneToOne('Trigger')
  trigger: Trigger

  @Property({ type: 'timestamp' })
  createdAt = new Date()

  @Property({ type: 'timestamp', onUpdate: () => new Date() })
  updateAt = new Date()

  @OneToMany({
    entity: 'WorkflowTaskEvent',
    mappedBy: 'task'
  })
  events = new Collection<WorkflowTaskEvent>(this)

  @OneToMany({
    entity: 'WorkflowTask',
    mappedBy: 'parent'
  })
  subTasks = new Collection<WorkflowTask>(this)

  @ManyToOne({ type: 'WorkflowTask', nullable: true })
  parent?: WorkflowTask

  @OneToMany({
    entity: 'Attachment',
    mappedBy: 'task'
  })
  attachments = new Set<Attachment>()

  constructor(id: string, workflow: Workflow, weight = 0, trigger: Trigger) {
    this.id = id
    this.workflow = workflow
    this.trigger = trigger
    this.computedWeight = weight
  }
}
