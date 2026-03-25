'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

/**
 * Layout do Route Group (protected).
 * Verifica sessão Supabase e redireciona para /auth se não autenticado.
 * Verifica premium e redireciona para /subscription se necessário.
 */
export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.replace('/auth');
        return;
      }

      // Verifica status premium via API route
      try {
        const res = await fetch('/api/subscription-status', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });

        if (res.ok) {
          const { isActive } = await res.json();
          // Rota /subscription é permitida mesmo sem premium
          const pathname = window.location.pathname;
          if (!isActive && !pathname.startsWith('/subscription')) {
            router.replace('/subscription');
            return;
          }
        }
      } catch {
        // Continua em caso de erro na verificação de premium
      }

      setChecking(false);
    }

    checkAuth();
  }, [router]);

  if (checking) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#0f172a',
        color: '#94a3b8',
      }}>
        Verificando acesso...
      </div>
    );
  }

  return <>{children}</>;
}
