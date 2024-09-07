import { Entity, ManyToOne, OneToOne, PrimaryKey, Property } from '@mikro-orm/core'
import { v4 } from 'uuid'
import { EAttachmentStatus, EStorageType } from './enum'
import type { WorkflowTask } from './workflow_task'
import type { WorkflowTaskEvent } from './workflow_task_event'
import type { Workflow } from './workflow'
import type { User } from './user'
import type { Resource } from './client_resource'

@Entity()
export class Attachment {
  @PrimaryKey({ type: 'string' })
  id = v4()

  @Property({ type: 'string' })
  fileName: string

  @Property({ type: 'varchar', default: EAttachmentStatus.PENDING, index: true })
  status!: EAttachmentStatus

  @Property({ type: 'varchar', default: EStorageType.LOCAL })
  storageType!: EStorageType

  @ManyToOne('WorkflowTaskEvent', { nullable: true })
  taskEvent?: WorkflowTaskEvent

  @ManyToOne('WorkflowTask', { nullable: true })
  task?: WorkflowTask

  @ManyToOne('Workflow', { index: true, nullable: true })
  workflow?: Workflow

  @OneToOne({ entity: 'User', mappedBy: 'avatar', nullable: true })
  user?: User

  @OneToOne({ entity: 'Resource', mappedBy: 'image', nullable: true })
  resource?: Resource

  @Property({ type: 'timestamp' })
  createdAt = new Date()

  @Property({ type: 'timestamp', onUpdate: () => new Date() })
  updateAt = new Date()

  constructor(fileName: string) {
    this.fileName = fileName
  }
}
