import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import { config } from '@/constants/config';

// --- DEV: Log all outgoing REST requests ---
if (__DEV__) {
  const originalFetch = global.fetch;
  global.fetch = async (input: any, init?: any) => {
    const url = typeof input === 'string' ? input : input?.url ?? String(input);
    const method = init?.method ?? 'GET';
    console.log(`🌐 ${method} ${url}`);
    if (init?.body) {
      try {
        const body = typeof init.body === 'string' ? init.body : JSON.stringify(init.body);
        console.log(`   📦 ${body.slice(0, 500)}`);
      } catch {}
    }
    const res = await originalFetch(input, init);
    // Clone so we can read body without consuming it
    const clone = res.clone();
    clone.text().then((text: string) => {
      const status = res.status;
      const preview = text.slice(0, 500);
      console.log(`   ← ${status} ${preview}`);
    }).catch(() => {});
    return res;
  };
}

/**
 * Web-safe storage adapter.
 * During SSR (no `window`), falls back to an in-memory map
 * so Supabase auth doesn't crash at module-init time.
 */
const memoryStore = new Map<string, string>();

const webSafeStorage = {
  getItem: async (key: string) => {
    if (Platform.OS === 'web' && typeof window === 'undefined') {
      return memoryStore.get(key) ?? null;
    }
    return AsyncStorage.getItem(key);
  },
  setItem: async (key: string, value: string) => {
    if (Platform.OS === 'web' && typeof window === 'undefined') {
      memoryStore.set(key, value);
      return;
    }
    await AsyncStorage.setItem(key, value);
  },
  removeItem: async (key: string) => {
    if (Platform.OS === 'web' && typeof window === 'undefined') {
      memoryStore.delete(key);
      return;
    }
    await AsyncStorage.removeItem(key);
  },
};

export const supabase = createClient(
  config.supabaseUrl,
  config.supabaseAnonKey,
  {
    auth: {
      storage: webSafeStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
