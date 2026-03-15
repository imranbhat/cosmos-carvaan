import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore, type Profile } from '@/stores/authStore';

export function useAuth() {
  const { session, profile, isLoading, isOnboarded, isGuest, setSession, setProfile, setLoading, setGuest } =
    useAuthStore();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (session) {
          fetchProfile(session.user.id);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (data && !error) {
      setProfile(data as Profile);
    }
    setLoading(false);
  }

  async function signInWithOtp(phone: string) {
    // Dev mode: use email-based password auth to avoid needing a real SMS provider.
    // Map phone to a deterministic fake email so no SMS is sent.
    const safePhone = phone.replace(/[^0-9]/g, '');
    const fakeEmail = `${safePhone}@carvaan.dev`;
    const devPassword = `carvaan_dev_${safePhone}`;
    const { error: signUpError } = await supabase.auth.signUp({
      email: fakeEmail,
      password: devPassword,
      options: { data: { phone } },
    });
    // Ignore "user already registered" errors
    if (signUpError && !signUpError.message.includes('already registered')) {
      throw signUpError;
    }
  }

  async function verifyOtp(phone: string, _token: string) {
    // Dev mode: accept any OTP by signing in with the dev password
    const safePhone = phone.replace(/[^0-9]/g, '');
    const fakeEmail = `${safePhone}@carvaan.dev`;
    const devPassword = `carvaan_dev_${safePhone}`;
    const { data, error } = await supabase.auth.signInWithPassword({
      email: fakeEmail,
      password: devPassword,
    });
    if (error) throw error;
    return data;
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    useAuthStore.getState().logout();
  }

  function enterGuestMode() {
    setGuest(true);
    setLoading(false);
  }

  return {
    session,
    profile,
    isLoading,
    isOnboarded,
    isGuest,
    signInWithOtp,
    verifyOtp,
    signOut,
    enterGuestMode,
  };
}
