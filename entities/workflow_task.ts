import { Collection, Entity, ManyToOne, OneToMany, PrimaryKey, Property } from '@mikro-orm/core'
import { Client } from './client'
import { Workflow } from './workflow'
import { User } from './user'
import { Token } from './token'
import { ETaskStatus } from './enum'
import { WorkflowTaskEvent } from './workflow_task_event'

@Entity()
export class WorkflowTask {
  @PrimaryKey()
  id: string

  @ManyToOne()
  workflow: Workflow

  @ManyToOne({ nullable: true })
  client?: Client

  @Property({ default: ETaskStatus.Queuing })
  status!: ETaskStatus

  @Property({ default: 1 })
  computedWeight!: number // More weight, lower priority

  @Property({ type: 'json', nullable: true })
  inputValues?: { [key: string]: string | number }

  @Property({ nullable: true })
  executionTime?: number

  @ManyToOne({ nullable: true })
  byUser?: User

  @ManyToOne({ nullable: true })
  byToken?: Token

  @Property()
  createdAt = new Date()

  @Property({ onUpdate: () => new Date() })
  updateAt = new Date()

  @OneToMany({
    entity: () => WorkflowTaskEvent,
    mappedBy: (o) => o.task
  })
  events = new Collection<WorkflowTaskEvent>(this)

  constructor(id: string, workflow: Workflow, weight = 0) {
    this.id = id
    this.workflow = workflow
    this.computedWeight = weight
  }
}
