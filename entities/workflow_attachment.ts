import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core'
import { WorkflowTask } from './workflow_task'
import { v4 } from 'uuid'
import { WorkflowTaskEvent } from './workflow_task_event'
import { Workflow } from './workflow'

export enum EAttachmentStatus {
  PENDING = 'PENDING',
  UPLOADED = 'UPLOADED',
  FAILED = 'FAILED'
}

export enum EStorageType {
  LOCAL = 'LOCAL',
  S3 = 'S3'
}

@Entity({ tableName: 'workflow_attachment' })
export class WorkflowAttachment {
  @PrimaryKey({ type: 'uuid' })
  id = v4()

  @Property()
  fileName: string

  @ManyToOne()
  taskEvent: WorkflowTaskEvent

  @ManyToOne()
  task: WorkflowTask

  @ManyToOne({ index: true })
  workflow: Workflow

  @Property({ default: EAttachmentStatus.PENDING })
  status!: EAttachmentStatus

  @Property({ default: EStorageType.LOCAL })
  storageType!: EStorageType

  @Property()
  createdAt = new Date()

  @Property({ onUpdate: () => new Date() })
  updateAt = new Date()

  constructor(event: WorkflowTaskEvent, fileName: string) {
    this.taskEvent = event
    this.fileName = fileName
    this.task = event.task
    this.workflow = event.task.workflow
  }
}
