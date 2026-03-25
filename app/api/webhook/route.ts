import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase';
import { payment } from '@/lib/mercadopago';
import { validate, WebhookSchema } from '@/lib/validate';
import { SubscriptionStatus } from '@/enums/subscription-status.enum';

const ALLOWED_TYPES = ['subscription_preapproval', 'payment'] as const;

/**
 * POST /api/webhook
 * Recebe notificações do Mercado Pago.
 * Valida assinatura HMAC, garante idempotência e atualiza Supabase.
 */
export async function POST(req: NextRequest) {
  const rawBody  = await req.text();
  const signature = req.headers.get('x-signature') ?? '';

  // ── Valida assinatura HMAC (segurança) ───────────────────────────────────
  if (process.env.MP_WEBHOOK_SECRET) {
    const expected = 'sha256=' +
      crypto
        .createHmac('sha256', process.env.MP_WEBHOOK_SECRET)
        .update(rawBody)
        .digest('hex');

    if (signature !== expected) {
      console.warn('⚠️ Webhook com assinatura inválida rejeitado');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
  }

  // ── Valida payload ───────────────────────────────────────────────────────
  let parsed: unknown;
  try { parsed = JSON.parse(rawBody); }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const { data, error } = validate(WebhookSchema, parsed);
  if (error) return error;

  // Responde imediatamente — MP espera 200 rápido
  const eventId = data.data.id;
  const type    = data.type;

  // ── Ignora tipos desconhecidos (whitelist) ───────────────────────────────
  if (!ALLOWED_TYPES.includes(type as any)) {
    return NextResponse.json({ received: true });
  }

  // ── Idempotência ─────────────────────────────────────────────────────────
  const { data: processed } = await supabaseAdmin
    .from('processed_webhooks')
    .select('id')
    .eq('event_id', eventId)
    .single();

  if (processed) {
    console.log(`ℹ️ Webhook ${eventId} já processado — ignorando`);
    return NextResponse.json({ received: true });
  }

  // ── Processa evento ──────────────────────────────────────────────────────
  try {
    if (type === 'subscription_preapproval') {
      console.log('📝 Evento de assinatura recebido:', eventId);
      // Atualiza status no Supabase se necessário
      await supabaseAdmin
        .from('accounts')
        .update({ subscription_status: SubscriptionStatus.AUTHORIZED })
        .eq('subscription_id', eventId);

    } else if (type === 'payment') {
      const paymentData = await payment.get({ id: eventId });
      console.log('💳 Pagamento recebido. Status:', paymentData.status);

      if (paymentData.status === 'approved') {
        // Renova premium — external_reference = user_id
        const userId = paymentData.external_reference;
        if (userId) {
          await supabaseAdmin
            .from('accounts')
            .update({ is_premium: true, subscription_status: SubscriptionStatus.AUTHORIZED })
            .eq('id', userId);
          console.log('✅ Premium renovado para:', userId);
        }
      }
    }

    // Registra evento como processado
    await supabaseAdmin
      .from('processed_webhooks')
      .insert({ event_id: eventId, type, processed_at: new Date().toISOString() });

  } catch (err) {
    console.error('❌ Erro ao processar webhook:', err);
    // Não retorna 500 para o MP — ele reenvaria o evento
  }

  return NextResponse.json({ received: true });
}
