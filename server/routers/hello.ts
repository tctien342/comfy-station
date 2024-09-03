import { z } from 'zod'
import { router } from '../trpc'
import { observable } from '@trpc/server/observable'
import { privateProcedure } from '../procedure'
import { ComfyPoolInstance } from '@/services/comfyui'
import { ComfyApi, SystemStatsResponse, TMonitorEvent } from '@saintno/comfyui-sdk'
import { Client } from '@/entities/client'
import { EAuthMode } from '@/entities/enum'

export const helloRouter = router({
  addServer: privateProcedure
    .input(
      z.object({
        host: z.string(),
        username: z.string().optional(),
        password: z.string().optional()
      })
    )
    .mutation(async ({ ctx, input }) => {
      const found = await ctx.em.findOne(Client, { host: input.host })
      if (found) {
        return false
      }
      try {
        const node = ctx.em.create(Client, { host: input.host, auth: EAuthMode.None })
        if (input.username && input.password) {
          node.password = input.password
          node.username = input.username
          node.auth = EAuthMode.Basic
        }
        await ctx.em.persist(node).flush()
        ComfyPoolInstance.getInstance().pool.addClient(
          new ComfyApi(input.host, node.id, {
            credentials: {
              type: 'basic',
              username: input.username ?? '',
              password: input.password ?? ''
            }
          })
        )
        return true
      } catch (e) {
        console.log(e)
        return false
      }
    }),
  nodeUltilization: privateProcedure.subscription(({ ctx }) => {
    const em = ctx.em
    const { pool } = ComfyPoolInstance.getInstance()
    return observable<
      { uuid: string; clientIdx: number; info: Node | null } & (
        | {
            type: 'websocket'
            data: TMonitorEvent
          }
        | {
            type: 'polling'
            data: SystemStatsResponse
          }
      )
    >((subscriber) => {
      const fn = async (
        ev: CustomEvent<
          | {
              clientIdx: number
              type: 'websocket'
              data: TMonitorEvent
            }
          | {
              clientIdx: number
              type: 'polling'
              data: SystemStatsResponse
            }
        >
      ) => {
        // const info = await em.findOne(Node, { uuid: pool.clients[ev.detail.clientIdx].id }, { cache: 0 })
        // const client = pool.clients[ev.detail.clientIdx]
        // subscriber.next({ ...ev.detail, info, uuid: client.id })
      }
      pool.on('system_monitor', fn)
      return () => {
        pool.off('system_monitor', fn)
      }
    })
  }),
  nodeStatus: privateProcedure.subscription(({ ctx }) => {
    const { pool } = ComfyPoolInstance.getInstance()
    // return observable<{ uuid: string; status: Node['status'] }>((subscriber) => {
    //   const idleFn = async (
    //     ev: CustomEvent<{
    //       client: ComfyApi
    //     }>
    //   ) => {
    //     subscriber.next({
    //       uuid: ev.detail.client.id,
    //       status: 'online'
    //     })
    //   }
    //   const execFn = async (
    //     ev: CustomEvent<{
    //       client: ComfyApi
    //     }>
    //   ) => {
    //     subscriber.next({
    //       uuid: ev.detail.client.id,
    //       status: 'executing'
    //     })
    //   }
    //   pool.on('idle', idleFn)
    //   pool.on('have_job', execFn)
    //   return () => {
    //     pool.off('idle', idleFn)
    //     pool.off('have_job', execFn)
    //   }
    // })
  }),
  hello: privateProcedure
    .input(
      z.object({
        text: z.string()
      })
    )
    .query(async (opts) => {
      const data = await opts.ctx.em.find(Client, {})
      return {
        data,
        greeting: `hello ${opts.input.text}`
      }
    }),
  helloWs: privateProcedure.subscription(() => {
    return observable<string>((subscriber) => {
      let i = 0
      const interval = setInterval(() => {
        i++
        subscriber.next(`hello ${i}`)
      }, 1000)
      return () => {
        clearInterval(interval)
      }
    })
  }),
  list: privateProcedure.query(async ({ ctx }) => {
    return ctx.em.find(Node, {})
  })
})
