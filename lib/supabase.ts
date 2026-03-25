import { createClient } from '@supabase/supabase-js';

/**
 * Supabase server-side client (service key).
 * Use ONLY in API routes — never expose to the browser.
 */
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
);
