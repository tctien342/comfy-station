import { Cascade, Collection, Entity, ManyToOne, OneToMany, PrimaryKey, Property } from '@mikro-orm/core'
import { v4 } from 'uuid'
import { EValueSelectionType, EValueType, EWorkflowActiveStatus } from './enum'

import type { User } from './user'
import type { WorkflowEditEvent } from './workflow_edit_event'
import type { TokenPermission } from './token_permission'
import type { Attachment } from './attachment'
import type { WorkflowTask } from './workflow_task'
import { ComfyApi, PromptBuilder } from '@saintno/comfyui-sdk'

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
  type: EValueType | EValueSelectionType
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

@Entity()
export class Workflow {
  @PrimaryKey({ type: 'string' })
  id = v4()

  @Property({ type: 'string', nullable: true })
  name?: string

  @Property({ type: 'string', nullable: true })
  description?: string

  @Property({ type: 'string' })
  rawWorkflow: string

  @Property({ type: 'boolean', default: false })
  hideWorkflow = false

  @Property({ type: 'boolean', default: false })
  allowLocalhost = false

  @Property({ type: 'json', nullable: true })
  mapInput?: { [key: string]: IMapperInput }

  @Property({ type: 'json', nullable: true })
  mapOutput?: { [key: string]: IMapperOutput }

  @Property({ type: 'float', default: 0 })
  cost!: number // For estimating the cost of running the workflow and calculate new balance of user

  @Property({ type: 'varchar', default: EWorkflowActiveStatus.Activated, index: true })
  status!: EWorkflowActiveStatus

  @Property({ type: 'float', default: 0 })
  baseWeight!: number // Weight of this workflow, more weight means lower priority

  @ManyToOne({ entity: 'User', inversedBy: 'workflows', index: true, deleteRule: 'cascade' })
  author: User

  @OneToMany({
    entity: 'WorkflowEditEvent',
    mappedBy: 'workflow',
    cascade: [Cascade.REMOVE],
    orphanRemoval: true
  })
  editedActions = new Collection<WorkflowEditEvent>(this)

  @OneToMany({
    entity: 'TokenPermission',
    mappedBy: 'workflow',
    cascade: [Cascade.REMOVE],
    orphanRemoval: true
  })
  grantedTokens = new Collection<TokenPermission>(this)

  @OneToMany({
    entity: 'Attachment',
    mappedBy: 'workflow',
    cascade: [Cascade.REMOVE]
  })
  attachments = new Set<Attachment>()

  @OneToMany({
    entity: 'WorkflowTask',
    mappedBy: 'workflow',
    cascade: [Cascade.REMOVE],
    orphanRemoval: true
  })
  tasks = new Collection<WorkflowTask>(this)

  @Property({ type: 'timestamp' })
  createdAt = new Date()

  @Property({ type: 'timestamp', onUpdate: () => new Date() })
  updateAt = new Date()

  constructor(author: User, rawWorkflow: string) {
    this.author = author
    this.rawWorkflow = rawWorkflow
  }

  static getBuilder(workflow: Workflow) {
    const inputKeys = Object.keys(workflow.mapInput ?? {})
    const outputKeys = Object.keys(workflow.mapOutput ?? {})
    const builder = new PromptBuilder(JSON.parse(workflow.rawWorkflow), inputKeys, outputKeys)
    for (const inputKey of inputKeys) {
      const input = workflow.mapInput?.[inputKey]
      if (!input) continue
      console.log('input', input)
      builder.setInputNode(
        inputKey,
        input.target.map((t) => t.mapVal)
      )
    }
    for (const outputKey of outputKeys) {
      const output = workflow.mapOutput?.[outputKey]
      if (!output) continue
      builder.setOutputNode(outputKey, output.target.mapVal)
    }
    return builder
  }

  static async parseOutput(api: ComfyApi, workflow: Workflow, data: any) {
    const mapOutput = workflow.mapOutput
    const dataOut: Record<string, number | boolean | string | Array<Blob>> = {}
    for (const key in mapOutput) {
      let tmp: any
      const outputConf = mapOutput[key]
      const output = data[key]
      if (outputConf.target.keyName) {
        if (output[outputConf.target.keyName]) {
          tmp = output[outputConf.target.keyName]
        }
      }
      switch (outputConf.type) {
        case EValueType.Boolean:
          tmp = Boolean(tmp)
          break
        case EValueType.Number:
          tmp = Number(tmp)
          break
        case EValueType.String:
          if (Array.isArray(tmp)) {
            tmp = tmp.join('')
          } else {
            tmp = String(tmp)
          }
          break
        case EValueType.Image:
          if (!tmp && 'images' in output) {
            const { images } = output
            tmp = await Promise.all(images.map((img: any) => api.getImage(img)))
            break
          }
        case EValueType.File:
          if (tmp) {
            if (Array.isArray(tmp)) {
              tmp = await Promise.all(tmp.map((media: any) => api.getImage(media)))
            } else {
              tmp = [await api.getImage(tmp)]
            }
          }
      }
      if (tmp) {
        dataOut[key] = tmp
      }
    }
    return dataOut
  }
}
