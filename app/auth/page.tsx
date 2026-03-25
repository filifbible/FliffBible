'use client';
import { useRouter } from 'next/navigation';
import AuthScreen from '@/components/AuthScreen';

export default function AuthPage() {
  const router = useRouter();
  return <AuthScreen onAuthComplete={() => router.push('/home')} />;
}
