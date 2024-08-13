import { Entity, PrimaryKey, Property } from '@mikro-orm/core'
import { v4 } from 'uuid'

@Entity()
export class Node {
  @PrimaryKey({ type: 'uuid' })
  uuid = v4()

  @Property({ unique: true })
  host: string

  @Property()
  auth?: 'basic' | ''

  @Property()
  username?: string

  @Property()
  password?: string

  constructor(host: string) {
    this.host = host
  }
}
