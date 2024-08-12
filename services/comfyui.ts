import { ComfyPool } from '@saintno/comfyui-sdk'
import { Logger } from '@saintno/needed-tools'

export class ComfyPoolInstance {
  static instance: ComfyPoolInstance
  public pool: ComfyPool
  private logger: Logger

  static getInstance() {
    if (!ComfyPoolInstance.instance) {
      ComfyPoolInstance.instance = new ComfyPoolInstance()
    }
    return ComfyPoolInstance.instance
  }

  private constructor() {
    this.logger = new Logger('ComfyPoolInstance')
    this.pool = new ComfyPool([])
    this.bindEvents()
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
