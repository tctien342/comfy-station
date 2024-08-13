import { MikroORM } from '@mikro-orm/better-sqlite'

import dbConfig from '../mikro-orm.config'
import { Logger } from '@saintno/needed-tools'

export class MikroORMInstance {
  private orm: Promise<MikroORM>
  private logger: Logger

  private constructor() {
    this.logger = new Logger('MikroORMInstance')
    this.orm = MikroORM.init(dbConfig).then((orm) => {
      this.logger.i('init', 'MikroORM initialized')
      return orm
    })
  }

  static getInstance() {
    if (!(global as any).__MikroORM__) {
      ;(global as any).__MikroORM__ = new MikroORMInstance()
    }
    return (global as any).__MikroORM__ as MikroORMInstance
  }

  async getORM() {
    return this.orm
  }
}
