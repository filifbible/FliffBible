import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

let supabaseClient: SupabaseClient | null = null;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY not configured. Supabase features will be disabled.');
  console.warn('To enable Supabase, add these environment variables to your .env.local file or Vercel project settings.');
} else {
  try {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
  }
}

export const supabase = supabaseClient;
