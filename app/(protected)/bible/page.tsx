'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

const BibleReader = dynamic(() => import('@/components/BibleReader'), {
  loading: () => <div>Carregando bíblia...</div>,
});

export default function BiblePage() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<string[]>([]);
  
  return (
    <BibleReader
      onBack={() => router.push('/home')}
      favorites={favorites}
      onFavorite={(ref) => setFavorites(prev => prev.includes(ref) ? prev.filter(r => r !== ref) : [...prev, ref])}
    />
  );
}
