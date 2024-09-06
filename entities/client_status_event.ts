import { Entity, Index, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core'
import type { Client } from './client'
import { EClientStatus } from './enum'

@Entity()
@Index({ properties: ['client', 'createdAt'] })
export class ClientStatusEvent {
  @PrimaryKey({ type: 'bigint' })
  id!: number

  @ManyToOne('Client', 'statusEvents')
  client!: Client

  @Property({ type: 'varchar', default: EClientStatus.Offline })
  status!: EClientStatus

  @Property({ type: 'string', nullable: true })
  message?: string

  @Property({ type: 'timestamp' })
  createdAt = new Date()

  constructor(client: Client, status: EClientStatus = EClientStatus.Offline) {
    this.client = client
    this.status = status
  }
}
