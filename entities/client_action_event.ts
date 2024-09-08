import { Entity, ManyToOne, OneToOne, PrimaryKey, Property } from '@mikro-orm/core'
import { EClientAction } from './enum'
import type { Client } from './client'
import type { Trigger } from './trigger'

@Entity()
export class ClientActionEvent {
  @PrimaryKey({ type: 'bigint' })
  id!: number

  @ManyToOne({
    entity: 'Client',
    inversedBy: 'actionEvents',
    deleteRule: 'cascade'
  })
  client: Client

  @Property({ type: 'int', default: EClientAction.UNKNOWN })
  action?: EClientAction = EClientAction.UNKNOWN

  @Property({ nullable: true, type: 'json' })
  data?: object

  @OneToOne({ entity: 'Trigger', type: 'Trigger', inversedBy: 'clientActionEvent', deleteRule: 'cascade' })
  trigger: Trigger

  @Property({ type: 'timestamp' })
  createdAt = new Date()

  constructor(client: Client, trigger: Trigger, action?: EClientAction) {
    this.client = client
    this.action = action
    this.trigger = trigger
  }
}
