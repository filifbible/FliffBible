import React, { useState } from 'react';
import { AuthService } from '../services/authService';

interface ResetPasswordScreenProps {
  onComplete: () => void;
}

const ResetPasswordScreen: React.FC<ResetPasswordScreenProps> = ({ onComplete }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const validatePassword = (pass: string) => {
    const minLength = pass.length >= 5;
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>_]/.test(pass);
    return { minLength, hasSpecialChar };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    const { minLength, hasSpecialChar } = validatePassword(newPassword);
    if (!minLength) {
      setError('A senha precisa ter no mínimo 5 caracteres');
      return;
    }
    if (!hasSpecialChar) {
      setError('A senha precisa ter pelo menos um caractere especial (ex: @, #, $)');
      return;
    }

    setLoading(true);

    try {
      await AuthService.updatePassword(newPassword);
      setSuccess(true);
      setTimeout(() => {
        onComplete();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar senha');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-indigo-50 dark:bg-gray-950 flex items-center justify-center p-6 transition-colors duration-300">
      <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-[3rem] shadow-2xl shadow-indigo-200/50 dark:shadow-none p-8 md:p-12 border border-white dark:border-gray-800">
        <div className="text-center mb-8">
          <div className="relative mb-6">
            <div className="w-24 h-24 bg-indigo-600 rounded-[2rem] mx-auto flex items-center justify-center text-5xl shadow-xl shadow-indigo-200 dark:shadow-none">
              🔐
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-16 h-2 bg-indigo-900/5 blur-md rounded-full"></div>
          </div>
          <h1 className="text-4xl font-black font-outfit text-indigo-900 dark:text-indigo-400 tracking-tight">Redefinir Senha</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">
            {success ? 'Senha atualizada!' : 'Crie uma nova senha para sua conta'}
          </p>
        </div>

        {success ? (
          <div className="text-center animate-in zoom-in-95 duration-500">
            <div className="text-8xl mb-6">✅</div>
            <h2 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mb-4">Senha Atualizada!</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">Redirecionando para o login...</p>
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-bold rounded-2xl border border-red-100 dark:border-red-900/30 animate-in fade-in slide-in-from-top-1">
                ⚠️ {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">Nova Senha</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl px-5 py-4 text-gray-800 dark:text-white focus:bg-white dark:focus:bg-gray-700 transition-all outline-none"
              />
              <p className="text-[10px] text-gray-400 mt-2 ml-1">Mínimo 5 letras e um símbolo (!@#$)</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">Confirmar Nova Senha</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl px-5 py-4 text-gray-800 dark:text-white focus:bg-white dark:focus:bg-gray-700 transition-all outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-indigo-200 dark:shadow-none hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center text-lg uppercase tracking-widest"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                'Atualizar Senha'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordScreen;
