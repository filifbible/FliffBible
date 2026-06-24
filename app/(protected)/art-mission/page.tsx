'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { ProfileService } from '@/services/profileService';
import { ArtMissionTheme } from '@/types';
import { galleryService } from '@/services/galleryService';

const PaintingRoom = dynamic(() => import('@/components/PaintingRoom'), {
  loading: () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-pink-50/50 dark:bg-gray-900">
      <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-pink-600 font-bold animate-pulse">Buscando o ateliê...</p>
    </div>
  ),
});

export default function ArtMissionPage() {
  const router = useRouter();
  const [profileId, setProfileId] = useState<string | null>(null);
  const [lastArtDate, setLastArtDate] = useState<string | null>(null);
  const [savedTheme, setSavedTheme] = useState<ArtMissionTheme | null>(null);
  const [savedPaintings, setSavedPaintings] = useState<string[]>([]);
  const [unlockedItems, setUnlockedItems] = useState<string[]>([]);

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
          const theme = (profile as any).art_mission_theme || (profile as any).artMissionTheme;
          setSavedTheme(theme || null);
          setUnlockedItems(profile.unlocked_items || []);
          
          // Carregar pinturas da galeria
          try {
            const urls = await galleryService.listImages(id!);
            setSavedPaintings(urls);
          } catch (e) {
            console.error('Erro ao carregar imagens da galeria', e);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
      }
    }
    loadProfile();
  }, [router]);

  const handleSave = async (imagePathOrBase64: string, isPhysical: boolean) => {
    if (isPhysical) {
      router.push('/dashboard');
    } else {
      if (!profileId) return;
      try {
        // Upload via gallery service directly
        const path = await galleryService.uploadImage(imagePathOrBase64, profileId);
        // Atualiza a galeria com as imagens
        const urls = await galleryService.listImages(profileId);
        setSavedPaintings(urls);
      } catch (e) {
        console.error(e);
        alert('Erro ao salvar sua arte digital.');
      }
    }
  };

  const handleThemeGenerated = async (theme: ArtMissionTheme) => {
    if (!profileId) return;
    try {
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
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white dark:from-gray-950 dark:to-gray-900 pt-8">
      <PaintingRoom
        onSave={handleSave}
        savedPaintings={savedPaintings}
        unlockedItems={unlockedItems}
        onNavigateToShop={() => router.push('/shop')}
        initialMode="SELECTION"
        artMissionTheme={savedTheme || undefined}
        onArtMissionThemeGenerated={handleThemeGenerated}
        isArtMissionCompleted={isCompleted}
        onBack={() => router.push('/dashboard')}
      />
    </div>
  );
}
