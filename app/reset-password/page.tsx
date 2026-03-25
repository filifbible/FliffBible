'use client';
import { useRouter } from 'next/navigation';
import ResetPasswordScreen from '@/components/ResetPasswordScreen';

export default function ResetPasswordPage() {
  const router = useRouter();
  return <ResetPasswordScreen onComplete={() => router.push('/auth')} />;
}
