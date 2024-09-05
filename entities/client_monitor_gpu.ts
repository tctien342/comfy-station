import { Entity, ManyToOne, PrimaryKey, PrimaryKeyProp, Property } from '@mikro-orm/core'
import type { ClientMonitorEvent } from './client_monitor_event'

@Entity({ tableName: 'client_monitor_gpu' })
export class ClientMonitorGpu {
  @ManyToOne('ClientMonitorEvent', 'gpus')
  monitorEvent: ClientMonitorEvent

  @PrimaryKey()
  id!: number

  @Property()
  gpuIdx: number

  @Property({ nullable: true })
  utlization?: number

  @Property({ nullable: true })
  temperature?: number

  @Property()
  memoryUsage: number

  @Property()
  memoryTotal: number

  @Property()
  createdAt = new Date();

  [PrimaryKeyProp]?: ['monitorEvent', 'gpuIdx'] // this is needed for proper type checks in `FilterQuery`

  constructor(event: ClientMonitorEvent, gpuId: number, memoryUsage: number, memoryTotal: number) {
    this.gpuIdx = gpuId
    this.memoryUsage = memoryUsage
    this.memoryTotal = memoryTotal
    this.monitorEvent = event
  }
}
