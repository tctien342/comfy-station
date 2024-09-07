import { Collection, Entity, PrimaryKey, Property, ManyToMany } from '@mikro-orm/core'
import { v4 } from 'uuid'
import type { Resource } from './client_resource'
import type { Extension } from './client_extension'

@Entity()
export class Tag {
  @PrimaryKey({ type: 'string' })
  id = v4()

  @Property({ type: 'string', unique: true })
  name: string

  @Property({ type: 'timestamp' })
  createdAt = new Date()

  @ManyToMany('Resource', 'tags')
  resources = new Collection<Resource>(this)

  @ManyToMany('Extension', 'tags')
  extensions = new Collection<Extension>(this)

  constructor(name: string) {
    this.name = name
  }
}
