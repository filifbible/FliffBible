'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('❌ Erro na página raiz:', error);
  }, [error]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: '#0f172a',
      color: '#f8fafc',
      fontFamily: 'sans-serif',
      padding: '2rem',
      textAlign: 'center',
    }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>❌ Erro ao carregar a página</h1>
      <p style={{ color: '#94a3b8', marginBottom: '2rem', maxWidth: '600px' }}>
        {error?.message || 'Erro desconhecido'}
      </p>
      <button
        onClick={reset}
        style={{
          padding: '0.75rem 2rem',
          background: '#4f46e5',
          color: 'white',
          border: 'none',
          borderRadius: '0.5rem',
          cursor: 'pointer',
          fontSize: '1rem',
        }}
      >
        Tentar novamente
      </button>
    </div>
  );
}
