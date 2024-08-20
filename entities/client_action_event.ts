import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core'
import { EClientAction, ETriggerBy } from './enum'
import { Client } from './client'
import { User } from './user'
import { Token } from './token'
import { JobItem } from './job_item'

@Entity({ tableName: 'client_action_event' })
export class ClientActionEvent {
  @PrimaryKey()
  id!: number

  @ManyToOne({
    entity: 'Client',
    inversedBy: 'actionEvents'
  })
  client: Client

  @Property({ default: EClientAction.UNKNOWN })
  action?: EClientAction = EClientAction.UNKNOWN

  @Property({ nullable: true, type: 'json' })
  data?: object

  @Property()
  triggerBy: ETriggerBy

  @ManyToOne({ nullable: true })
  byUser?: User

  @ManyToOne({ nullable: true })
  byToken?: Token

  @ManyToOne({ nullable: true })
  byJobTask?: JobItem

  @Property()
  createdAt = new Date()

  constructor(client: Client, triggerBy: ETriggerBy, action?: EClientAction) {
    this.client = client
    this.action = action
    this.triggerBy = triggerBy
  }
}
