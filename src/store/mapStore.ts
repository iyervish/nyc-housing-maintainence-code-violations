import { create } from 'zustand';

interface MapState {
  visibleCount: number;
  setVisibleCount: (count: number) => void;
}

export const useMapStore = create<MapState>((set) => ({
  visibleCount: 0,
  setVisibleCount: (count) => set({ visibleCount: count }),
}));
