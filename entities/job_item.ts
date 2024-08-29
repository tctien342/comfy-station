import { Collection, Entity, ManyToOne, OneToMany, Property } from '@mikro-orm/core'
import { Job } from './job'
import { EJobType } from './enum'
import { Trigger } from './trigger'

@Entity({ tableName: 'job_item' })
export class JobItem {
  @Property({ primary: true })
  id!: number

  @ManyToOne({ primary: true })
  job: Job

  @Property({ index: true })
  type: EJobType

  @Property({ type: 'json' })
  config: object

  @OneToMany({
    entity: 'Trigger',
    mappedBy: 'jobTask'
  })
  triggers = new Collection<Trigger>(this)

  constructor(job: Job, type: EJobType, config: object) {
    this.job = job
    this.type = type
    this.config = config
  }
}
