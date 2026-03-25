'use client';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

const GalleryView = dynamic(() => import('@/components/GalleryView'), {
  loading: () => <div>Carregando galeria...</div>,
});

export default function GalleryPage() {
  const router = useRouter();

  return (
    <GalleryView
      images={[]}
      onBack={() => router.push('/home')}
    />
  );
}
