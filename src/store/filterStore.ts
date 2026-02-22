import { create } from 'zustand';
import type { FilterState, Borough, ViolationClass } from '../types/violation';

export const useFilterStore = create<FilterState>((set) => ({
  borough: 'MANHATTAN',
  violationClass: 'C',

  setBorough: (borough: Borough) => set({ borough }),
  setViolationClass: (violationClass: ViolationClass) => set({ violationClass }),
}));
