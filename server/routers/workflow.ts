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
import { Attachment } from '@/entities/attachment'
import { TWorkflowProgressMessage } from '@/types/task'

const ee = new EventEmitter()

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
        const pool = ComfyPoolInstance.getInstance().pool
        pool.run(async (api) => {
          for (const key in data.input) {
            const inputData = data.input[key] || data.workflow.mapInput?.[key].default
            if (!inputData) {
              continue
            }
            switch (data.workflow.mapInput?.[key].type) {
              case EValueType.Number:
              case EValueType.Seed:
                builder.input(key, Number(inputData))
                break
              case EValueType.String:
                builder.input(key, String(inputData))
                break
              case EValueType.File:
              case EValueType.Image:
                const file = inputData as Attachment
                const fileBlob = await AttachmentService.getInstance().getFileBlob(file.fileName)
                if (!fileBlob) {
                  return subscriber.next({ key: 'failed', detail: 'missing image' })
                }
                const uploadedImg = await api.uploadImage(fileBlob, file.fileName)
                if (!uploadedImg) {
                  subscriber.next({ key: 'failed', detail: 'failed to upload image' })
                  return
                }
                console.log('Uploaded image', uploadedImg)
                builder.input(key, uploadedImg.info.filename)
                break
              default:
                builder.input(key, inputData)
                break
            }
          }
          return new CallWrapper(api, builder)
            .onPending(() => {
              subscriber.next({ key: 'loading' })
            })
            .onProgress((e) => {
              subscriber.next({
                key: 'progress',
                data: { node: Number(e.node), max: Number(e.max), value: Number(e.value) }
              })
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
              console.log('WTF', e)
              subscriber.next({ key: 'failed', detail: (e.cause as any)?.error?.message || e.message })
            })
            .run()
        })
      }
      ee.on('start', handle)
      return () => {
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
    }),
  importWorkflow: adminProcedure.input(z.object({})).mutation(async ({ input, ctx }) => {})
})
