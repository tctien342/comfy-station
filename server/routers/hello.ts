import { z } from 'zod'
import { router } from '../trpc'
import { observable } from '@trpc/server/observable'
import { publicProcedure } from '../procedure'
import { ComfyPoolInstance } from '@/services/comfyui'
import { ComfyApi, TMonitorEvent } from '@saintno/comfyui-sdk'

export const helloRouter = router({
  addServer: publicProcedure
    .input(
      z.object({
        host: z.string(),
        username: z.string(),
        password: z.string()
      })
    )
    .mutation((opts) => {
      const { pool } = ComfyPoolInstance.getInstance()
      pool.addClient(
        new ComfyApi(opts.input.host, undefined, {
          credentials: {
            type: 'basic',
            username: opts.input.username,
            password: opts.input.password
          }
        })
      )
      return true
    }),
  nodeUltilization: publicProcedure.subscription(() => {
    const { pool } = ComfyPoolInstance.getInstance()
    return observable<TMonitorEvent>((subscriber) => {
      const fn = (ev: CustomEvent<TMonitorEvent>) => {
        subscriber.next(ev.detail)
      }
      pool.clients.forEach((client) => {
        client.on('crystools.monitor', fn)
      })
      return () => {
        pool.clients.forEach((client) => {
          client.off('crystools.monitor', fn)
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
    .query((opts) => {
      return {
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
