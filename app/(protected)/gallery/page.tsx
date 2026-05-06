'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { ProfileService } from '@/services/profileService';

const GalleryView = dynamic(() => import('@/components/GalleryView'), {
  loading: () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-gray-950">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-blue-600 font-bold animate-pulse">Carregando sua galeria...</p>
    </div>
  ),
});

export default function GalleryPage() {
  const router = useRouter();
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    const profileId = localStorage.getItem('selectedProfileId');
    if (!profileId) {
      router.replace('/home');
      return;
    }

    async function loadGallery() {
      try {
        const profile = await ProfileService.getProfile(profileId!);
        if (profile && profile.gallery) {
          setImages(profile.gallery);
        }
      } catch (error) {
        console.error('Erro ao carregar galeria:', error);
      }
    }
    loadGallery();
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <GalleryView
        images={images}
        onBack={() => router.back()}
      />
    </div>
  );
}
