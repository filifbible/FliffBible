'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { createClient } from '@supabase/supabase-js';
import { ProfileService } from '@/services/profileService';
import { ProfileData, ProfileType } from '@/types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

const ProfileView = dynamic(() => import('@/components/ProfileView'), {
  loading: () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      Carregando perfil...
    </div>
  ),
});

export default function ProfilePage() {
  const router = useRouter();
  const params = useParams();
  const profileId = params?.id as string;

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    if (!profileId) return;
    setLoading(true);
    try {
      const data = await ProfileService.getProfile(profileId);
      if (!data) { router.replace('/home'); return; }

      setProfile({
        id:               data.id,
        name:             data.name,
        type:             (data.profile_type as ProfileType) ?? ProfileType.ADULTS,
        avatar:           data.avatar ?? undefined,
        bio:              data.bio ?? undefined,
        points:           data.points,
        coins:            data.coins,
        streak:           data.streak,
        unlockedItems:    data.unlocked_items ?? [],
        favorites:        data.favorites ?? [],
        gallery:          data.gallery ?? [],
        recordings:       data.recordings ?? [],
        paintings:        data.paintings ?? [],
        lastChallengeDate: data.last_challenge_date,
        lastArtDate:      data.last_art_date,
        lastVideoDate:    data.last_video_date,
        is_admin:         data.is_admin,
        is_blocked:       data.is_blocked,
      });
    } catch (err) {
      console.error('Erro ao carregar perfil:', err);
      router.replace('/home');
    } finally {
      setLoading(false);
    }
  }, [profileId, router]);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  const handleUpdateProfile = async (id: string, name: string, avatar: string, bio?: string) => {
    await ProfileService.updateProfileInfo(id, name, avatar, bio);
    await loadProfile();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/auth');
  };

  if (loading || !profile) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif', color: '#64748b' }}>
        Carregando perfil...
      </div>
    );
  }

  return (
    <ProfileView
      profile={profile}
      onUpdateProfile={handleUpdateProfile}
      onSwitchProfile={() => router.push('/home')}
      onLogout={handleLogout}
      onBack={() => router.push('/home')}
    />
  );
}
