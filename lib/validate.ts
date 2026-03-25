import { z, ZodSchema } from 'zod';
import { NextResponse } from 'next/server';

/**
 * Valida qualquer payload com um schema Zod.
 * Retorna { data } se válido ou { error: NextResponse 400 } se inválido.
 */
export function validate<T>(schema: ZodSchema<T>, data: unknown):
  | { data: T; error?: never }
  | { data?: never; error: NextResponse } {
  const result = schema.safeParse(data);

  if (!result.success) {
    return {
      error: NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten() },
        { status: 400 },
      ),
    };
  }

  return { data: result.data };
}

// ─── Schemas ────────────────────────────────────────────────────────────────

export const CreateSubscriptionNewUserSchema = z.object({
  userName:     z.string().min(1),
  userEmail:    z.string().email(),
  userPassword: z.string().min(6),
  planId:       z.enum(['familia', 'anual']),
});

export const CreateSubscriptionExistingUserSchema = z.object({
  user_id:       z.string().uuid(),
  payer_email:   z.string().email(),
  plan_id:       z.string().min(1),
  card_token_id: z.string().min(1),
});

export const WebhookSchema = z.object({
  type: z.string(),
  data: z.object({ id: z.string() }),
});

export const SubscriptionStatusSchema = z.object({
  userId: z.string().uuid(),
});
