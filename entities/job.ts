import { Collection, Entity, ManyToOne, OneToMany, PrimaryKey, Property } from '@mikro-orm/core'
import type { User } from './user'
import { v4 } from 'uuid'
import type { JobItem } from './job_item'

@Entity({ tableName: 'job' })
export class Job {
  @PrimaryKey({ type: 'uuid' })
  id = v4()

  @ManyToOne({ entity: 'User', inversedBy: 'jobs', index: true })
  owner: User

  @Property()
  cron: string

  @Property({ nullable: true })
  note?: string

  @Property()
  createdAt = new Date()

  @Property({ onUpdate: () => new Date() })
  updateAt = new Date()

  @Property({ nullable: true })
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
