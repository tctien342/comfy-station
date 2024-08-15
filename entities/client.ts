import { Collection, Entity, ManyToMany, OneToMany, PrimaryKey, Property } from '@mikro-orm/core'
import { v4 } from 'uuid'
import { ClientMonitorEvent } from './client_monitor_event'
import { ClientStatusEvent } from './client_status_event'
import { EAuthMode } from './enum'
import { ClientExtension } from './client_extension'

@Entity({ tableName: 'client' })
export class Client {
  @PrimaryKey({ type: 'uuid' })
  id = v4()

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

  @Property({ nullable: true })
  createdAt? = new Date()

  @Property({ onUpdate: () => new Date() })
  updateAt? = new Date()

  @OneToMany({
    entity: 'ClientMonitorEvent',
    mappedBy: 'client'
  })
  monitorEvents = new Collection<ClientMonitorEvent>(this)

  @OneToMany({
    entity: 'ClientStatusEvent',
    mappedBy: 'client'
  })
  statusEvents = new Collection<ClientStatusEvent>(this)

  @ManyToMany('ClientExtension', 'clients', { owner: true })
  extensions = new Collection<ClientExtension>(this)

  constructor(host: string) {
    this.host = host
  }
}
