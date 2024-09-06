import { ArrayType, Collection, Entity, ManyToMany, OneToMany, PrimaryKey, Property } from '@mikro-orm/core'
import { v4 } from 'uuid'
import type { ClientMonitorEvent } from './client_monitor_event'
import type { ClientStatusEvent } from './client_status_event'
import { EAuthMode, EClientFlags } from './enum'
import type { Extension } from './client_extension'
import type { ClientActionEvent } from './client_action_event'
import type { Resource } from './client_resource'
import type { WorkflowTask } from './workflow_task'

@Entity()
export class Client {
  @PrimaryKey({ type: 'string' })
  id = v4()

  @Property({ type: 'string', nullable: true })
  name?: string

  @Property({ type: 'string', unique: true })
  host: string

  @Property({ type: 'varchar', default: EAuthMode.None })
  auth!: EAuthMode

  @Property({ type: ArrayType, default: [] })
  flags?: EClientFlags[] = []

  @Property({ type: 'string', nullable: true })
  username?: string

  @Property({ type: 'string', nullable: true, lazy: true })
  password?: string

  @Property({ type: 'timestamp', nullable: true })
  createdAt? = new Date()

  @Property({ type: 'timestamp', onUpdate: () => new Date() })
  updateAt? = new Date()

  @OneToMany({
    entity: 'ClientMonitorEvent',
    mappedBy: 'client'
  })
  monitorEvents = new Collection<ClientMonitorEvent>(this)

  @OneToMany({
    entity: 'WorkflowTask',
    mappedBy: 'client'
  })
  tasks = new Collection<WorkflowTask>(this)

  @OneToMany({
    entity: 'ClientStatusEvent',
    mappedBy: 'client'
  })
  statusEvents = new Collection<ClientStatusEvent>(this)

  @OneToMany({
    entity: 'ClientActionEvent',
    mappedBy: 'client'
  })
  actionEvents = new Collection<ClientActionEvent>(this)

  @ManyToMany('Extension', 'clients', { owner: true })
  extensions = new Collection<Extension>(this)

  @ManyToMany('Resource', 'clients', { owner: true })
  resources = new Collection<Resource>(this)

  constructor(host: string) {
    this.host = host
  }
}
