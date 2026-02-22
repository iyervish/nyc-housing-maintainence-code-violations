import { create } from 'zustand';
import type { FilterState, Borough, ViolationClass } from '../types/violation';

export const useFilterStore = create<FilterState>((set) => ({
  boroughs: [],
  classes: [],
  status: 'All',

  setBoroughs: (boroughs: Borough[]) => set({ boroughs }),
  setClasses: (classes: ViolationClass[]) => set({ classes }),
  setStatus: (status) => set({ status }),

  toggleBorough: (borough: Borough) =>
    set((state) => ({
      boroughs: state.boroughs.includes(borough)
        ? state.boroughs.filter((b) => b !== borough)
        : [...state.boroughs, borough],
    })),

  toggleClass: (cls: ViolationClass) =>
    set((state) => ({
      classes: state.classes.includes(cls)
        ? state.classes.filter((c) => c !== cls)
        : [...state.classes, cls],
    })),
}));
