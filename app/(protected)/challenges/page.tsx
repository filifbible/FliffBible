'use client';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

const VerseChallenges = dynamic(() => import('@/components/VerseChallenges'), {
  loading: () => <div>Carregando desafios...</div>,
});

export default function ChallengesPage() {
  const router = useRouter();
  
  // Dummy user data to satisfy props
  const dummyUser = { id: '1', score: 0, completedTasks: [] };

  return (
    <VerseChallenges
      onComplete={() => {}}
      onGoToBible={() => router.push('/bible')}
      lastChallengeDate={null}
      unlockedItems={[]}
      onBack={() => router.push('/home')}
    />
  );
}
