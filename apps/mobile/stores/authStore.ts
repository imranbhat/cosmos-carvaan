import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  phone: string | null;
  email: string | null;
  full_name: string;
  avatar_url: string | null;
  city: string | null;
  role: 'buyer' | 'seller' | 'both';
  rating_avg: number;
  rating_count: number;
  created_at: string;
}

interface AuthState {
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  isOnboarded: boolean;
  setSession: (session: Session | null) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  updateProfile: (partial: Partial<Profile>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  profile: null,
  isLoading: true,
  isOnboarded: false,
  setSession: (session) => set({ session }),
  setProfile: (profile) =>
    set({
      profile,
      isOnboarded: profile !== null && !!profile.full_name && !!profile.city,
    }),
  setLoading: (isLoading) => set({ isLoading }),
  updateProfile: (partial) =>
    set((state) => ({
      profile: state.profile ? { ...state.profile, ...partial } : null,
    })),
  logout: () =>
    set({
      session: null,
      profile: null,
      isOnboarded: false,
    }),
}));
