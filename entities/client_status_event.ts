import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core'
import { Client } from './client'
import { EClientStatus } from './enum'

@Entity()
export class ClientStatusEvent {
  @PrimaryKey()
  id!: number

  @ManyToOne({ entity: () => Client, inversedBy: (o) => o.statusEvents })
  client!: Client

  @Property({ default: EClientStatus.Offline })
  status!: EClientStatus

  @Property()
  createdAt = new Date()

  constructor(client: Client, status: EClientStatus = EClientStatus.Offline) {
    this.client = client
    this.status = status
  }
}
