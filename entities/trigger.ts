import { Entity, ManyToOne, OneToOne, PrimaryKey, Property } from '@mikro-orm/core'
import { ETriggerBy } from './enum'

import type { User } from './user'
import type { Token } from './token'
import type { JobItem } from './job_item'
import type { ClientActionEvent } from './client_action_event'

@Entity({ tableName: 'trigger' })
export class Trigger {
  @PrimaryKey()
  id!: number

  @Property({ index: true })
  type: ETriggerBy

  @ManyToOne({ entity: 'User', inversedBy: 'triggers', nullable: true, index: true })
  user?: User

  @ManyToOne({ entity: 'Token', inversedBy: 'triggers', nullable: true, index: true })
  token?: Token

  @ManyToOne({ entity: 'JobItem', inversedBy: 'triggers', nullable: true, index: true })
  jobTask?: JobItem

  @OneToOne('ClientActionEvent', { nullable: true, mappedBy: 'trigger' })
  clientActionEvent?: ClientActionEvent

  @Property()
  createdAt = new Date()

  constructor(type: ETriggerBy) {
    this.type = type
  }
}
