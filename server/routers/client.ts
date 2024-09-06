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
import CachingService from '@/services/caching'

const cacher = CachingService.getInstance()

export const clientRouter = router({
  list: adminProcedure.query(async ({ ctx }) => {
    return ctx.em.find(Client, {})
  }),
  monitoringClient: adminProcedure.input(z.string()).subscription(async ({ input, ctx }) => {
    return observable<TMonitorEvent>((subscriber) => {
      const off = cacher.on('SYSTEM_MONITOR', input, (ev) => {
        subscriber.next(ev.detail)
      })
      return off
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
      const off = cacher.on('CLIENT_STATUS', input, (ev) => {
        subscriber.next(ev.detail)
      })
      return off
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
    const cacher = CachingService.getInstance()
    const clients = await ctx.em.find(Client, {})

    const getStatues = async () => {
      const data = await Promise.all(clients.map((client) => cacher.get('CLIENT_STATUS', client.id)))
      return {
        online: data.filter((e) => !!e && [EClientStatus.Online, EClientStatus.Executing].includes(e)).length,
        offline: data.filter((e) => !!e && e === EClientStatus.Offline).length,
        error: data.filter((e) => !!e && e === EClientStatus.Error).length
      }
    }

    return observable<Awaited<ReturnType<typeof getStatues>>>((subscriber) => {
      getStatues().then((data) => subscriber.next(data))
      const off = cacher.onCategory('CLIENT_STATUS', async (ev) => {
        getStatues().then((data) => subscriber.next(data))
      })
      return off
    })
  })
})
