import { create } from 'zustand';
import type { FilterState, Borough, ViolationClass } from '../types/violation';

export const useFilterStore = create<FilterState>((set) => ({
  borough: 'MANHATTAN',
  classes: [],

  setBorough: (borough: Borough) => set({ borough }),
  setClasses: (classes: ViolationClass[]) => set({ classes }),

  toggleClass: (cls: ViolationClass) =>
    set((state) => ({
      classes: state.classes.includes(cls)
        ? state.classes.filter((c) => c !== cls)
        : [...state.classes, cls],
    })),
}));
