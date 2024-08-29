import { Entity, ManyToOne, OneToOne, PrimaryKey, Property } from '@mikro-orm/core'
import { EClientAction } from './enum'
import type { Client } from './client'
import type { Trigger } from './trigger'

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

  @OneToOne('Trigger', { inversedBy: 'clientActionEvent' })
  trigger: Trigger

  @Property()
  createdAt = new Date()

  constructor(client: Client, trigger: Trigger, action?: EClientAction) {
    this.client = client
    this.action = action
    this.trigger = trigger
  }
}
