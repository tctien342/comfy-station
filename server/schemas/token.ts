import { t } from 'elysia'

export const TokenInformationSchema = t.Object({
  description: t.Optional(t.String()),
  isMaster: t.Boolean(),
  isWorkflowDefault: t.Boolean(),
  type: t.String(),
  balance: t.Number(),
  weightOffset: t.Number(),
  createdBy: t.Object({
    id: t.String(),
    email: t.String(),
    avatar: t.String(),
    role: t.Number(),
    balance: t.Number(),
    weightOffset: t.Number(),
    createdAt: t.String(),
    updateAt: t.String()
  }),
  expireAt: t.Optional(t.String()),
  createdAt: t.String(),
  updateAt: t.String(),
  id: t.String()
})
