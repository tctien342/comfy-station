import { Entity, ManyToOne, Property } from '@mikro-orm/core'
import { Workflow } from './workflow'
import { Token } from './token'
import { Job } from './job'
import { EJobType } from './enum'

@Entity({ tableName: 'job_item' })
export class JobItem {
  @Property({ primary: true })
  id!: number

  @ManyToOne({ primary: true })
  job: Job

  @Property()
  type: EJobType

  @Property({ type: 'json' })
  config: object

  constructor(job: Job, type: EJobType, config: object) {
    this.job = job
    this.type = type
    this.config = config
  }
}
