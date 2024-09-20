import { z } from 'zod'

const TSimpleValue = z.union([z.string(), z.number(), z.boolean()])

const TNodeReference = z.tuple([z.string(), z.number()])

const TInputValue = z.union([TSimpleValue, TNodeReference, z.array(z.union([TSimpleValue, TNodeReference]))])

const IInputs = z.record(TInputValue)

const TMeta = z.object({
  title: z.string()
})

const INode = z.object({
  inputs: IInputs,
  class_type: z.string(),
  _meta: TMeta.optional()
})
const IWorkflow = z.record(INode)

export const isValidWorkflow = (workflow: unknown): workflow is IWorkflow => {
  return IWorkflow.safeParse(workflow).success
}
