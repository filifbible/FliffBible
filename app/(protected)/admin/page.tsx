'use client';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

// AdminPanel is heavy (~33KB) — loads only when admin accesses
const AdminPanel = dynamic(() => import('@/components/AdminPanel'), {
  ssr: false,
  loading: () => <div>Carregando painel...</div>,
});

export default function AdminPage() {
  const router = useRouter();
  
  return <AdminPanel onBack={() => router.push('/home')} />;
}
