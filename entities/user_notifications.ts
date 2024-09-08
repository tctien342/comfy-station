import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core'
import { ENotificationTarget, ENotificationType } from './enum'

import type { User } from './user'

export interface INotificationData {
  targetType: ENotificationTarget
  targetId: number | string
  value?: number | string // Maybe support for task progress...?
}

@Entity()
export class UserNotification {
  @PrimaryKey({ type: 'bigint' })
  id!: number

  @Property({ type: 'boolean', default: false, index: true })
  read!: boolean

  @ManyToOne({ entity: 'User', inversedBy: 'notifications', index: true, deleteRule: 'cascade' })
  user: User

  @Property({ type: 'string' })
  title: string

  @Property({ type: 'int', default: 1 })
  priority!: number

  @Property({ type: 'string', nullable: true })
  description?: string // Supports markdown

  @Property({ type: 'varchar', default: ENotificationType.Info, index: true })
  type!: ENotificationType

  @Property({ type: 'json', nullable: true })
  target?: INotificationData // More info about the target

  @Property({ type: 'timestamp', onUpdate: () => new Date() })
  updateAt = new Date()

  @Property({ type: 'timestamp' })
  createdAt = new Date()

  constructor(title: string, user: User) {
    this.title = title
    this.user = user
  }
}
