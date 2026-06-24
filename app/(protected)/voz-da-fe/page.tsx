'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { ProfileService } from '@/services/profileService';
import { AudioRecording } from '@/types';

const BibleReadingKids = dynamic(() => import('@/components/BibleReadingKids'), {
  loading: () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-indigo-50/50 dark:bg-gray-900">
      <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-indigo-600 font-bold animate-pulse">Preparando estúdio...</p>
    </div>
  ),
});

export default function VozDaFePage() {
  const router = useRouter();
  const [profileId, setProfileId] = useState<string | null>(null);
  const [recordings, setRecordings] = useState<AudioRecording[]>([]);

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
          setRecordings(profile.recordings || []);
        }
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
      }
    }
    loadProfile();
  }, [router]);

  const handleSaveRecording = async (audioData: Blob | string, ref: string) => {
    if (!profileId) return;
    
    let audioUrl = typeof audioData === 'string' ? audioData : '';

    // Se for Blob (nova gravação), faz o upload para o Supabase Storage
    if (audioData instanceof Blob) {
      const { supabase } = await import('@/services/supabase');
      if (!supabase) {
        alert('Supabase não está configurado.');
        return;
      }

      const fileName = `${profileId}/${Date.now()}.webm`;
      
      const { data, error } = await supabase.storage
        .from('recordings')
        .upload(fileName, audioData, {
          contentType: audioData.type || 'audio/webm',
          upsert: false
        });

      if (error) {
        console.error('Erro ao fazer upload do áudio para o Supabase:', error);
        alert('Erro ao salvar o áudio. O bucket "recordings" foi criado e é público?');
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('recordings')
        .getPublicUrl(fileName);
        
      audioUrl = publicUrl;
    }
    
    const newRecording: AudioRecording = {
      id: Date.now().toString(),
      ref,
      audio: audioUrl,
      date: new Date().toLocaleDateString('pt-BR'),
    };

    let newRecordings = [...recordings, newRecording];
    
    // Deixa no máximo 6 gravações, excluindo a mais antiga (no início do array)
    if (newRecordings.length > 6) {
      const recordsToRemove = newRecordings.slice(0, newRecordings.length - 6);
      newRecordings = newRecordings.slice(newRecordings.length - 6);
      
      // Apagar arquivos antigos do Supabase
      try {
        const { supabase } = await import('@/services/supabase');
        if (supabase) {
          const pathsToRemove = recordsToRemove
            .map(rec => rec.audio.split('/recordings/')[1])
            .filter(Boolean); // Pega apenas a parte do path
          
          if (pathsToRemove.length > 0) {
            await supabase.storage.from('recordings').remove(pathsToRemove);
          }
        }
      } catch (err) {
        console.error("Erro ao apagar áudio antigo do storage", err);
      }
    }
    
    try {
      await ProfileService.updateProfile(profileId, {
        recordings: newRecordings,
      });
      setRecordings(newRecordings);
    } catch (error) {
      console.error('Erro ao salvar gravação:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white dark:from-gray-950 dark:to-gray-900 pt-8">
      <BibleReadingKids
        onSaveRecording={handleSaveRecording}
        recordings={recordings}
        onBack={() => router.back()}
      />
    </div>
  );
}
