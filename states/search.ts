import { createStore } from 'zustand'

interface IState {
  search: string
  setSearch: (search: string) => void
  clearSearch: () => void
}
export const useSearchStore = createStore<IState>((set, get) => ({
  search: '',
  setSearch: (search) => set({ search }),
  clearSearch: () => set({ search: '' })
}))
