import { ETaskStatus, EValueType } from '@/entities/enum'
import { t } from 'elysia'
import { AttachmentSchema } from './attachment'

export const TaskSchema = t.Object({
  id: t.String(),
  workflow: t.String(),
  client: t.Optional(t.String()),
  status: t.Enum(ETaskStatus),
  repeatCount: t.Number(),
  computedCost: t.Number(),
  computedWeight: t.Number(),
  inputValues: t.Record(t.String(), t.Union([t.String(), t.Number(), t.Array(t.String())])),
  executionTime: t.Optional(t.Number()),
  trigger: t.Number(),
  createdAt: t.String(),
  updateAt: t.String(),
  parent: t.Optional(t.String()),
  attachments: t.Array(AttachmentSchema)
})

export const TaskEventDataSchema = t.Object({
  type: t.Enum(EValueType),
  value: t.Array(t.Union([t.String(), t.Number(), t.Boolean()]))
})

export const TaskEventSchema = t.Object({
  id: t.Number(),
  task: t.String(),
  status: t.Enum(ETaskStatus),
  details: t.Optional(t.String()),
  data: t.Optional(TaskEventDataSchema),
  createdAt: t.String()
})
