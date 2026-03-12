import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PhotoSlot {
  uri: string;
  remoteUrl?: string;
  position: number;
  label: string;
  uploaded: boolean;
}

export interface SellDraft {
  // Step 1
  makeId: string | null;
  modelId: string | null;
  variantId: string | null;
  year: number | null;
  // Step 2
  mileage: number | null;
  condition: 'excellent' | 'good' | 'fair' | 'poor' | null;
  color: string | null;
  numOwners: number;
  description: string;
  // Step 3
  photos: PhotoSlot[];
  // Step 4
  price: number | null;
  negotiable: boolean;
  // Meta
  city: string | null;
}

interface SellState extends SellDraft {
  currentStep: number;
  editingListingId: string | null;
  setStep: (step: number) => void;
  updateField: <K extends keyof SellDraft>(key: K, value: SellDraft[K]) => void;
  setPhotos: (photos: PhotoSlot[]) => void;
  reset: () => void;
  loadForEdit: (data: Partial<SellDraft> & { listingId: string }) => void;
}

const initialDraft: SellDraft = {
  makeId: null,
  modelId: null,
  variantId: null,
  year: null,
  mileage: null,
  condition: null,
  color: null,
  numOwners: 1,
  description: '',
  photos: [],
  price: null,
  negotiable: true,
  city: null,
};

export const useSellStore = create<SellState>()(
  persist(
    (set) => ({
      ...initialDraft,
      currentStep: 1,
      editingListingId: null,

      setStep: (step) => set({ currentStep: step }),

      updateField: (key, value) => set({ [key]: value }),

      setPhotos: (photos) => set({ photos }),

      reset: () =>
        set({
          ...initialDraft,
          currentStep: 1,
          editingListingId: null,
        }),

      loadForEdit: ({ listingId, ...data }) =>
        set({
          ...initialDraft,
          ...data,
          currentStep: 1,
          editingListingId: listingId,
        }),
    }),
    {
      name: 'carvaan-sell-draft',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
