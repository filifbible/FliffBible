'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { supabase } from '@/services/supabase';
import { ProfileService } from '@/services/profileService';
import { ProfileType } from '@/types';
import { CommandBus } from '@/commands/command-bus';
import { LogoutCommand } from '@/commands/handlers/logout.handler';

const commandBus = CommandBus.getInstance();

const ProfileSelector = dynamic(() => import('@/components/ProfileSelector'), {
  loading: () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      Carregando perfis...
    </div>
  ),
});

export default function HomePage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [accountId, setAccountId] = useState<string | null>(null);

  // Carrega os perfis do usuário logado
  const loadProfiles = useCallback(async () => {
    if (!supabase) { router.replace('/auth'); return; }
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      router.replace('/auth');
      return;
    }
    setAccountId(session.user.id);
    const data = await ProfileService.getProfiles(session.user.id);
    // Normaliza para o formato esperado pelo ProfileSelector
    const normalized = data.map((p) => ({
      id:            p.id,
      name:          p.name,
      type:          p.profile_type,
      avatar:        p.avatar || '😊',
      points:        p.points,
      coins:         p.coins,
      streak:        p.streak,
      unlockedItems: p.unlocked_items || [],
    }));
    setProfiles(normalized);
  }, [router]);

  useEffect(() => { loadProfiles(); }, [loadProfiles]);

  const handleCreate = async (name: string, type: ProfileType, avatar: string) => {
    if (!accountId) return;
    try {
      await ProfileService.createProfile(accountId, name, type, avatar);
      await loadProfiles(); // Recarrega a lista do Supabase
    } catch (err) {
      console.error('Erro ao criar perfil:', err);
    }
  };

  const handleUpdate = async (id: string, name: string, avatar: string) => {
    try {
      await ProfileService.updateProfileInfo(id, name, avatar);
      await loadProfiles();
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err);
    }
  };

  const handleLogout = async () => {
    await commandBus.execute(new LogoutCommand());
    router.replace('/auth');
  };

  return (
    <ProfileSelector
      profiles={profiles}
      onSelect={(id) => {
        localStorage.setItem('selectedProfileId', id);
        router.push('/dashboard');
      }}
      onCreate={handleCreate}
      onUpdate={handleUpdate}
      onLogout={handleLogout}
      unlockedItems={[]}
    />
  );
}
