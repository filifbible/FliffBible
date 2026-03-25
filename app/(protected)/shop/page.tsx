'use client';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

const Shop = dynamic(() => import('@/components/Shop'), {
  loading: () => <div>Carregando loja...</div>,
});

export default function ShopPage() {
  const router = useRouter();
  
  return (
    <Shop
      coins={0}
      unlockedItems={[]}
      onBuy={() => {}}
      onBack={() => router.push('/home')}
    />
  );
}
