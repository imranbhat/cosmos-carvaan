import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type SortOption = 'price_asc' | 'price_desc' | 'newest' | 'mileage' | 'year';

export interface FilterState {
  makes: string[];
  models: string[];
  yearRange: [number, number];
  priceRange: [number, number];
  mileageRange: [number, number];
  bodyTypes: string[];
  fuelTypes: string[];
  transmission: string | null;
  colors: string[];
  city: string | null;
  numOwners: number | null;
  inspectionStatus: string | null;
  sortBy: SortOption;
  query: string | null;
}

interface FilterActions {
  setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  resetFilters: () => void;
  activeFilterCount: () => number;
}

const initialState: FilterState = {
  makes: [],
  models: [],
  yearRange: [2000, new Date().getFullYear() + 1],
  priceRange: [0, 1_000_000],
  mileageRange: [0, 300_000],
  bodyTypes: [],
  fuelTypes: [],
  transmission: null,
  colors: [],
  city: null,
  numOwners: null,
  inspectionStatus: null,
  sortBy: 'newest',
  query: null,
};

export const useFilterStore = create<FilterState & FilterActions>()(
  persist(
    (set, get) => ({
      ...initialState,
      setFilter: (key, value) => set({ [key]: value }),
      resetFilters: () => set(initialState),
      activeFilterCount: () => {
        const s = get();
        let count = 0;
        if (s.makes.length) count++;
        if (s.models.length) count++;
        if (s.yearRange[0] !== initialState.yearRange[0] || s.yearRange[1] !== initialState.yearRange[1]) count++;
        if (s.priceRange[0] !== initialState.priceRange[0] || s.priceRange[1] !== initialState.priceRange[1]) count++;
        if (s.mileageRange[0] !== initialState.mileageRange[0] || s.mileageRange[1] !== initialState.mileageRange[1]) count++;
        if (s.bodyTypes.length) count++;
        if (s.fuelTypes.length) count++;
        if (s.transmission) count++;
        if (s.colors.length) count++;
        if (s.city) count++;
        if (s.numOwners) count++;
        if (s.inspectionStatus) count++;
        return count;
      },
    }),
    {
      name: 'carvaan-filters',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
