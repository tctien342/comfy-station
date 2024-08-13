import { z } from 'zod'
import { router } from '../trpc'
import { observable } from '@trpc/server/observable'
import { publicProcedure } from '../procedure'
import { ComfyPoolInstance } from '@/services/comfyui'
import { ComfyApi, TMonitorEvent } from '@saintno/comfyui-sdk'
import { Node } from '@/entities/node'

export const helloRouter = router({
  addServer: publicProcedure
    .input(
      z.object({
        host: z.string(),
        username: z.string().optional(),
        password: z.string().optional()
      })
    )
    .mutation(async ({ ctx, input }) => {
      // const { pool } = ComfyPoolInstance.getInstance()
      // pool.addClient(
      //   new ComfyApi(opts.input.host, undefined, {
      //     credentials: {
      //       type: 'basic',
      //       username: opts.input.username,
      //       password: opts.input.password
      //     }
      //   })
      // )
      const found = await ctx.em.findOne(Node, { host: input.host })
      if (found) {
        return false
      }
      const node = new Node(input.host)
      if (input.username && input.password) {
        node.password = input.password
        node.username = input.username
        node.auth = 'basic'
      }
      ctx.em.persist(node).flush()
      return true
    }),
  nodeUltilization: publicProcedure.subscription(() => {
    const { pool } = ComfyPoolInstance.getInstance()
    return observable<TMonitorEvent & { id: string }>((subscriber) => {
      const offFn: {
        client: ComfyApi
        fn: (ev: CustomEvent<TMonitorEvent>) => void
      }[] = []
      pool.clients.forEach((client) => {
        const fn = (ev: CustomEvent<TMonitorEvent>) => {
          subscriber.next({ ...ev.detail, id: client.id })
        }
        offFn.push({
          client,
          fn
        })
        client.on('crystools.monitor', fn)
      })
      return () => {
        offFn.forEach((data) => {
          data.client.off('crystools.monitor', data.fn)
        })
      }
    })
  }),
  hello: publicProcedure
    .input(
      z.object({
        text: z.string()
      })
    )
    .query(async (opts) => {
      const data = await opts.ctx.em.find(Node, {})
      return {
        data,
        greeting: `hello ${opts.input.text}`
      }
    }),
  helloWs: publicProcedure.subscription(() => {
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
  })
})
