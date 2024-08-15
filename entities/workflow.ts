import { Collection, Entity, ManyToOne, OneToMany, PrimaryKey, Property } from '@mikro-orm/core'
import { v4 } from 'uuid'
import { User } from './user'
import { WorkflowEditEvent } from './workflow_edit_event'
import { TokenPermission } from './token_permission'
import { EWorkflowActiveStatus } from './enum'

export interface IMaper {
  key: string
  target: string
  description: string
}

@Entity({
  tableName: 'workflow'
})
export class Workflow {
  @PrimaryKey({ type: 'uuid' })
  id = v4()

  @Property({ nullable: true })
  name?: string

  @Property({ nullable: true })
  description?: string

  @Property()
  rawWorkflow: string

  @Property({ type: 'json', nullable: true })
  mapInput?: { [key: string]: IMaper }

  @Property({ type: 'json', nullable: true })
  mapOutput?: { [key: string]: IMaper }

  @Property({ default: 0 })
  cost!: number // For estimating the cost of running the workflow and calculate new balance of user

  @Property({ default: EWorkflowActiveStatus.Activated })
  status!: EWorkflowActiveStatus

  @Property({ default: 0 })
  baseWeight!: number // Weight of this workflow, more weight means lower priority

  @ManyToOne({ entity: 'User', inversedBy: 'workflows' })
  author: User

  @OneToMany({
    entity: 'WorkflowEditEvent',
    mappedBy: 'workflow'
  })
  editedActions = new Collection<WorkflowEditEvent>(this)

  @OneToMany({
    entity: 'TokenPermission',
    mappedBy: 'workflow'
  })
  grantedTokens = new Collection<TokenPermission>(this)

  @Property()
  createdAt = new Date()

  @Property({ onUpdate: () => new Date() })
  updateAt = new Date()

  constructor(author: User, rawWorkflow: string) {
    this.author = author
    this.rawWorkflow = rawWorkflow
  }
}
