'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

import { supabase } from '@/services/supabase';
import { AccountService } from '@/services/accountService';

const AdminPanel = dynamic(() => import('@/components/AdminPanel'), {
  ssr: false,
  loading: () => <div className="min-h-screen flex items-center justify-center font-bold text-gray-500">Carregando painel...</div>,
});

export default function GlobalAdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!supabase) throw new Error('Serviço de autenticação indisponível.');

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError || !data.user) {
        throw new Error(signInError?.message || 'Erro ao fazer login. Verifique suas credenciais.');
      }

      // Verifica se a conta possui a tag de administrador
      const account = await AccountService.getAccount(data.user.id);
      const isAccountAdmin = account?.is_admin === true;

      if (!isAccountAdmin) {
        await supabase.auth.signOut();
        throw new Error('Acesso negado. Esta conta não possui privilégios de administrador.');
      }

      setIsAuthenticated(true);
    } catch (err: any) {
      setError(err.message || 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 font-outfit">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl w-full max-w-md border border-gray-100 dark:border-gray-700">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-gray-800 dark:text-white tracking-tight">Admin System</h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium mt-2">Faça login com sua conta de Administrador</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E-mail de administrador"
                className="w-full px-5 py-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 dark:text-white font-bold text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                required
              />
            </div>
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Senha"
                className="w-full px-5 py-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 dark:text-white font-bold text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm text-center font-bold">{error}</p>}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-indigo-600 text-white font-black text-lg py-4 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Entrando...' : 'Acessar Painel'}
            </button>
          </form>
          
          <div className="mt-6 text-center">
             <button onClick={() => router.push('/')} className="text-sm font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                Voltar para o início
             </button>
          </div>
        </div>
      </div>
    );
  }

  return <AdminPanel onBack={() => router.push('/')} />;
}
