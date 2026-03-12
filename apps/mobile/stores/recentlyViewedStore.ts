import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MAX_ITEMS = 50;

interface RecentlyViewedState {
  ids: string[];
  addViewed: (listingId: string) => void;
  clear: () => void;
}

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set, get) => ({
      ids: [],
      addViewed: (listingId) => {
        const current = get().ids.filter((id) => id !== listingId);
        set({ ids: [listingId, ...current].slice(0, MAX_ITEMS) });
      },
      clear: () => set({ ids: [] }),
    }),
    {
      name: 'carvaan-recently-viewed',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
