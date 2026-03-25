import { NextRequest, NextResponse } from 'next/server';
import { preApprovalPlan, PLAN_EXTERNAL_REFS, PLAN_METADATA } from '@/lib/mercadopago';

/**
 * GET /api/plans
 * Retorna os planos disponíveis com IDs do Mercado Pago.
 * Busca planos existentes pelo external_reference — sem criar duplicatas.
 */
export async function GET(_req: NextRequest) {
  try {
    const existing = await preApprovalPlan.search({ options: { limit: 100 } });
    const results  = existing.results ?? [];

    const plans: Record<string, unknown> = {};

    for (const [key, ref] of Object.entries(PLAN_EXTERNAL_REFS)) {
      const planKey = key as keyof typeof PLAN_EXTERNAL_REFS;
      const found   = results.find((p: any) => p.external_reference === ref);

      plans[planKey] = {
        id:        found?.id ?? null,
        ...PLAN_METADATA[planKey],
      };
    }

    return NextResponse.json({ success: true, plans });
  } catch (error) {
    console.error('❌ /api/plans error:', error);
    return NextResponse.json({ error: 'Failed to fetch plans' }, { status: 500 });
  }
}
