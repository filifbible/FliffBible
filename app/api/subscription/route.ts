import { NextRequest, NextResponse } from 'next/server';
import { preApprovalPlan, preApproval, PLAN_EXTERNAL_REFS } from '@/lib/mercadopago';
import { supabaseAdmin } from '@/lib/supabase';
import {
  validate,
  CreateSubscriptionNewUserSchema,
  CreateSubscriptionExistingUserSchema,
} from '@/lib/validate';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { SubscriptionStatus } from '@/enums/subscription-status.enum';

/**
 * POST /api/subscription
 * Suporta dois fluxos:
 *  1. Novo usuário  → { userName, userEmail, userPassword, planId }
 *  2. Usuário existente → { user_id, payer_email, plan_id, card_token_id }
 */
export async function POST(req: NextRequest) {
  // ── Rate limiting ─────────────────────────────────────────────────────────
  const ip = getClientIp(req);
  if (!rateLimit(ip, 10, 60_000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const bodyObj = body as Record<string, unknown>;

  // ── Detecta fluxo ─────────────────────────────────────────────────────────
  const isNewUser      = 'userName' in bodyObj && 'userPassword' in bodyObj;
  const isExistingUser = 'user_id' in bodyObj && 'card_token_id' in bodyObj;

  // ══════════════════════════════════════════════════════════════════════════
  // FLUXO 1 — Novo usuário (LandingPage)
  // ══════════════════════════════════════════════════════════════════════════
  if (isNewUser) {
    const { data, error } = validate(CreateSubscriptionNewUserSchema, body);
    if (error) return error;

    const { userName, userEmail, userPassword, planId } = data;

    // Resolve o plan ID real do MP pelo external_reference
    const existing = await preApprovalPlan.search({ options: { limit: 100 } });
    const ref       = PLAN_EXTERNAL_REFS[planId];
    const mpPlan    = existing.results?.find((p: any) => p.external_reference === ref);

    if (!mpPlan?.id) {
      return NextResponse.json({ error: 'Plan not found in Mercado Pago' }, { status: 404 });
    }

    // Cria usuário no Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email:         userEmail,
      password:      userPassword,
      email_confirm: true,
      user_metadata: { name: userName },
    });

    if (authError) {
      const isConflict =
        authError.message?.includes('already been registered') ||
        (authError as any).code === 'user_already_exists';

      return NextResponse.json(
        { error: isConflict ? 'Email já cadastrado' : 'Failed to create account',
          details: authError.message },
        { status: isConflict ? 409 : 500 },
      );
    }

    const userId = authData.user.id;

    // Cria entrada na tabela accounts
    await supabaseAdmin.from('accounts').insert({
      id:        userId,
      email:     userEmail,
      full_name: userName,
      is_premium: false,
    });

    // Retorna init_point do plano para o checkout MP
    const planDetails = await fetch(
      `https://api.mercadopago.com/preapproval_plan/${mpPlan.id}`,
      { headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` } },
    ).then(r => r.json());

    const checkoutUrl = `${planDetails.init_point}&payer_email=${encodeURIComponent(userEmail)}&external_reference=${userId}`;

    return NextResponse.json({
      success:      true,
      user:         { id: userId, email: userEmail, name: userName },
      checkout_url: checkoutUrl,
    });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // FLUXO 2 — Usuário existente (SubscriptionCheckout)
  // ══════════════════════════════════════════════════════════════════════════
  if (isExistingUser) {
    const { data, error } = validate(CreateSubscriptionExistingUserSchema, body);
    if (error) return error;

    const { user_id, payer_email, plan_id, card_token_id } = data;

    // Regra de negócio: não permite assinatura duplicada
    const { data: existing2 } = await supabaseAdmin
      .from('accounts')
      .select('is_premium, subscription_status')
      .eq('id', user_id)
      .single();

    if (existing2?.is_premium && existing2?.subscription_status === SubscriptionStatus.AUTHORIZED) {
      return NextResponse.json({ error: 'Subscription already active' }, { status: 409 });
    }

    // Cria preapproval no MP
    const response = await preApproval.create({
      body: {
        preapproval_plan_id: plan_id,
        reason:              'Filif Bible+ Subscription',
        external_reference:  user_id,
        payer_email,
        card_token_id,
        back_url:            process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
        status:              'authorized',
      },
    });

    // Atualiza Supabase
    const trialEnd = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();

    const { error: upErr } = await supabaseAdmin
      .from('accounts')
      .update({
        is_premium:          true,
        subscription_id:     response.id,
        trial_end_date:      trialEnd,
        subscription_status: response.status ?? SubscriptionStatus.AUTHORIZED,
      })
      .eq('id', user_id);

    if (upErr) {
      // Se não existe registro, insere
      await supabaseAdmin.from('accounts').insert({
        id:                  user_id,
        email:               payer_email,
        is_premium:          true,
        subscription_id:     response.id,
        trial_end_date:      trialEnd,
        subscription_status: response.status ?? SubscriptionStatus.AUTHORIZED,
      });
    }

    return NextResponse.json({
      success:      true,
      subscription: { id: response.id, status: response.status },
    });
  }

  return NextResponse.json({ error: 'Invalid request format' }, { status: 400 });
}
