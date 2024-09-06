import { Collection, Entity, ManyToOne, OneToMany, Property } from '@mikro-orm/core'
import type { Job } from './job'
import type { EJobType } from './enum'
import type { Trigger } from './trigger'

@Entity()
export class JobItem {
  @Property({ type: 'bigint', primary: true })
  id!: number

  @ManyToOne({ entity: 'Job', inversedBy: 'tasks', primary: true })
  job: Job

  @Property({ type: 'varchar', index: true })
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
