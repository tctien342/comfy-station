import Elysia, { NotFoundError, t } from 'elysia'
import { EnsureTokenPlugin } from '../plugins/ensure-token.plugin'
import { EnsureMikroORMPlugin } from '../plugins/ensure-mikro-orm.plugin'
import { Attachment } from '@/entities/attachment'
import AttachmentService from '@/services/attachment'
import { AttachmentSchema, AttachmentURLSchema } from '../schemas/attachment'
import { EAttachmentStatus } from '@/entities/enum'

export const AttachmentPlugin = new Elysia({ prefix: '/attachment', detail: { tags: ['Attachment'] } })
  .use(EnsureMikroORMPlugin)
  .get(
    '/:id',
    async ({ em, params: { id } }) => {
      const attachment = await em.findOne(Attachment, { id })
      if (!attachment) {
        return new NotFoundError('Attachment not found')
      }
      const url = await AttachmentService.getInstance().getAttachmentURL(attachment)
      return JSON.stringify({ attachment, url })
    },
    {
      detail: {
        description: 'Get attachment information by given id',
        responses: {
          200: {
            description: 'Attachment information',
            content: {
              'application/json': {
                schema: t.Object({
                  attachment: AttachmentSchema,
                  url: AttachmentURLSchema
                })
              }
            } as any
          }
        }
      }
    }
  )
  .get(
    '/:id/url',
    async ({ em, params: { id } }) => {
      const attachment = await em.findOne(Attachment, { id })
      if (!attachment) {
        return new NotFoundError('Attachment not found')
      }
      const url = await AttachmentService.getInstance().getAttachmentURL(attachment)
      return JSON.stringify({ url })
    },
    {
      detail: {
        description: 'Get attachment URL by given id',
        responses: {
          200: {
            description: 'Attachment information',
            content: {
              'application/json': {
                schema: AttachmentURLSchema
              }
            } as any
          }
        }
      }
    }
  )
  .post(
    '/upload',
    async ({ body: { files }, em }) => {
      const storageService = AttachmentService.getInstance()
      const uploads = files.map(async (file) => {
        const buffArr = await file.arrayBuffer()
        const buff = Buffer.from(buffArr)
        /**
         * Avoid uploading the same file multiple times
         */
        const fileMd5 = await Attachment.fileMD5(buff)
        const fileExtension = file.name.split('.').pop()
        const newName = `${fileMd5}.${fileExtension}`
        const size = buff.byteLength

        const existingAttachment = await em.findOne(Attachment, { fileName: newName })
        if (existingAttachment) {
          if (existingAttachment.status === EAttachmentStatus.UPLOADED) {
            return existingAttachment
          } else {
            await em.removeAndFlush(existingAttachment)
          }
        }
        const attachment = em.create(Attachment, { fileName: newName, size }, { partial: true })
        await em.persistAndFlush(attachment)
        try {
          const uploaded = await storageService.uploadFile(buff, newName)
          if (!uploaded) {
            throw new Error('Failed to upload file')
          }
          attachment.status = EAttachmentStatus.UPLOADED
          await em.persistAndFlush(attachment)
          return attachment
        } catch (e) {
          attachment.status = EAttachmentStatus.FAILED
          await em.persistAndFlush(attachment)
          return attachment
        }
      })
      return await Promise.all(uploads)
    },
    {
      type: 'multipart/form-data',
      body: t.Object({
        files: t.Files({ description: 'Attachment files' })
      }),
      detail: {
        description: 'Upload attachment',
        requestBody: {
          content: {
            'multipart/form-data': {
              schema: t.Object({
                files: t.Files({ description: 'Attachment files' })
              })
            }
          }
        },
        responses: {
          200: {
            description: 'Attachment uploaded',
            content: {
              'application/json': {
                schema: t.Array(AttachmentSchema)
              }
            }
          } as any
        }
      }
    }
  )
