import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CompareItem {
  corpCode: string;
  corpName: string;
  stockCode: string;
}

interface CompareState {
  items: CompareItem[];
  add: (item: CompareItem) => void;
  remove: (corpCode: string) => void;
  clear: () => void;
  has: (corpCode: string) => boolean;
}

const MAX_COMPARE = 4;

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (item) =>
        set((state) => {
          if (state.items.some((i) => i.corpCode === item.corpCode)) return state;
          if (state.items.length >= MAX_COMPARE) return state;
          return { items: [...state.items, item] };
        }),
      remove: (corpCode) =>
        set((state) => ({ items: state.items.filter((i) => i.corpCode !== corpCode) })),
      clear: () => set({ items: [] }),
      has: (corpCode) => get().items.some((i) => i.corpCode === corpCode),
    }),
    { name: 'wsv-compare' },
  ),
);
