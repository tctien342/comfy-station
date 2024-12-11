import { createContext } from 'react'

export type TTab = 'history' | 'visualize' | 'api'

export const WorkflowDetailContext = createContext<{
  viewTab: TTab
}>({
  viewTab: 'history'
})
