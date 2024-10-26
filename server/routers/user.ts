import { z } from 'zod'
import { adminProcedure } from '../procedure'
import { router } from '../trpc'
import { User } from '@/entities/user'
import { EUserRole } from '@/entities/enum'
import { Attachment } from '@/entities/attachment'

export const userRouter = router({
  list: adminProcedure.query(async ({ ctx }) => {
    return ctx.em.find(User, {})
  }),
  adminUpdate: adminProcedure
    .input(
      z.object({
        id: z.string(),
        avatarId: z.string().optional(),
        role: z.nativeEnum(EUserRole).optional(),
        balance: z.number().optional(),
        weightOffset: z.number().optional(),
        password: z.string().optional()
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.em.findOneOrFail(User, input.id)
      if (input.avatarId) {
        const avatar = await ctx.em.findOneOrFail(Attachment, input.avatarId)
        user.avatar = avatar
      }
      if (input.role) user.role = input.role
      if (input.balance) user.balance = input.balance
      if (input.weightOffset) user.weightOffset = input.weightOffset
      if (input.password) user.password = User.hashPassword(input.password)
      await ctx.em.persistAndFlush(user)
      return true
    })
})
