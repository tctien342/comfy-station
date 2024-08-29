import { Entity, ManyToOne, OneToOne, PrimaryKey, Property } from '@mikro-orm/core'
import type { WorkflowTask } from './workflow_task'
import { v4 } from 'uuid'
import type { WorkflowTaskEvent } from './workflow_task_event'
import type { Workflow } from './workflow'
import { EAttachmentStatus, EStorageType } from './enum'
import type { User } from './user'

@Entity({ tableName: 'attachment' })
export class Attachment {
  @PrimaryKey({ type: 'uuid' })
  id = v4()

  @Property()
  fileName: string

  @Property({ default: EAttachmentStatus.PENDING, index: true })
  status!: EAttachmentStatus

  @Property({ default: EStorageType.LOCAL })
  storageType!: EStorageType

  @ManyToOne('WorkflowTaskEvent', { nullable: true })
  taskEvent?: WorkflowTaskEvent

  @ManyToOne('WorkflowTask', { nullable: true })
  task?: WorkflowTask

  @ManyToOne('Workflow', { index: true, nullable: true })
  workflow?: Workflow

  @OneToOne({ entity: 'User', mappedBy: 'avatar', nullable: true })
  user?: User

  @Property()
  createdAt = new Date()

  @Property({ onUpdate: () => new Date() })
  updateAt = new Date()

  constructor(fileName: string) {
    this.fileName = fileName
  }
}
