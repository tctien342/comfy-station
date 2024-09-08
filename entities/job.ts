import { Cascade, Collection, Entity, ManyToOne, OneToMany, PrimaryKey, Property } from '@mikro-orm/core'
import type { User } from './user'
import { v4 } from 'uuid'
import type { JobItem } from './job_item'

@Entity()
export class Job {
  @PrimaryKey({ type: 'string' })
  id = v4()

  @ManyToOne({ entity: 'User', inversedBy: 'jobs', index: true, deleteRule: 'cascade' })
  owner: User

  @Property({ type: 'string' })
  cron: string

  @Property({ type: 'string', nullable: true })
  note?: string

  @Property({ type: 'timestamp' })
  createdAt = new Date()

  @Property({ type: 'timestamp', onUpdate: () => new Date() })
  updateAt = new Date()

  @Property({ type: 'timestamp', nullable: true })
  lastRunAt?: Date

  @OneToMany({
    entity: 'JobItem',
    mappedBy: 'job'
  })
  tasks = new Collection<JobItem>(this)

  constructor(user: User, cron: string) {
    this.owner = user
    this.cron = cron
  }
}
