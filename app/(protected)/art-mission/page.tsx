'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { ProfileService } from '@/services/profileService';
import { ArtMissionTheme } from '@/types';

const PhysicalArtMission = dynamic(() => import('@/components/PhysicalArtMission'), {
  loading: () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-pink-50/50 dark:bg-gray-900">
      <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-pink-600 font-bold animate-pulse">Buscando sua missão artística...</p>
    </div>
  ),
});

export default function ArtMissionPage() {
  const router = useRouter();
  const [profileId, setProfileId] = useState<string | null>(null);
  const [lastArtDate, setLastArtDate] = useState<string | null>(null);
  const [savedTheme, setSavedTheme] = useState<ArtMissionTheme | null>(null);

  useEffect(() => {
    const id = localStorage.getItem('selectedProfileId');
    if (!id) {
      router.replace('/home');
      return;
    }
    setProfileId(id);

    async function loadProfile() {
      try {
        const profile = await ProfileService.getProfile(id!);
        if (profile) {
          setLastArtDate(profile.last_art_date || null);
          // Suporte a ambos os padrões de nomenclatura encontrados no código
          const theme = (profile as any).art_mission_theme || (profile as any).artMissionTheme;
          setSavedTheme(theme || null);
        }
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
      }
    }
    loadProfile();
  }, [router]);

  const handleSave = async (base64: string) => {
    if (!profileId) return;

    try {
      // Salva a imagem na galeria
      await ProfileService.addToArray(profileId, 'gallery', base64);
      
      // Registra que a missão foi concluída hoje
      await ProfileService.updateLastActivity(profileId, 'art');
      
      // Recompensa o usuário (ex: 50 moedas)
      await ProfileService.addRewards(profileId, 0, 50);

      router.push('/dashboard');
    } catch (error) {
      console.error('Erro ao salvar missão:', error);
      alert('Houve um erro ao salvar sua arte. Por favor, tente novamente!');
    }
  };

  const handleThemeGenerated = async (theme: ArtMissionTheme) => {
    if (!profileId) return;
    try {
      // Salva o tema gerado no perfil para persistência no mesmo dia
      await ProfileService.updateProfile(profileId, { 
        ['art_mission_theme' as any]: theme 
      });
    } catch (error) {
      console.error('Erro ao salvar tema:', error);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const isCompleted = lastArtDate === todayStr;

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white dark:from-gray-950 dark:to-gray-900">
      <PhysicalArtMission
        onSave={handleSave}
        onCancel={() => router.back()}
        onHome={() => router.push('/dashboard')}
        onThemeGenerated={handleThemeGenerated}
        savedTheme={savedTheme || undefined}
        isCompleted={isCompleted}
      />
    </div>
  );
}
