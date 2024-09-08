import { Entity, ManyToOne, OneToOne, PrimaryKey, Property } from '@mikro-orm/core'
import { ETriggerBy } from './enum'

import type { User } from './user'
import type { Token } from './token'
import type { JobItem } from './job_item'
import type { ClientActionEvent } from './client_action_event'

@Entity()
export class Trigger {
  @PrimaryKey({ type: 'bigint' })
  id!: number

  @Property({ type: 'varchar', index: true })
  type: ETriggerBy

  @ManyToOne({ entity: 'User', inversedBy: 'triggers', nullable: true, index: true, deleteRule: 'set null' })
  user?: User

  @ManyToOne({ entity: 'Token', inversedBy: 'triggers', nullable: true, index: true, deleteRule: 'set null' })
  token?: Token

  @ManyToOne({ entity: 'JobItem', inversedBy: 'triggers', nullable: true, index: true, deleteRule: 'set null' })
  jobTask?: JobItem

  @OneToOne({ entity: 'ClientActionEvent', nullable: true, mappedBy: 'trigger', deleteRule: 'set null' })
  clientActionEvent?: ClientActionEvent

  @Property({ type: 'timestamp' })
  createdAt = new Date()

  constructor(type: ETriggerBy) {
    this.type = type
  }
}
