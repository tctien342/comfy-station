import { Cascade, Collection, Entity, ManyToOne, OneToMany, OneToOne, PrimaryKey, Property } from '@mikro-orm/core'
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

  @ManyToOne('Workflow', { index: true, deleteRule: 'cascade' })
  workflow: Workflow

  @ManyToOne('Client', { nullable: true, index: true, deleteRule: 'set null' })
  client?: Client

  @Property({ type: 'varchar', default: ETaskStatus.Queuing, index: true })
  status!: ETaskStatus

  @Property({ type: 'int', default: 1 })
  repeatCount!: number

  @Property({ type: 'float', default: 0 })
  computedCost!: number

  @Property({ type: 'float', default: 1 })
  computedWeight!: number // More weight, lower priority

  @Property({ type: 'json', nullable: true })
  inputValues?: { [key: string]: string | number | string[] }

  @Property({ type: 'int', nullable: true })
  executionTime?: number

  @OneToOne('Trigger', { deleteRule: 'cascade' })
  trigger: Trigger

  @Property({ type: 'timestamp' })
  createdAt = new Date()

  @Property({ type: 'timestamp', onUpdate: () => new Date() })
  updateAt = new Date()

  @OneToMany({
    entity: 'WorkflowTaskEvent',
    mappedBy: 'task',
    cascade: [Cascade.REMOVE],
    orphanRemoval: true
  })
  events = new Collection<WorkflowTaskEvent>(this)

  @OneToMany({
    entity: 'WorkflowTask',
    mappedBy: 'parent',
    cascade: [Cascade.REMOVE],
    orphanRemoval: true
  })
  subTasks = new Collection<WorkflowTask>(this)

  @ManyToOne({ type: 'WorkflowTask', nullable: true, deleteRule: 'cascade' })
  parent?: WorkflowTask

  @OneToMany({
    entity: 'Attachment',
    mappedBy: 'task',
    cascade: [Cascade.REMOVE]
  })
  attachments = new Set<Attachment>()

  constructor(id: string, workflow: Workflow, weight = 0, trigger: Trigger) {
    this.id = id
    this.workflow = workflow
    this.trigger = trigger
    this.computedWeight = weight
  }
}
