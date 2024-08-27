import { Collection, Entity, Index, ManyToMany, PrimaryKey, Property, Unique } from '@mikro-orm/core'
import { v4 } from 'uuid'
import { Client } from './client'
import { EResourceType } from './enum'

@Entity({ tableName: 'client_resource' })
@Unique({ properties: ['name', 'type'] })
export class Resource {
  @PrimaryKey({ type: 'uuid' })
  id = v4()

  @Property()
  name: string

  @Property()
  @Index()
  type: EResourceType

  @Property({ nullable: true })
  displayName?: string

  @Property()
  createdAt = new Date()

  @Property({ onUpdate: () => new Date() })
  updateAt = new Date()

  @ManyToMany('Client', 'resources')
  clients = new Collection<Client>(this)

  constructor(name: string, type: EResourceType, displayName?: string) {
    this.name = name
    this.type = type
    this.displayName = displayName
  }
}
