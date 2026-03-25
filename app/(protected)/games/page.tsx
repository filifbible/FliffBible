'use client';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

const BibleGame = dynamic(() => import('@/components/BibleGame'), {
  loading: () => <div>Carregando jogos...</div>,
});

export default function GamesPage() {
  const router = useRouter();

  return (
    <BibleGame
      onWin={(coins) => {}}
      onBack={() => router.push('/home')}
    />
  );
}
