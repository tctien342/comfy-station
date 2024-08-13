import { ComfyApi, ComfyPool } from '@saintno/comfyui-sdk'
import { Logger } from '@saintno/needed-tools'
import { MikroORMInstance } from './mikro-orm'
import { Node } from '@/entities/node'

export class ComfyPoolInstance {
  public pool: ComfyPool
  private logger: Logger

  static getInstance() {
    if (!(global as any).__ComfyPool__) {
      ;(global as any).__ComfyPool__ = new ComfyPoolInstance()
    }
    return (global as any).__ComfyPool__ as ComfyPoolInstance
  }

  private constructor() {
    this.logger = new Logger('ComfyPoolInstance')
    this.pool = new ComfyPool([])
    this.bindEvents()
    this.initialize()
  }

  private async initialize() {
    const orm = await MikroORMInstance.getInstance().getORM()
    const em = orm.em.fork()
    const nodes = await em.find(Node, {})

    nodes.forEach((node) => {
      this.pool.addClient(
        new ComfyApi(node.host, node.uuid, {
          credentials: node.auth
            ? {
                type: node.auth,
                username: node.username ?? '',
                password: node.password ?? ''
              }
            : undefined
        })
      )
    })
  }

  private bindEvents() {
    this.pool
      .on('init', () => this.logger.i('init', 'ComfyPool initialized'))
      .on('added', (ev) => {
        this.logger.i('added', `Add new client ${ev.detail.clientIdx}`, {
          id: ev.detail.client.id
        })
      })
      .on('connected', (ev) => {
        this.logger.i('connected', `Client ${ev.detail.clientIdx} connected`, {
          id: ev.detail.client.id
        })
      })
      .on('execution_error', (error) => {})
  }
}
