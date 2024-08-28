import { ArrayType, Collection, Entity, ManyToMany, OneToMany, PrimaryKey, Property } from '@mikro-orm/core'
import { v4 } from 'uuid'
import { ClientMonitorEvent } from './client_monitor_event'
import { ClientStatusEvent } from './client_status_event'
import { EAuthMode, EClientFlags } from './enum'
import { Extension } from './client_extension'
import { ClientActionEvent } from './client_action_event'
import { Resource } from './client_resource'
import { WorkflowTask } from './workflow_task'

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

  @Property({ type: ArrayType, default: [] })
  flags?: EClientFlags[] = []

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
