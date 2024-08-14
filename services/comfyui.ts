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
    const em = await MikroORMInstance.getInstance().getEM()
    const nodes = await em.find(Node, {}, { populate: ['password'] })

    nodes.forEach((node) => {
      const client = new ComfyApi(node.host, node.uuid, {
        credentials: node.auth
          ? {
              type: node.auth,
              username: node.username ?? '',
              password: node.password ?? ''
            }
          : undefined
      })
      this.pool.addClient(client)
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
      .on('have_job', async (ev) => {
        const em = await MikroORMInstance.getInstance().getEM()
        const node = await em.findOne(Node, { uuid: ev.detail.client.id })
        if (node) {
          node.status = 'executing'
          node.statusMsg = ''
          await em.flush()
        }
      })
      .on('idle', async (ev) => {
        const em = await MikroORMInstance.getInstance().getEM()
        const node = await em.findOne(Node, { uuid: ev.detail.client.id })
        if (node) {
          node.status = 'online'
          node.statusMsg = ''
          await em.flush()
        }
      })
      .on('connected', async (ev) => {
        this.logger.i('connected', `Client ${ev.detail.clientIdx} connected`, {
          id: ev.detail.client.id
        })
        const em = await MikroORMInstance.getInstance().getEM()
        const node = await em.findOne(Node, { uuid: ev.detail.client.id })
        if (node) {
          node.status = 'online'
          node.statusMsg = ''
          await em.flush()
        }
      })
      .on('executing', async (ev) => {
        this.logger.i('executing', `Client ${ev.detail.clientIdx} executing`, {
          id: ev.detail.client.id
        })
        const em = await MikroORMInstance.getInstance().getEM()
        const node = await em.findOne(Node, { uuid: ev.detail.client.id })
        if (node) {
          node.status = 'executing'
          node.statusMsg = ''
          await em.flush()
        }
      })
      .on('executed', async (ev) => {
        this.logger.i('executed', `Client ${ev.detail.clientIdx} executed`, {
          id: ev.detail.client.id
        })
        const em = await MikroORMInstance.getInstance().getEM()
        const node = await em.findOne(Node, { uuid: ev.detail.client.id })
        if (node) {
          node.lastJob = new Date()
          await em.flush()
        }
      })
      .on('auth_error', async (ev) => {
        const em = await MikroORMInstance.getInstance().getEM()
        const node = await em.findOne(Node, { uuid: ev.detail.client.id })

        if (node) {
          node.status = 'error'
          node.statusMsg = 'Authentication error'
          await em.flush()
        }
      })
      .on('execution_error', (error) => {})
  }
}
