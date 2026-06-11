'use client';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ProfileService } from '@/services/profileService';

const BibleGame = dynamic(() => import('@/components/BibleGame'), {
  loading: () => <div>Carregando jogos...</div>,
});

export default function GamesPage() {
  const router = useRouter();
  const [profileId, setProfileId] = useState<string | null>(null);

  useEffect(() => {
    const id = localStorage.getItem('selectedProfileId');
    if (id) setProfileId(id);
  }, []);

  const handleWin = async (coins: number) => {
    if (profileId && coins > 0) {
      try {
        await ProfileService.addRewards(profileId, coins, coins);
      } catch (err) {
        console.error("Erro ao salvar recompensa do jogo:", err);
      }
    }
  };

  return (
    <BibleGame
      onWin={handleWin}
      onBack={() => router.push('/dashboard')}
    />
  );
}
