import { create } from 'zustand'

export enum EHightlightType {
  INPUT,
  OUTPUT,
  SELECTING,
  NONE
}

interface IWorkflowVisState {
  recenter?: () => void
  setRecenterFn: (fn: () => void) => void
  hightlightArr: { id: string; type: EHightlightType; processing?: boolean }[]
  updateHightlightArr: (arr: { id: string; type: EHightlightType; processing?: boolean }[]) => void
  clearSelecting: () => void
  updateProcessing: (id?: string) => void
}

export const useWorkflowVisStore = create<IWorkflowVisState, any>((set, get) => ({
  hightlightArr: [],
  setRecenterFn: (fn) => set({ recenter: fn }),
  updateHightlightArr: (arr) => set({ hightlightArr: arr }),
  clearSelecting: () =>
    set({ hightlightArr: get().hightlightArr.filter((item) => item.type !== EHightlightType.SELECTING) }),
  updateProcessing: (id) => {
    const haveProcessing = get().hightlightArr.some((item) => item.processing)
    const clean = get().hightlightArr.filter((item) => !item.processing)
    if (!id) {
      if (!haveProcessing) return
      set({ hightlightArr: clean })
    } else {
      const found = get().hightlightArr.find((item) => item.id === id)
      if (found?.processing) return
      if (!found) {
        set({ hightlightArr: [...clean, { id, type: EHightlightType.NONE, processing: true }] })
      } else {
        set({
          hightlightArr: get().hightlightArr.map((item) => (item.id === id ? { ...item, processing: true } : item))
        })
      }
    }
  }
}))
