import { z } from 'zod'
import { adminProcedure } from '../procedure'
import { router } from '../trpc'
import { Client } from '@/entities/client'
import { ComfyPoolInstance } from '@/services/comfyui'
import { observable } from '@trpc/server/observable'
import { ComfyApi, TMonitorEvent } from '@saintno/comfyui-sdk'
import { EClientAction, EClientStatus, ETriggerBy } from '@/entities/enum'
import { ClientStatusEvent } from '@/entities/client_status_event'
import { ClientActionEvent } from '@/entities/client_action_event'
import { Trigger } from '@/entities/trigger'

const TIME_PER_TICK = 2000

export const clientRouter = router({
  list: adminProcedure.query(async ({ ctx }) => {
    return ctx.em.find(Client, {})
  }),
  monitoringClient: adminProcedure.input(z.string()).subscription(async ({ input, ctx }) => {
    let now = Date.now()
    const { pool } = ComfyPoolInstance.getInstance()
    return observable<TMonitorEvent>((subscriber) => {
      const fn = (ev: CustomEvent<{ client: ComfyApi; clientIdx: number; data: TMonitorEvent }>) => {
        const client = ev.detail.client
        if (client.id === input) {
          if (Date.now() - now > TIME_PER_TICK) {
            subscriber.next(ev.detail.data)
            now = Date.now()
          }
        }
      }
      pool.on('system_monitor', fn)
      return () => {
        pool.off('system_monitor', fn)
      }
    })
  }),
  clientStatus: adminProcedure.input(z.string()).subscription(async ({ input, ctx }) => {
    const latestEvent = await ctx.em.findOne(
      ClientStatusEvent,
      {
        client: {
          id: input
        }
      },
      { populate: ['client'], orderBy: { createdAt: 'DESC' } }
    )
    if (!latestEvent) {
      throw new Error('Client not found')
    }
    return observable<EClientStatus>((subscriber) => {
      subscriber.next(latestEvent.status)
      const pool = ComfyPoolInstance.getInstance().pool
      const executingFn = (ev: CustomEvent<{ client: ComfyApi }>) =>
        ev.detail.client.id === input && subscriber.next(EClientStatus.Executing)
      const onlineFn = (ev: CustomEvent<{ client: ComfyApi }>) =>
        ev.detail.client.id === input && subscriber.next(EClientStatus.Online)
      const offlineFn = (ev: CustomEvent<{ client: ComfyApi }>) =>
        ev.detail.client.id === input && subscriber.next(EClientStatus.Offline)
      const errorFn = (ev: CustomEvent<{ client: ComfyApi }>) =>
        ev.detail.client.id === input && subscriber.next(EClientStatus.Error)

      pool.on('have_job', executingFn)
      pool.on('executing', executingFn)
      pool.on('idle', onlineFn)
      pool.on('connected', errorFn)
      pool.on('reconnected', onlineFn)
      pool.on('disconnected', offlineFn)
      pool.on('auth_error', errorFn)
      return () => {
        pool.off('have_job', executingFn)
        pool.off('executing', executingFn)
        pool.off('idle', onlineFn)
        pool.off('connected', errorFn)
        pool.off('auth_error', errorFn)
        pool.off('disconnected', offlineFn)
        pool.off('reconnected', onlineFn)
      }
    })
  }),
  control: adminProcedure
    .input(
      z.object({
        clientId: z.string(),
        mode: z.enum(['FREE_VRAM', 'REBOOT', 'INTERRUPT'])
      })
    )
    .mutation(async ({ input, ctx }) => {
      const pool = ComfyPoolInstance.getInstance().pool
      const client = await ctx.em.findOne(Client, { id: input.clientId })
      if (!ctx.session?.user) {
        throw new Error('User not found in session')
      }
      if (!client) {
        throw new Error('Client not found in db')
      }
      const trigger = ctx.em.create(Trigger, {
        type: ETriggerBy.User,
        user: ctx.session.user,
        createdAt: new Date()
      })
      const action = ctx.em.create(ClientActionEvent, {
        client,
        trigger,
        createdAt: new Date()
      })

      const clientCtl = pool.pickById(input.clientId)
      if (!clientCtl) {
        throw new Error('Client not found')
      }
      try {
        switch (input.mode) {
          case 'FREE_VRAM':
            action.action = EClientAction.FREE_MEMORY
            await clientCtl.freeMemory(true, true)
            break
          case 'REBOOT':
            action.action = EClientAction.RESTART
            if (!clientCtl.ext.manager.isSupported) {
              throw new Error('Client not supported')
            }
            await clientCtl.ext.manager.rebootInstance()
            break
          case 'INTERRUPT':
            action.action = EClientAction.INTERRUPT
            await clientCtl.interrupt()
            break
        }
        await ctx.em.persistAndFlush(action)
        return true
      } catch (e) {
        console.error(e)
        return false
      }
    }),
  clientOverviewStat: adminProcedure.subscription(async ({ ctx }) => {
    const pool = ComfyPoolInstance.getInstance().pool
    const clients = await ctx.em.find(Client, {})
    const crrStatus = (id: string) => {
      return ctx.em.findOne(
        ClientStatusEvent,
        {
          client: {
            id
          }
        },
        { populate: ['client'], orderBy: { createdAt: 'DESC' } }
      )
    }
    const getStatues = async () => {
      const data = await Promise.all(clients.map((client) => crrStatus(client.id)))
      return {
        online: data.filter((e) => !!e && [EClientStatus.Online, EClientStatus.Executing].includes(e.status)).length,
        offline: data.filter((e) => !!e && e.status === EClientStatus.Offline).length,
        error: data.filter((e) => !!e && e.status === EClientStatus.Error).length
      }
    }

    return observable<Awaited<ReturnType<typeof getStatues>>>((subscriber) => {
      const fn = async () => {
        const data = await getStatues()
        subscriber.next(data)
      }
      fn()
      pool.on('connected', fn)
      pool.on('reconnected', fn)
      pool.on('disconnected', fn)
      pool.on('auth_error', fn)
      return () => {
        pool.off('connected', fn)
        pool.off('auth_error', fn)
        pool.off('disconnected', fn)
        pool.off('reconnected', fn)
      }
    })
  })
})
