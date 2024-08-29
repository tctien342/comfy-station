import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core'
import { WorkflowTask } from './workflow_task'
import { v4 } from 'uuid'
import { WorkflowTaskEvent } from './workflow_task_event'
import { Workflow } from './workflow'
import { EAttachmentStatus, EStorageType } from './enum'

@Entity({ tableName: 'attachment' })
export class Attachment {
  @PrimaryKey({ type: 'uuid' })
  id = v4()

  @Property()
  fileName: string

  @ManyToOne({ nullable: true })
  taskEvent?: WorkflowTaskEvent

  @ManyToOne({ nullable: true })
  task?: WorkflowTask

  @ManyToOne({ index: true, nullable: true })
  workflow?: Workflow

  @Property({ default: EAttachmentStatus.PENDING, index: true })
  status!: EAttachmentStatus

  @Property({ default: EStorageType.LOCAL })
  storageType!: EStorageType

  @Property()
  createdAt = new Date()

  @Property({ onUpdate: () => new Date() })
  updateAt = new Date()

  constructor(fileName: string) {
    this.fileName = fileName
  }
}
