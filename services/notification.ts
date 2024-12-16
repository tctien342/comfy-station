import { Logger } from '@saintno/needed-tools'
import CachingService from './caching'
import { MikroORMInstance } from './mikro-orm'
import { WorkflowTask } from '@/entities/workflow_task'
import { User } from '@/entities/user'
import { UserNotification } from '@/entities/user_notifications'
import { ENotificationTarget, ETaskStatus } from '@/entities/enum'

export class NotificationManagement {
  private static instance: NotificationManagement
  private caching: CachingService
  private orm: MikroORMInstance
  private logger: Logger

  private constructor() {
    this.logger = new Logger('NotificationManagement')
    this.caching = CachingService.getInstance()
    this.orm = MikroORMInstance.getInstance()
  }

  public static getInstance(): NotificationManagement {
    if (!NotificationManagement.instance) {
      NotificationManagement.instance = new NotificationManagement()
    }
    return NotificationManagement.instance
  }

  public handleTaskStatus = async (task: WorkflowTask, user?: User) => {
    if (!user) return
    const em = await this.orm.getEM()
    const isSub = !!task.parent
    const userRes = em.getRepository(User)
    const isParent = task.status === ETaskStatus.Parent
    const notiTask = isSub ? task.parent : task

    if (!notiTask) return
    const noti = await em.findOne(UserNotification, { user, target: { targetId: notiTask.id } })

    if (noti) {
      if (isParent) {
      } else {
        if (noti.target) noti.target.value = 100
      }
    } else {
      await userRes.makeNotify(user, {
        title: 'Task pending',
        target: {
          targetId: notiTask.id,
          targetType: ENotificationTarget.WorkflowTask,
          value: 0
        }
      })
    }
  }
}
