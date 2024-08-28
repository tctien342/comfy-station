import { Collection, Entity, ManyToOne, OneToMany, PrimaryKey, Property } from '@mikro-orm/core'
import { v4 } from 'uuid'
import { User } from './user'
import { WorkflowEditEvent } from './workflow_edit_event'
import { TokenPermission } from './token_permission'
import { EValueType, EWorkflowActiveStatus } from './enum'
import { Attachment } from './attachment'
import { WorkflowTask } from './workflow_task'

export interface IMapTarget {
  /**
   * KSampler
   */
  nodeName: string
  /**
   * Seed
   */
  keyName: string
  /**
   * 14.inputs.seed
   */
  mapVal: string
}

export interface IMaperBase {
  key: string
  type: EValueType | EValueType
  iconName?: string
  description?: string
}

export interface IMapperInput extends IMaperBase {
  target: Array<IMapTarget>
  min?: number
  max?: number
  /**
   * Only for type = 'Number'
   */
  cost?: {
    related: boolean
    /**
     * Workflow cost = old workflow cost + value * costPerUnit
     */
    costPerUnit: number
  }
  /**
   * Only for types = Checkpoint | Lora | Sampler | Scheduler
   */
  selections?: Array<string>
  default?: string | number | boolean
}

export interface IMapperOutput extends IMaperBase {
  target: IMapTarget
  /**
   * If true, the output will join all array elements to a string (Only used with type = 'String')
   */
  joinArray?: boolean
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
  mapInput?: { [key: string]: IMapperInput }

  @Property({ type: 'json', nullable: true })
  mapOutput?: { [key: string]: IMapperOutput }

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

  @OneToMany({
    entity: 'Attachment',
    mappedBy: 'workflow'
  })
  attachments = new Set<Attachment>()

  @OneToMany({
    entity: 'WorkflowTask',
    mappedBy: 'workflow'
  })
  tasks = new Collection<WorkflowTask>(this)

  @Property()
  createdAt = new Date()

  @Property({ onUpdate: () => new Date() })
  updateAt = new Date()

  constructor(author: User, rawWorkflow: string) {
    this.author = author
    this.rawWorkflow = rawWorkflow
  }
}
