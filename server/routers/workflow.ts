import { adminProcedure, privateProcedure } from '../procedure'
import { router } from '../trpc'
import { z } from 'zod'
import { IMapperOutput, Workflow } from '@/entities/workflow'
import { EventEmitter } from 'node:events'
import { observable } from '@trpc/server/observable'
import { ComfyPoolInstance } from '@/services/comfyui'
import { CallWrapper } from '@saintno/comfyui-sdk'
import { cloneDeep, uniqueId } from 'lodash'
import AttachmentService, { EAttachmentType } from '@/services/attachment'
import { EValueType } from '@/entities/enum'

const ee = new EventEmitter()

type TWorkflowProgressMessage =
  | { key: 'init' }
  | { key: 'loading' }
  | { key: 'start' }
  | { key: 'progress'; data: { node: number } }
  | { key: 'preview'; data: { blob: Blob } }
  | { key: 'finished'; data: { output: any } }
  | { key: 'failed' }

export const workflowRouter = router({
  list: privateProcedure
    .input(
      z.object({
        search: z.string().optional(),
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(),
        direction: z.enum(['forward', 'backward'])
      })
    )
    .query(async ({ input, ctx }) => {
      const limit = input.limit ?? 50
      const { cursor, direction } = input

      const data = await ctx.em.findByCursor(
        Workflow,
        {},
        direction === 'forward'
          ? {
              first: limit,
              after: { endCursor: cursor || null }
            }
          : {
              last: limit,
              before: { startCursor: cursor || null }
            }
      )
      let nextCursor: typeof cursor | undefined = undefined
      if (data.items.length > limit) {
        const nextItem = data.items.pop()
        nextCursor = nextItem!.id
      }
      return {
        items: data.items,
        nextCursor
      }
    }),
  testWorkflow: adminProcedure.subscription(async ({ input, ctx }) => {
    return observable<TWorkflowProgressMessage>((subscriber) => {
      const handle = (data: { input: Record<string, any>; workflow: Workflow }) => {
        subscriber.next({ key: 'init' })
        const builder = Workflow.getBuilder(data.workflow)
        for (const key in data.input) {
          switch (data.workflow.mapInput?.[key].type) {
            case EValueType.Number:
            case EValueType.Seed:
              builder.input(key, Number(data.input[key]))
              break
            case EValueType.String:
              builder.input(key, String(data.input[key]))
              break
            default:
              builder.input(key, data.input[key])
              break
          }
        }
        const pool = ComfyPoolInstance.getInstance().pool
        pool.run((api) => {
          return new CallWrapper(api, builder)
            .onPending(() => {
              subscriber.next({ key: 'loading' })
            })
            .onProgress((e) => {
              subscriber.next({ key: 'progress', data: { node: Number(e.node) } })
            })
            .onPreview((e) => {
              subscriber.next({ key: 'preview', data: { blob: e } })
            })
            .onStart(() => {
              subscriber.next({ key: 'start' })
            })
            .onFinished(async (outData) => {
              const attachment = AttachmentService.getInstance()
              const output = await Workflow.parseOutput(api, data.workflow, outData)
              const tmpOutput = cloneDeep(output) as Record<string, any>
              // If key is array of Blob, convert it to base64
              for (const key in tmpOutput) {
                if (Array.isArray(tmpOutput[key])) {
                  tmpOutput[key] = (await Promise.all(
                    tmpOutput[key].map(async (v, idx) => {
                      if (v instanceof Blob) {
                        console.log('Uploading blob', v)
                        const tmpName = `${uniqueId()}_${key}_${idx}.png`
                        const uploaded = await attachment.uploadBlob(v, `${tmpName}`)
                        if (uploaded) {
                          return await attachment.getFileURL(tmpName)
                        }
                      }
                      return v
                    })
                  )) as string[]
                }
              }
              const outputConfig = data.workflow.mapOutput
              const outputData = Object.keys(outputConfig || {}).reduce(
                (acc, val) => {
                  if (tmpOutput[val] && outputConfig?.[val]) {
                    acc[val] = {
                      info: outputConfig[val],
                      data: tmpOutput[val]
                    }
                  }
                  return acc
                },
                {} as Record<
                  string,
                  {
                    info: IMapperOutput
                    data: number | boolean | string | Array<{ type: EAttachmentType; url: string }>
                  }
                >
              )
              subscriber.next({ key: 'finished', data: { output: outputData } })
            })
            .onFailed((e) => {
              console.log(e)
              subscriber.next({ key: 'failed' })
            })
            .run()
        })
      }
      ee.on('start', handle)
      return () => {
        console.log('WTF')
        ee.off('start', handle)
      }
    })
  }),
  startTestWorkflow: adminProcedure
    .input(
      z.object({
        input: z.record(z.string(), z.any()),
        workflow: z.any()
      })
    )
    .mutation(async ({ input, ctx }) => {
      ee.emit('start', input)
      return true
    })
})
