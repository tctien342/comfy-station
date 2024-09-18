import { ComfyApi, ComfyPool, TMonitorEvent } from '@saintno/comfyui-sdk'
import { Logger } from '@saintno/needed-tools'
import { MikroORMInstance } from './mikro-orm'
import { Client } from '@/entities/client'
import { EAuthMode, EClientStatus } from '@/entities/enum'
import { ClientStatusEvent } from '@/entities/client_status_event'
import { ClientMonitorEvent } from '@/entities/client_monitor_event'
import { ClientMonitorGpu } from '@/entities/client_monitor_gpu'
import CachingService from './caching'

import { throttle } from 'lodash'

const MONITOR_INTERVAL = 5000
const cacher = CachingService.getInstance()

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
    const clients = await em.find(Client, {}, { populate: ['password'] })

    for (const clientConf of clients) {
      const client = new ComfyApi(clientConf.host, clientConf.id, {
        credentials:
          clientConf.auth === EAuthMode.Basic
            ? {
                type: 'basic',
                username: clientConf.username ?? '',
                password: clientConf.password ?? ''
              }
            : undefined
      })
      this.pool.addClient(client)
    }
  }

  private addClientMonitoring = throttle(async (clientId: string, data: TMonitorEvent) => {
    const em = await MikroORMInstance.getInstance().getEM()
    const client = await em.findOne(Client, { id: clientId })

    if (client) {
      const gpus: ClientMonitorGpu[] = []
      const monitorEv = new ClientMonitorEvent(client)
      monitorEv.cpuUsage = data.cpu_utilization
      monitorEv.memoryUsage = data.ram_used / 1024
      monitorEv.memoryTotal = Math.round((data.ram_used / 1024 / data.ram_used_percent) * 100)
      data.gpus.forEach((gpu, idx) => {
        const gpuEv = new ClientMonitorGpu(monitorEv, idx, Math.round(gpu.vram_used / 1024), Math.round(gpu.vram_total))
        gpuEv.temperature = gpu.gpu_temperature
        gpuEv.utlization = gpu.gpu_utilization
        gpus.push(gpuEv)
      })
      monitorEv.gpus.add(gpus)
      client.monitorEvents.add(monitorEv)
      await em.persist(monitorEv).flush()
    }
  }, MONITOR_INTERVAL)

  async setClientStatus(clientId: string, status: EClientStatus, msg?: string) {
    const em = await MikroORMInstance.getInstance().getEM()
    const client = await em.findOne(Client, { id: clientId })
    if (client) {
      const statusEvent = new ClientStatusEvent(client, status)
      if (msg) {
        statusEvent.message = msg
      }
      client.statusEvents.add(statusEvent)
      await cacher.set('CLIENT_STATUS', client.id, status)
      await em.persist(statusEvent).flush()
    }
  }

  private bindEvents() {
    this.pool
      .on('init', async () => {
        this.logger.i('init', 'ComfyPool initialized')
        this.setClientStatus('all', EClientStatus.Offline)
      })
      .on('added', (ev) => {
        this.logger.i('added', `Add new client ${ev.detail.clientIdx}`, {
          id: ev.detail.client.id
        })
      })
      .on('connection_error', async (ev) => {
        this.logger.i('connection_error', 'Connection error', ev.detail.client.id)
        this.setClientStatus(ev.detail.client.id, EClientStatus.Error, 'Connection error')
      })
      .on('auth_error', async (ev) => {
        this.logger.i('auth_error', 'Authentication error', ev.detail.client.id)
        this.setClientStatus(ev.detail.client.id, EClientStatus.Error, 'Authentication error')
      })
      .on('have_job', async (ev) => {
        this.logger.i('have_job', 'Have job', ev.detail.client.id)
        this.setClientStatus(ev.detail.client.id, EClientStatus.Executing)
      })
      .on('idle', async (ev) => {
        this.logger.i('idle', 'Idle', ev.detail.client.id)
        this.setClientStatus(ev.detail.client.id, EClientStatus.Online)
      })
      .on('connected', async (ev) => {
        this.logger.i('connected', `Client ${ev.detail.clientIdx} connected`, {
          id: ev.detail.client.id
        })
        this.setClientStatus(ev.detail.client.id, EClientStatus.Online)
      })
      .on('reconnected', async (ev) => {
        this.logger.i('reconnected', `Client ${ev.detail.clientIdx} reconnected`, {
          id: ev.detail.client.id
        })
        this.setClientStatus(ev.detail.client.id, EClientStatus.Online, 'Reconnected')
      })
      .on('disconnected', async (ev) => {
        this.logger.i('disconnected', `Client ${ev.detail.clientIdx} disconnected`, {
          id: ev.detail.client.id
        })
        this.setClientStatus(ev.detail.client.id, EClientStatus.Offline)
      })
      .on('executing', async (ev) => {
        this.logger.i('executing', `Client ${ev.detail.clientIdx} executing`, {
          id: ev.detail.client.id
        })
        this.setClientStatus(ev.detail.client.id, EClientStatus.Executing)
      })
      .on('executed', async (ev) => {
        this.logger.i('executed', `Client ${ev.detail.clientIdx} executed`, {
          id: ev.detail.client.id
        })
        this.setClientStatus(ev.detail.client.id, EClientStatus.Online)
      })
      .on('system_monitor', async (ev) => {
        const data = ev.detail.data
        const clientId = ev.detail.client.id
        await cacher.set('SYSTEM_MONITOR', clientId, data)
        this.addClientMonitoring(clientId, data)
      })
      .on('execution_error', (error) => {})
  }
}
