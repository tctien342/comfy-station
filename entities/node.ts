import { Entity, PrimaryKey, Property } from '@mikro-orm/core'
import { v4 } from 'uuid'

@Entity()
export class Node {
  @PrimaryKey({ type: 'uuid' })
  uuid = v4()

  @Property({ unique: true })
  host: string

  @Property({ nullable: true })
  auth?: 'basic' | ''

  @Property({ nullable: true })
  username?: string

  @Property({ nullable: true, lazy: true })
  password?: string

  @Property({ nullable: true })
  status?: 'online' | 'executing' | 'offline' | 'error' | 'unknown' = 'offline'

  @Property({ nullable: true })
  statusMsg?: string

  @Property({ nullable: true })
  lastJob?: Date

  @Property()
  createdAt? = new Date()

  @Property({ onUpdate: () => new Date() })
  updateAt? = new Date()

  constructor(host: string) {
    this.host = host
  }
}
