interface IWorkflow {
  [nodeId: string]: INode
}

interface INode {
  inputs: IInputs
  info?: import('@mikro-orm/core').Loaded<
    import('@/entities/client_extension').Extension,
    never,
    import('@mikro-orm/core').PopulatePath.ALL,
    never
  >
  class_type: string
  _meta?: TMeta
}

interface IInputs {
  [inputName: string]: TInputValue
}

type TInputValue = TSimpleValue | TNodeReference

type TSimpleValue = string | number | boolean

type TNodeReference = [string, number]

interface TMeta {
  title: string
}
