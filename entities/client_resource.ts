import { Collection, Entity, Index, ManyToMany, PrimaryKey, Property, Unique } from '@mikro-orm/core'
import { v4 } from 'uuid'
import type { Client } from './client'
import { EResourceType } from './enum'

@Entity()
@Unique({ properties: ['name', 'type'] })
export class Resource {
  @PrimaryKey({ type: 'string' })
  id = v4()

  @Property({ type: 'string' })
  name: string

  @Property({ type: 'varchar', index: true })
  type: EResourceType

  @Property({ type: 'string', nullable: true })
  displayName?: string

  @Property({ type: 'timestamp' })
  createdAt = new Date()

  @Property({ type: 'timestamp', onUpdate: () => new Date() })
  updateAt = new Date()

  @ManyToMany('Client', 'resources', { index: true })
  clients = new Collection<Client>(this)

  constructor(name: string, type: EResourceType, displayName?: string) {
    this.name = name
    this.type = type
    this.displayName = displayName
  }
}
