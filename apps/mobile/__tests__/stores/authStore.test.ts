import { useAuthStore, type Profile } from '../../stores/authStore';
import type { Session } from '@supabase/supabase-js';

// Reset store between tests
beforeEach(() => {
  useAuthStore.setState({
    session: null,
    profile: null,
    isLoading: true,
    isOnboarded: false,
    isGuest: false,
  });
});

const mockProfile: Profile = {
  id: 'user-123',
  phone: '+911234567890',
  email: 'test@example.com',
  full_name: 'Imran Bhat',
  avatar_url: 'https://example.com/avatar.jpg',
  city: 'Srinagar',
  role: 'buyer',
  rating_avg: 4.5,
  rating_count: 12,
  created_at: '2024-01-01T00:00:00Z',
};

const mockSession = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  token_type: 'bearer',
  user: {
    id: 'user-123',
    aud: 'authenticated',
    role: 'authenticated',
    email: 'test@example.com',
    app_metadata: {},
    user_metadata: {},
    created_at: '2024-01-01T00:00:00Z',
  },
} as unknown as Session;

describe('authStore', () => {
  describe('initial state', () => {
    it('should have no session', () => {
      const state = useAuthStore.getState();
      expect(state.session).toBeNull();
    });

    it('should have no profile', () => {
      const state = useAuthStore.getState();
      expect(state.profile).toBeNull();
    });

    it('should be loading initially', () => {
      const state = useAuthStore.getState();
      expect(state.isLoading).toBe(true);
    });

    it('should not be onboarded', () => {
      const state = useAuthStore.getState();
      expect(state.isOnboarded).toBe(false);
    });

    it('should not be guest', () => {
      const state = useAuthStore.getState();
      expect(state.isGuest).toBe(false);
    });
  });

  describe('setSession', () => {
    it('should set the session', () => {
      useAuthStore.getState().setSession(mockSession);
      expect(useAuthStore.getState().session).toBe(mockSession);
    });

    it('should clear the session when set to null', () => {
      useAuthStore.getState().setSession(mockSession);
      useAuthStore.getState().setSession(null);
      expect(useAuthStore.getState().session).toBeNull();
    });
  });

  describe('setProfile', () => {
    it('should set the profile', () => {
      useAuthStore.getState().setProfile(mockProfile);
      expect(useAuthStore.getState().profile).toEqual(mockProfile);
    });

    it('should mark as onboarded when profile has full_name and city', () => {
      useAuthStore.getState().setProfile(mockProfile);
      expect(useAuthStore.getState().isOnboarded).toBe(true);
    });

    it('should NOT mark as onboarded when profile is missing full_name', () => {
      useAuthStore.getState().setProfile({ ...mockProfile, full_name: '' });
      expect(useAuthStore.getState().isOnboarded).toBe(false);
    });

    it('should NOT mark as onboarded when profile is missing city', () => {
      useAuthStore.getState().setProfile({ ...mockProfile, city: null });
      expect(useAuthStore.getState().isOnboarded).toBe(false);
    });

    it('should set isOnboarded false when profile is null', () => {
      useAuthStore.getState().setProfile(mockProfile);
      useAuthStore.getState().setProfile(null);
      expect(useAuthStore.getState().isOnboarded).toBe(false);
    });
  });

  describe('setLoading', () => {
    it('should update loading state', () => {
      useAuthStore.getState().setLoading(false);
      expect(useAuthStore.getState().isLoading).toBe(false);
    });
  });

  describe('updateProfile', () => {
    it('should partially update the profile', () => {
      useAuthStore.getState().setProfile(mockProfile);
      useAuthStore.getState().updateProfile({ city: 'Jammu' });
      expect(useAuthStore.getState().profile?.city).toBe('Jammu');
      expect(useAuthStore.getState().profile?.full_name).toBe('Imran Bhat');
    });

    it('should do nothing if profile is null', () => {
      useAuthStore.getState().updateProfile({ city: 'Jammu' });
      expect(useAuthStore.getState().profile).toBeNull();
    });
  });

  describe('setGuest', () => {
    it('should enable guest mode', () => {
      useAuthStore.getState().setGuest(true);
      expect(useAuthStore.getState().isGuest).toBe(true);
    });

    it('should disable guest mode', () => {
      useAuthStore.getState().setGuest(true);
      useAuthStore.getState().setGuest(false);
      expect(useAuthStore.getState().isGuest).toBe(false);
    });
  });

  describe('logout', () => {
    it('should clear session, profile, onboarded, and guest state', () => {
      // Set up a fully authenticated state
      useAuthStore.getState().setSession(mockSession);
      useAuthStore.getState().setProfile(mockProfile);
      useAuthStore.getState().setGuest(false);

      // Verify state is set
      expect(useAuthStore.getState().session).not.toBeNull();
      expect(useAuthStore.getState().profile).not.toBeNull();
      expect(useAuthStore.getState().isOnboarded).toBe(true);

      // Logout
      useAuthStore.getState().logout();

      const state = useAuthStore.getState();
      expect(state.session).toBeNull();
      expect(state.profile).toBeNull();
      expect(state.isOnboarded).toBe(false);
      expect(state.isGuest).toBe(false);
    });
  });
});
