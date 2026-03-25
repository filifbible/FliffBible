'use client';
import dynamic from 'next/dynamic';

// SDK do Mercado Pago usa window — sem SSR
const SubscriptionCheckout = dynamic(() => import('@/components/SubscriptionCheckout'), {
  ssr: false,
  loading: () => <div>Carregando checkout...</div>,
});

export default function SubscriptionPage() {
  return <SubscriptionCheckout userEmail="user@example.com" userId="1" />;
}
