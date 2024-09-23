import { create } from 'zustand'

export enum EHightlightType {
  INPUT,
  OUTPUT,
  SELECTING
}

interface IWorkflowVisState {
  hightlightArr: { id: string; type: EHightlightType }[]
  updateHightlightArr: (arr: { id: string; type: EHightlightType }[]) => void
  clearSelecting: () => void
}

export const useWorkflowVisStore = create<IWorkflowVisState, any>((set, get) => ({
  hightlightArr: [],
  updateHightlightArr: (arr) => set({ hightlightArr: arr }),
  clearSelecting: () =>
    set({ hightlightArr: get().hightlightArr.filter((item) => item.type !== EHightlightType.SELECTING) })
}))
