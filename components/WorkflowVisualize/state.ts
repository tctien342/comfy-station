import { create } from 'zustand'

export enum EHightlightType {
  INPUT,
  OUTPUT,
  SELECTING,
  PROCESSING
}

interface IWorkflowVisState {
  hightlightArr: { id: string; type: EHightlightType }[]
  updateHightlightArr: (arr: { id: string; type: EHightlightType }[]) => void
  clearSelecting: () => void
  updateProcessing: (id?: string) => void
}

export const useWorkflowVisStore = create<IWorkflowVisState, any>((set, get) => ({
  hightlightArr: [],
  updateHightlightArr: (arr) => set({ hightlightArr: arr }),
  clearSelecting: () =>
    set({ hightlightArr: get().hightlightArr.filter((item) => item.type !== EHightlightType.SELECTING) }),
  updateProcessing: (id) => {
    const clean = get().hightlightArr.filter((item) => item.type !== EHightlightType.PROCESSING)
    if (!id) {
      set({ hightlightArr: clean })
    } else {
      set({ hightlightArr: [...clean, { id, type: EHightlightType.PROCESSING }] })
    }
  }
}))
