'use client';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { ProfileType } from '@/types';

const ProfileView = dynamic(() => import('@/components/ProfileView'), {
  loading: () => <div>Carregando perfil...</div>,
});

export default function ProfilePage() {
  const router = useRouter();
  const dummyProfile = { id: '1', name: 'User', type: ProfileType.ADULTS, points: 0, coins: 0, unlockedItems: [], streak: 0, favorites: [], gallery: [], recordings: [], paintings: [], is_admin: false, is_blocked: false, lastChallengeDate: null, lastArtDate: null, lastVideoDate: null };

  return (
    <ProfileView
      profile={dummyProfile}
      onUpdateProfile={() => {}}
      onSwitchProfile={() => router.push('/home')}
      onLogout={() => {}}
      onBack={() => router.push('/home')}
    />
  );
}
