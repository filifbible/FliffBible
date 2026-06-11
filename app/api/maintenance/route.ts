import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * API Route: GET /api/maintenance
 * Returns the current maintenance mode status.
 * Used by middleware (Edge Runtime) and client components.
 */
export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ is_active: false });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'maintenance_mode')
      .single();

    if (error || !data) {
      return NextResponse.json({ is_active: false });
    }

    const value = data.value as { is_active?: boolean; message?: string; title?: string; estimated_return?: string | null };

    return NextResponse.json({
      is_active: value?.is_active ?? false,
      message: value?.message ?? '',
      title: value?.title ?? 'Sistema em Manutenção',
      estimated_return: value?.estimated_return ?? null,
    });
  } catch (err) {
    console.error('[Maintenance API] Error:', err);
    return NextResponse.json({ is_active: false });
  }
}
