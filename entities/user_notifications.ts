import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core'
import { ENotificationTarget, ENotificationType } from './enum'

import type { User } from './user'

export interface INotificationData {
  targetType: ENotificationTarget
  targetId: number | string
  value?: number | string // Maybe support for task progress...?
}

@Entity({
  tableName: 'user_notification'
})
export class UserNotification {
  @PrimaryKey()
  id!: number

  @Property({ default: false, index: true })
  read!: boolean

  @ManyToOne({ entity: 'User', inversedBy: 'notifications', index: true })
  user: User

  @Property()
  title: string

  @Property({ default: 1 })
  priority!: number

  @Property({ nullable: true })
  description?: string // Supports markdown

  @Property({ default: ENotificationType.Info, index: true })
  type!: ENotificationType

  @Property({ type: 'json', nullable: true })
  target?: INotificationData // More info about the target

  @Property({ onUpdate: () => new Date() })
  updateAt = new Date()

  @Property()
  createdAt = new Date()

  constructor(title: string, user: User) {
    this.title = title
    this.user = user
  }
}
