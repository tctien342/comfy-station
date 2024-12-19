import { create } from 'zustand'

interface IWorkflowState {
  currentInput: Record<string, any>
  setCurrentInput: (input: Record<string, any>) => void
}

export const useWorkflowStore = create<IWorkflowState, any>((set, get) => ({
  currentInput: {},
  setCurrentInput: (input) => set({ currentInput: input })
}))
