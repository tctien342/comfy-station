import { Cascade, Collection, Entity, Index, ManyToOne, OneToMany, PrimaryKey, Property } from '@mikro-orm/core'
import { Client } from './client'
import { ClientMonitorGpu } from './client_monitor_gpu'

@Entity({ tableName: 'client_monitor_event' })
@Index({ properties: ['client', 'createdAt'] })
export class ClientMonitorEvent {
  @PrimaryKey()
  id!: number

  @ManyToOne({
    entity: 'Client',
    inversedBy: 'monitorEvents'
  })
  client!: Client

  @Property({ nullable: true })
  cpuUsage?: number

  @Property({ nullable: true })
  memoryUsage?: number

  @Property({ nullable: true })
  memoryTotal?: number

  @OneToMany('ClientMonitorGpu', 'monitorEvent', { cascade: [Cascade.ALL] })
  gpu = new Collection<ClientMonitorGpu>(this)

  @Property()
  createdAt = new Date()

  constructor(node: Client) {
    this.client = node
  }
}
