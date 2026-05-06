
import React, { useState } from 'react';
import { Database } from '../services/database';
import { AuthService } from '../services/authService';
import { CommandBus } from '../commands/command-bus';
import { AuthenticateCommand } from '../commands/handlers/authenticate.handler';

const commandBus = CommandBus.getInstance();

interface AuthScreenProps {
  onAuthComplete: (email: string) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthComplete }) => {
  const [view, setView] = useState<'LOGIN' | 'REGISTER' | 'FORGOT_PASSWORD'>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const isRegistering = view === 'REGISTER';
  const isForgotPassword = view === 'FORGOT_PASSWORD';

  const validatePassword = (pass: string) => {
    const minLength = pass.length >= 5;
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>_]/.test(pass);
    return { minLength, hasSpecialChar };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const cleanEmail = email.toLowerCase().trim();

    try {
      if (isForgotPassword) {
        // Recuperação de senha
        await AuthService.resetPassword(cleanEmail);
        setResetEmailSent(true);
        setLoading(false);
        return;
      }

      if (isRegistering) {
        // Validações de senha
        const { minLength, hasSpecialChar } = validatePassword(password);
        if (!minLength) {
          setError('A senha precisa ter no mínimo 5 letras.');
          setLoading(false);
          return;
        }
        if (!hasSpecialChar) {
          setError('A senha precisa ter pelo menos um caractere especial (ex: @, #, $).');
          setLoading(false);
          return;
        }

        // Registrar via CommandBus
        try {
          await commandBus.execute(new AuthenticateCommand({
            email: cleanEmail,
            password,
            isRegister: true,
            fullName: fullName || undefined,
          }));
          onAuthComplete(cleanEmail);
        } catch (supabaseError: any) {
          // Fallback para localStorage se Supabase falhar
          console.warn('Supabase registration failed, using localStorage:', supabaseError.message);
          await new Promise(r => setTimeout(r, 600));
          const success = await Database.register(cleanEmail, password);
          if (success) {
            onAuthComplete(cleanEmail);
          } else {
            setError('Este e-mail já está registrado.');
            setLoading(false);
          }
        }
      } else {
        // Login via CommandBus
        try {
          await commandBus.execute(new AuthenticateCommand({ email: cleanEmail, password }));
          onAuthComplete(cleanEmail);
        } catch (supabaseError: any) {
          // Fallback para localStorage se Supabase falhar
          console.warn('Supabase login failed, using localStorage:', supabaseError.message);
          await new Promise(r => setTimeout(r, 600));
          const isValid = await Database.login(cleanEmail, password);
          if (isValid) {
            onAuthComplete(cleanEmail);
          } else {
            setError('E-mail ou senha incorretos.');
            setLoading(false);
          }
        }
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      setError(error.message || 'Erro ao processar sua solicitação. Tente novamente.');
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center p-6 transition-colors duration-300 relative overflow-hidden font-outfit">

      {/* Background Blobs */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 bg-blob-indigo"></div>
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 bg-blob-pink"></div>

      <div className="bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl w-full max-w-md rounded-[3rem] shadow-2xl shadow-indigo-200/50 dark:shadow-none p-8 md:p-12 border border-white/50 dark:border-gray-800/50 relative z-10">
        <div className="text-center mb-10">
          <div className="relative mb-6 inline-block">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[2rem] mx-auto flex items-center justify-center text-5xl shadow-lg shadow-indigo-500/30 animate-bounce duration-[3000ms]" style={{ animationIterationCount: 'infinite', animationTimingFunction: 'ease-in-out' }}>
              📖
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-16 h-4 bg-indigo-900/20 blur-xl rounded-full"></div>
          </div>
          <h1 className="text-4xl font-black text-indigo-900 dark:text-white tracking-tight mb-2">FiliF Bible+</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            {isForgotPassword ? 'Recuperar senha' : isRegistering ? 'Crie sua conta agora' : 'Acesse seus estudos'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 text-sm font-bold rounded-2xl border border-red-100 dark:border-red-900/30 animate-in fade-in slide-in-from-top-1 flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 ml-1">E-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full bg-gray-50 dark:bg-gray-800/50 border-2 border-transparent focus:border-indigo-500 rounded-2xl px-5 py-4 text-gray-800 dark:text-white focus:bg-white dark:focus:bg-gray-800 transition-all outline-none placeholder:text-gray-400"
            />
          </div>

          {isRegistering && (
            <div className="animate-in fade-in slide-in-from-top-2">
              <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 ml-1">
                Nome Completo (Opcional)
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Seu nome completo"
                className="w-full bg-gray-50 dark:bg-gray-800/50 border-2 border-transparent focus:border-indigo-500 rounded-2xl px-5 py-4 text-gray-800 dark:text-white focus:bg-white dark:focus:bg-gray-800 transition-all outline-none placeholder:text-gray-400"
              />
            </div>
          )}

          {!isForgotPassword && (
            <div className="animate-in fade-in slide-in-from-top-2">
              <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 ml-1">Senha</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-gray-50 dark:bg-gray-800/50 border-2 border-transparent focus:border-indigo-500 rounded-2xl px-5 py-4 text-gray-800 dark:text-white focus:bg-white dark:focus:bg-gray-800 transition-all outline-none placeholder:text-gray-400"
              />
              {isRegistering && (
                <p className="text-[10px] text-gray-400 mt-2 ml-1 font-medium">Mínimo 5 letras e um símbolo (!@#$)</p>
              )}
            </div>
          )}

          {/* Mensagem de sucesso para reset de senha */}
          {isForgotPassword && resetEmailSent && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-2xl border border-emerald-200 dark:border-emerald-800 animate-in fade-in slide-in-from-top-2">
              <p className="font-bold text-sm">✉️ Email enviado!</p>
              <p className="text-xs mt-1">Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || (isForgotPassword && resetEmailSent)}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-indigo-500/20 dark:shadow-none hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center text-lg uppercase tracking-widest mt-4"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            ) : isForgotPassword ? (
              resetEmailSent ? 'Email Enviado ✓' : 'Enviar Link'
            ) : (
              isRegistering ? 'Criar Conta' : 'Entrar'
            )}
          </button>
        </form>

        <div className="mt-8 text-center space-y-4">
          {!isForgotPassword && !isRegistering && (
            <button
              onClick={() => { setView('FORGOT_PASSWORD'); setError(''); setResetEmailSent(false); }}
              className="text-sm text-indigo-500 dark:text-indigo-400 font-bold hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
            >
              Esqueci minha senha
            </button>
          )}

          <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
            <button
              onClick={() => {
                setView(isForgotPassword ? 'LOGIN' : isRegistering ? 'LOGIN' : 'REGISTER');
                setError('');
                setResetEmailSent(false);
              }}
              className="text-gray-600 dark:text-gray-300 font-bold hover:text-indigo-600 dark:hover:text-white transition-colors"
            >
              {isForgotPassword
                ? '← Voltar para login'
                : isRegistering
                  ? 'Já tem conta? Entre aqui'
                  : 'Não tem conta? Registre-se'
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
