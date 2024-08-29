import { Entity, ManyToOne, OneToOne, PrimaryKey, Property } from '@mikro-orm/core'
import { ETriggerBy as ETriggerType } from './enum'
import { User } from './user'
import { Token } from './token'
import { JobItem } from './job_item'
import { ClientActionEvent } from './client_action_event'

@Entity({ tableName: 'trigger' })
export class Trigger {
  @PrimaryKey()
  id!: number

  @Property({ index: true })
  type: ETriggerType

  @ManyToOne({ nullable: true, index: true })
  user?: User

  @ManyToOne({ nullable: true, index: true })
  token?: Token

  @ManyToOne({ nullable: true, index: true })
  jobTask?: JobItem

  @OneToOne({ nullable: true, mappedBy: 'trigger' })
  clientActionEvent?: ClientActionEvent

  @Property()
  createdAt = new Date()

  constructor(type: ETriggerType) {
    this.type = type
  }
}
