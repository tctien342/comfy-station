import { z } from 'zod'
import { adminProcedure, privateProcedure } from '../procedure'
import { router } from '../trpc'
import { EResourceType } from '@/entities/enum'
import { Resource } from '@/entities/client_resource'
import { Tag } from '@/entities/tag'
import { Attachment } from '@/entities/attachment'

export const resourceRouter = router({
  get: privateProcedure
    .input(
      z.object({
        type: z.nativeEnum(EResourceType),
        name: z.string()
      })
    )
    .query(async ({ ctx, input }) => {
      const resource = await ctx.em.findOne(
        Resource,
        { name: input.name, type: input.type },
        {
          populate: ['image', 'tags', 'clients.name', 'clients.host']
        }
      )
      if (!resource) {
        return null
      }
      return {
        info: resource,
        clients: resource.clients
      }
    }),
  create: adminProcedure
    .input(
      z.object({
        name: z.string(),
        type: z.nativeEnum(EResourceType)
      })
    )
    .mutation(async ({ input, ctx }) => {
      const resource = ctx.em.create(
        Resource,
        {
          name: input.name,
          type: input.type
        },
        { partial: true }
      )
      await ctx.em.persist(resource).flush()
      return resource
    }),
  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().optional(),
        description: z.string().optional(),
        tags: z.array(z.string()).optional(),
        imageId: z.string().optional()
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input
      const resource = await ctx.em.findOneOrFail(Resource, { id }, { populate: ['image', 'tags'] })
      if (data.title !== undefined) {
        resource.displayName = data.title
      }
      if (data.description !== undefined) {
        resource.description = data.description
      }
      if (data.tags) {
        resource.tags.removeAll()
        for (const tag of data.tags) {
          const tagEntity = await ctx.em.findOne(Tag, { name: tag })
          if (tagEntity) {
            resource.tags.add(tagEntity)
          } else {
            const newTag = ctx.em.create(Tag, { name: tag }, { partial: true })
            resource.tags.add(newTag)
          }
        }
      }
      if (data.imageId) {
        resource.image = await ctx.em.findOneOrFail(Attachment, { id: data.imageId })
      }
      await ctx.em.persistAndFlush(resource)
      return resource
    })
})
