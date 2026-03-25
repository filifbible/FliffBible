import { MercadoPagoConfig, PreApproval, PreApprovalPlan, Payment } from 'mercadopago';

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

export const preApproval     = new PreApproval(client);
export const preApprovalPlan = new PreApprovalPlan(client);
export const payment         = new Payment(client);

// IDs dos planos MP (carregados em runtime via /api/plans)
export const PLAN_EXTERNAL_REFS = {
  familia: 'filif-bible-familia-monthly-v4',
  anual:   'filif-bible-anual-yearly-v4',
} as const;

export const PLAN_METADATA = {
  familia: { name: 'Família +',  price: 29.90,  frequency: 'monthly' as const },
  anual:   { name: 'Anual',     price: 299.00, frequency: 'yearly'  as const },
} as const;
