import { createClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

// Browser client using @supabase/ssr — stores session in cookies (not localStorage)
// This is required for proxy.ts (server-side) to read the auth session
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

// Admin client with service role key — bypasses RLS for admin operations
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
export const supabaseAdmin = serviceRoleKey
  ? createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : supabase;
