import { z } from 'zod'
import { privateProcedure } from '../procedure'
import { router } from '../trpc'
import { Attachment } from '@/entities/attachment'
import AttachmentService from '@/services/attachment'

export const attachmentRouter = router({
  get: privateProcedure
    .input(
      z.object({
        id: z.string()
      })
    )
    .query(async ({ ctx, input }) => {
      const attachment = await ctx.em.findOne(Attachment, { id: input.id })
      if (!attachment) {
        return null
      }
      return AttachmentService.getInstance().getFileURL(attachment.fileName)
    })
})
