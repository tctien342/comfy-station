import { z } from 'zod'
import { router } from '../trpc'
import { observable } from '@trpc/server/observable'
import { publicProcedure } from '../procedure'

export const helloRouter = router({
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
