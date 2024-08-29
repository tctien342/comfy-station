import { Collection, Entity, ManyToOne, OneToMany, OneToOne, PrimaryKey, Property } from '@mikro-orm/core'
import { Client } from './client'
import { Workflow } from './workflow'
import { User } from './user'
import { Token } from './token'
import { ETaskStatus, ETriggerBy } from './enum'
import { WorkflowTaskEvent } from './workflow_task_event'
import { JobItem } from './job_item'
import { Attachment } from './attachment'
import { Trigger } from './trigger'

@Entity({ tableName: 'workflow_task' })
export class WorkflowTask {
  @PrimaryKey()
  id: string

  @ManyToOne({ index: true })
  workflow: Workflow

  @ManyToOne({ nullable: true, index: true })
  client?: Client

  @Property({ default: ETaskStatus.Queuing, index: true })
  status!: ETaskStatus

  @Property({ default: 1 })
  repeatCount!: number

  @Property({ default: 1 })
  computedWeight!: number // More weight, lower priority

  @Property({ type: 'json', nullable: true })
  inputValues?: { [key: string]: string | number }

  @Property({ nullable: true })
  executionTime?: number

  @OneToOne()
  trigger: Trigger

  @Property()
  createdAt = new Date()

  @Property({ onUpdate: () => new Date() })
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

  @ManyToOne({ nullable: true })
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
