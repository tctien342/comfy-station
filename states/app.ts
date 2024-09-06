import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface IAppState {
  theme: 'light' | 'dark' | 'system'
  setTheme: (theme: 'light' | 'dark' | 'system') => void
}

export const useAppStore = create<IAppState, any>(
  persist(
    (set, get) => ({
      theme: 'system',
      setTheme: (theme) => set({ theme })
    }),
    {
      name: 'app-state', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => sessionStorage) // (optional) by default, 'localStorage' is used
    }
  )
)
