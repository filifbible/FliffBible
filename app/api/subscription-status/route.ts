import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-guard';
import { supabaseAdmin } from '@/lib/supabase';
import { preApproval } from '@/lib/mercadopago';

/**
 * GET /api/subscription-status?userId=<uuid>
 * Retorna o status de assinatura do usuário autenticado.
 */
export async function GET(req: NextRequest) {
  // Auth obrigatório
  const userOrError = await requireAuth(req);
  if (userOrError instanceof NextResponse) return userOrError;

  const userId = req.nextUrl.searchParams.get('userId') ?? userOrError.id;

  // Segurança: usuário só pode consultar o próprio status (a menos que seja admin)
  if (userId !== userOrError.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { data: account, error } = await supabaseAdmin
      .from('accounts')
      .select('is_premium, subscription_id, subscription_status, trial_end_date')
      .eq('id', userId)
      .single();

    if (error || !account) {
      return NextResponse.json({ isActive: false, status: 'inactive' });
    }

    // Verifica trial
    const trialValid = account.trial_end_date
      ? new Date(account.trial_end_date) > new Date()
      : false;

    // Consulta status em tempo real no MP (opcional — usa cache do Supabase se não tiver ID)
    let mpStatus = account.subscription_status ?? 'unknown';

    if (account.subscription_id) {
      try {
        const mpData = await preApproval.get({ id: account.subscription_id });
        mpStatus = mpData.status ?? mpStatus;

        // Sincroniza Supabase se o status mudou
        if (mpStatus !== account.subscription_status) {
          await supabaseAdmin
            .from('accounts')
            .update({ subscription_status: mpStatus })
            .eq('id', userId);
        }
      } catch {
        // Usa cache do Supabase em caso de falha na API MP
      }
    }

    return NextResponse.json({
      isActive:      account.is_premium || trialValid,
      status:        mpStatus,
      trialValid,
      trialEndDate:  account.trial_end_date,
    });

  } catch (err) {
    console.error('❌ /api/subscription-status error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
