import { NextRequest, NextResponse } from 'next/server';
import { preApprovalPlan, preApproval, PLAN_EXTERNAL_REFS, PLAN_METADATA } from '@/lib/mercadopago';
import { supabaseAdmin } from '@/lib/supabase';
import {
  validate,
  CreateSubscriptionNewUserSchema,
  CreateSubscriptionExistingUserSchema,
} from '@/lib/validate';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { SubscriptionStatus } from '@/enums/subscription-status.enum';
import { CouponEntity } from '@/entities/coupon.entity';

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

    const { user_id, payer_email, plan_id, card_token_id, payment_method_id, couponCode } = data;

    // Regra de negócio: não permite assinatura duplicada
    const { data: existing2 } = await supabaseAdmin
      .from('accounts')
      .select('is_premium, subscription_status')
      .eq('id', user_id)
      .single();

    if (existing2?.is_premium && existing2?.subscription_status === SubscriptionStatus.AUTHORIZED) {
      return NextResponse.json({ error: 'Subscription already active' }, { status: 409 });
    }

    // Identificar o preço original do plano e a key
    const existing = await preApprovalPlan.search({ options: { limit: 100 } });
    const mpPlan = existing.results?.find((p: any) => p.id === plan_id);
    
    if (!mpPlan) {
      return NextResponse.json({ error: 'Plan not found in Mercado Pago' }, { status: 404 });
    }

    const extRef = (mpPlan as any).external_reference;
    const planKey = Object.keys(PLAN_EXTERNAL_REFS).find(
      k => PLAN_EXTERNAL_REFS[k as keyof typeof PLAN_EXTERNAL_REFS] === extRef
    ) as keyof typeof PLAN_EXTERNAL_REFS | undefined;

    let planPrice = 0;
    if (planKey) {
      planPrice = PLAN_METADATA[planKey].price;
    } else {
      planPrice = mpPlan.auto_recurring?.transaction_amount || 0;
    }

    // Verificar Cupom (regras de domínio via CouponEntity)
    let discountPercent = 0;
    let validCouponId = null;

    if (couponCode) {
      const { data: couponData } = await supabaseAdmin
        .from('coupons')
        .select('*')
        .eq('code', couponCode.toUpperCase())
        .single();

      if (!couponData) {
        return NextResponse.json({ error: 'Cupom não encontrado' }, { status: 400 });
      }

      const couponEntity = new CouponEntity(
        couponData.id,
        couponData.code,
        couponData.discount_percent,
        couponData.max_uses,
        couponData.times_used,
        couponData.active,
        couponData.created_by
      );

      if (!couponEntity.canBeUsed()) {
        return NextResponse.json({ error: 'Cupom inválido ou expirado' }, { status: 400 });
      }

      discountPercent = couponEntity.discountPercent;
      validCouponId = couponEntity.id;
    }

    let response;
    // Trial = 2 dias — start_date do MP controla quando começa a cobrar
    const trialEndDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
    let trialEnd = trialEndDate.toISOString();
    let couponPendingFullPrice: number | null = null;

    if (validCouponId && discountPercent > 0) {
      // ── FLUXO COM CUPOM + TRIAL ───────────────────────────────────────────
      // 1. Calcula valor com desconto (via entidade — mantém regra no domínio)
      const couponForCalc = new CouponEntity('', '', discountPercent, 0, 0, true);
      const discountedAmount = couponForCalc.applyDiscount(planPrice);

      // 2. Cria assinatura com:
      //    - start_date = daqui 2 dias (trial nativo do MP — sem cobrança até lá)
      //    - transaction_amount = valor descontado (cobrado na 1ª parcela)
      // O webhook vai detectar o 1º pagamento e atualizar para o preço cheio
      response = await preApproval.create({
        body: {
          reason:             'Filif Bible+ Subscription',
          external_reference: user_id,
          payer_email,
          card_token_id,
          back_url:           process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
          status:             'authorized',
          auto_recurring: {
            frequency:          1,
            frequency_type:     planKey === 'anual' ? 'years' : 'months',
            transaction_amount: discountedAmount,
            currency_id:        'BRL',
            start_date:         trialEnd, // Trial real — MP não cobra até esta data
          },
        },
      });

      // 3. Salva o preço cheio para o webhook atualizar após o 1º pagamento
      couponPendingFullPrice = planPrice;

      // 4. Incrementa uso do cupom e registra na tabela coupon_uses
      const { data: cData } = await supabaseAdmin
        .from('coupons').select('times_used').eq('id', validCouponId).single();
      if (cData) {
        await supabaseAdmin.from('coupons')
          .update({ times_used: cData.times_used + 1 }).eq('id', validCouponId);
          
        await supabaseAdmin.from('coupon_uses').insert({
          coupon_id: validCouponId,
          user_id: user_id
        });
      }

    } else {
      // ── FLUXO NORMAL (sem cupom) ──────────────────────────────────────────
      // Trial também de 2 dias mas via preapproval_plan_id (configurado no plano MP)
      response = await preApproval.create({
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
    }

    // Atualiza Supabase
    const { error: upErr } = await supabaseAdmin
      .from('accounts')
      .update({
        is_premium:                  true,
        subscription_id:             response.id,
        trial_end_date:              trialEnd,
        subscription_status:         response.status ?? SubscriptionStatus.AUTHORIZED,
        coupon_pending_full_price:   couponPendingFullPrice,
      })
      .eq('id', user_id);

    if (upErr) {
      // Se não existe registro, insere
      await supabaseAdmin.from('accounts').insert({
        id:                          user_id,
        email:                       payer_email,
        is_premium:                  true,
        subscription_id:             response.id,
        trial_end_date:              trialEnd,
        subscription_status:         response.status ?? SubscriptionStatus.AUTHORIZED,
        coupon_pending_full_price:   couponPendingFullPrice,
      });
    }

    return NextResponse.json({
      success:      true,
      subscription: { id: response.id, status: response.status },
    });
  }

  return NextResponse.json({ error: 'Invalid request format' }, { status: 400 });
}
