import { Cascade, Collection, Entity, Index, ManyToOne, OneToMany, PrimaryKey, Property } from '@mikro-orm/core'
import type { Client } from './client'
import type { ClientMonitorGpu } from './client_monitor_gpu'

@Entity()
@Index({ properties: ['client', 'createdAt'] })
export class ClientMonitorEvent {
  @PrimaryKey({ type: 'bigint' })
  id!: number

  @ManyToOne({
    entity: 'Client',
    inversedBy: 'monitorEvents',
    deleteRule: 'cascade'
  })
  client!: Client

  @Property({ type: 'float', nullable: true })
  cpuUsage?: number

  @Property({ type: 'double', nullable: true })
  memoryUsage?: number

  @Property({ type: 'double', nullable: true })
  memoryTotal?: number

  @OneToMany('ClientMonitorGpu', 'monitorEvent', { cascade: [Cascade.ALL], orphanRemoval: true })
  gpus = new Collection<ClientMonitorGpu>(this)

  @Property({ type: 'timestamp' })
  createdAt = new Date()

  constructor(node: Client) {
    this.client = node
  }
}
