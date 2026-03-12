import { useSyncExternalStore } from 'react';
import { onlineManager } from '@tanstack/react-query';

function subscribe(callback: () => void) {
  return onlineManager.subscribe(callback);
}

function getSnapshot() {
  return onlineManager.isOnline();
}

/** Returns whether the device is online using React Query's online manager. */
export function useNetworkStatus() {
  const isConnected = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return { isConnected };
}
