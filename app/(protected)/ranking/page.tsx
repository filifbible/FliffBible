'use client';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

const RankingView = dynamic(() => import('@/components/RankingView'), {
  loading: () => <div>Carregando ranking...</div>,
});

export default function RankingPage() {
  const router = useRouter();
  
  return (
    <RankingView
      profiles={[]}
      currentProfileId={null}
      onBack={() => router.push('/home')}
    />
  );
}
