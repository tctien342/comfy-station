import { Token } from '@/entities/token'
import { adminProcedure, privateProcedure } from '../procedure'
import { router } from '../trpc'
import { TokenShared } from '@/entities/token_shared'
import { ETokenType, EUserRole } from '@/entities/enum'
import { z } from 'zod'
import { Workflow } from '@/entities/workflow'
import { TokenPermission } from '@/entities/token_permission'
import { User } from '@/entities/user'

export const tokenRouter = router({
  list: privateProcedure.query(async ({ ctx }) => {
    if (ctx.session.user?.role === EUserRole.Admin) {
      return await ctx.em.find(Token, {}, { populate: ['sharedUsers'] })
    }
    const ownedTokens = await ctx.em.find(
      Token,
      { createdBy: ctx.session.user },
      { populate: ['sharedUsers', 'createdBy'] }
    )
    const sharedTokens = await ctx.em.find(
      Token,
      {
        sharedUsers: { user: ctx.session.user }
      },
      { populate: ['sharedUsers', 'createdBy'] }
    )
    const tokens = [...ownedTokens, ...sharedTokens]
    return tokens
  }),
  listByWorkflow: privateProcedure
    .input(
      z.object({
        workflowId: z.string()
      })
    )
    .query(async ({ ctx, input }) => {
      const workflow = await ctx.em.findOneOrFail(Workflow, { id: input.workflowId })

      // Find tokens created by user
      const ownedTokens = await ctx.em.find(
        Token,
        {
          grantedWorkflows: { workflow },
          createdBy: ctx.session.user
        },
        { populate: ['sharedUsers', 'createdBy'] }
      )

      // Find tokens shared with user
      const sharedTokens = await ctx.em.find(
        Token,
        {
          grantedWorkflows: { workflow },
          sharedUsers: { user: ctx.session.user }
        },
        { populate: ['sharedUsers', 'createdBy'] }
      )

      // Combine both sets of tokens
      const tokens = [...ownedTokens, ...sharedTokens]

      return {
        tokens
      }
    }),
  create: adminProcedure
    .input(
      z.object({
        expiredAt: z.date().optional(),
        type: z.nativeEnum(ETokenType),
        balance: z.number().optional(),
        description: z.string().optional(),
        weightOffset: z.number().optional(),
        workflowIds: z.array(z.string()).optional(),
        isMasterToken: z.boolean().optional().describe('Allow execute all workflow')
      })
    )
    .mutation(async ({ ctx, input }) => {
      const token = ctx.em.create(
        Token,
        {
          createdBy: ctx.session.user!,
          type: input.type,
          expireAt: input.expiredAt,
          balance: input.balance ?? -1,
          description: input.description,
          weightOffset: input.weightOffset ?? 0,
          isMaster: input.isMasterToken ?? false
        },
        { partial: true }
      )
      if (input.workflowIds) {
        for (const id of input.workflowIds) {
          const workflow = await ctx.em.findOneOrFail(Workflow, { id })
          const perm = ctx.em.create(TokenPermission, { token, workflow }, { partial: true })
          token.grantedWorkflows.add(perm)
        }
      }
      await ctx.em.persistAndFlush(token)
      return token
    }),
  grantAccess: adminProcedure
    .input(
      z.object({
        tokenId: z.string(),
        workflowId: z.string(),
        weightOffset: z.number().optional()
      })
    )
    .mutation(async ({ ctx, input }) => {
      const token = await ctx.em.findOneOrFail(Token, { id: input.tokenId })
      const workflow = await ctx.em.findOneOrFail(Workflow, { id: input.workflowId })
      const perm = ctx.em.create(
        TokenPermission,
        {
          token,
          workflow,
          weightOffset: input.weightOffset ?? 0
        },
        { partial: true }
      )
      token.grantedWorkflows.add(perm)
      await ctx.em.persistAndFlush(token)
      return true
    }),
  shareToken: privateProcedure
    .input(
      z.object({
        tokenId: z.string(),
        userId: z.string()
      })
    )
    .mutation(async ({ ctx, input }) => {
      const token = await ctx.em.findOneOrFail(
        Token,
        { id: input.tokenId, createdBy: ctx.session.user! },
        { populate: ['sharedUsers.*'] }
      )
      if (token.sharedUsers.find((u) => u.user.id === user.id)) {
        throw Error('User already has access to this token')
      }
      const user = await ctx.em.findOneOrFail(User, { id: input.userId })
      const shared = ctx.em.create(TokenShared, { token, user }, { partial: true })
      token.sharedUsers.add(shared)
      await ctx.em.persistAndFlush(token)
      return true
    })
})
