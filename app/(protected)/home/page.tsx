'use client';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

const ProfileSelector = dynamic(() => import('@/components/ProfileSelector'), {
  loading: () => <div>Carregando perfis...</div>,
});

export default function HomePage() {
  const router = useRouter();

  return (
    <ProfileSelector
      profiles={[]}
      onSelect={(id) => {}}
      onCreate={() => {}}
      onUpdate={() => {}}
      onLogout={() => {}}
      unlockedItems={[]}
    />
  );
}
