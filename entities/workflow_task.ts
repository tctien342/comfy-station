import { Collection, Entity, ManyToOne, OneToMany, PrimaryKey, Property } from '@mikro-orm/core'
import { Client } from './client'
import { Workflow } from './workflow'
import { User } from './user'
import { Token } from './token'
import { ETaskStatus, ETriggerBy } from './enum'
import { WorkflowTaskEvent } from './workflow_task_event'

@Entity({ tableName: 'workflow_task' })
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

  @Property()
  triggerBy: ETriggerBy

  @ManyToOne({ nullable: true })
  byUser?: User

  @ManyToOne({ nullable: true })
  byToken?: Token

  @Property()
  createdAt = new Date()

  @Property({ onUpdate: () => new Date() })
  updateAt = new Date()

  @OneToMany({
    entity: 'WorkflowTaskEvent',
    mappedBy: 'task'
  })
  events = new Collection<WorkflowTaskEvent>(this)

  constructor(id: string, workflow: Workflow, weight = 0, triggerBy: ETriggerBy) {
    this.id = id
    this.workflow = workflow
    this.triggerBy = triggerBy
    this.computedWeight = weight
  }
}
