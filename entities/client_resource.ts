import { Collection, Entity, ManyToMany, OneToOne, PrimaryKey, Property, Unique } from '@mikro-orm/core'
import { v4 } from 'uuid'
import { EResourceType } from './enum'
import type { Client } from './client'
import type { Tag } from './tag'
import type { Attachment } from './attachment'

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

  @Property({ type: 'string', nullable: true })
  description?: string

  @OneToOne({ entity: 'Attachment', inversedBy: 'resource', nullable: true, deleteRule: 'set null' })
  image?: Attachment

  @Property({ type: 'timestamp' })
  createdAt = new Date()

  @Property({ type: 'timestamp', onUpdate: () => new Date() })
  updateAt = new Date()

  @ManyToMany('Client', 'resources', { index: true })
  clients = new Collection<Client>(this)

  @ManyToMany('Tag', 'resources', { owner: true })
  tags = new Collection<Tag>(this)

  constructor(name: string, type: EResourceType, displayName?: string) {
    this.name = name
    this.type = type
    this.displayName = displayName
  }
}
