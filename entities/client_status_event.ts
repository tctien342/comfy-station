import { Entity, Index, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core'
import { Client } from './client'
import { EClientStatus } from './enum'

@Entity({
  tableName: 'client_status_event'
})
@Index({ properties: ['client', 'createdAt'] })
export class ClientStatusEvent {
  @PrimaryKey()
  id!: number

  @ManyToOne('Client', 'statusEvents')
  client!: Client

  @Property({ default: EClientStatus.Offline })
  status!: EClientStatus

  @Property({ nullable: true })
  message?: string

  @Property()
  createdAt = new Date()

  constructor(client: Client, status: EClientStatus = EClientStatus.Offline) {
    this.client = client
    this.status = status
  }
}
