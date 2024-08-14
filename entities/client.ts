import { Collection, Entity, OneToMany, PrimaryKey, Property } from '@mikro-orm/core'
import { v4 } from 'uuid'
import { ClientMonitorEvent } from './client_monitor_event'
import { ClientStatusEvent } from './client_status_event'
import { EAuthMode } from './enum'

@Entity()
export class Client {
  @PrimaryKey({ type: 'uuid' })
  uuid = v4()

  @Property({ nullable: true })
  name?: string

  @Property({ unique: true })
  host: string

  @Property({ default: EAuthMode.None })
  auth!: EAuthMode

  @Property({ nullable: true })
  username?: string

  @Property({ nullable: true, lazy: true })
  password?: string

  @Property()
  createdAt = new Date()

  @Property({ onUpdate: () => new Date() })
  updateAt = new Date()

  @OneToMany({
    entity: () => ClientMonitorEvent,
    mappedBy: (o) => o.client
  })
  monitorEvents = new Collection<ClientMonitorEvent>(this)

  @OneToMany({
    entity: () => ClientStatusEvent,
    mappedBy: (o) => o.client
  })
  statusEvents = new Collection<ClientStatusEvent>(this)

  constructor(host: string) {
    this.host = host
  }
}
