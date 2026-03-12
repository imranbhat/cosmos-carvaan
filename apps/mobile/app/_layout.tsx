import { useFonts } from 'expo-font';
import { Slot, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect, useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { queryClient } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';
import { ErrorBoundary as AppErrorBoundary } from '@/components/ErrorBoundary';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

function AuthGate({ onReady }: { onReady: () => void }) {
  const { session, isLoading, isOnboarded } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    // Auth resolved — safe to hide splash
    onReady();

    const firstSegment = segments[0] as string | undefined;
    const inAuthGroup = firstSegment === '(auth)';

    if (!session && !inAuthGroup) {
      router.replace('/(auth)/login' as any);
    } else if (session && !isOnboarded && !firstSegment?.includes('onboarding')) {
      router.replace('/(auth)/onboarding' as any);
    } else if (session && isOnboarded && inAuthGroup) {
      router.replace('/(tabs)' as any);
    }
  }, [session, isLoading, isOnboarded, segments, onReady]);

  return <Slot />;
}

export default function RootLayout() {
  const [appReady, setAppReady] = useState(false);
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  const handleReady = useCallback(() => {
    if (!appReady) {
      setAppReady(true);
      SplashScreen.hideAsync();
    }
  }, [appReady]);

  // Fallback: hide splash after 3s even if auth hasn't resolved
  useEffect(() => {
    if (loaded && !appReady) {
      const timeout = setTimeout(() => {
        setAppReady(true);
        SplashScreen.hideAsync();
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [loaded, appReady]);

  if (!loaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <AuthGate onReady={handleReady} />
        </QueryClientProvider>
      </AppErrorBoundary>
    </GestureHandlerRootView>
  );
}
