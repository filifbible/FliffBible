'use client';

import { useEffect, useState } from 'react';

interface MaintenanceInfo {
  is_active: boolean;
  title: string;
  message: string;
  estimated_return: string | null;
}

export default function MaintenancePage() {
  const [info, setInfo] = useState<MaintenanceInfo>({
    is_active: true,
    title: 'Sistema em Manutenção',
    message: 'Estamos realizando melhorias para oferecer uma experiência ainda melhor. Voltaremos em breve!',
    estimated_return: null,
  });

  useEffect(() => {
    fetch('/api/maintenance')
      .then(r => r.json())
      .then(data => setInfo(data))
      .catch(() => {/* keep defaults */});
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0a0f1e]">
      {/* Animated gradient background */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-20 animate-pulse"
          style={{
            background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)',
            animationDuration: '4s',
          }}
        />
        <div
          className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-15 animate-pulse"
          style={{
            background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)',
            animationDuration: '6s',
            animationDelay: '2s',
          }}
        />
        <div
          className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[400px] h-[400px] rounded-full opacity-10 animate-pulse"
          style={{
            background: 'radial-gradient(circle, #ec4899 0%, transparent 70%)',
            animationDuration: '5s',
            animationDelay: '1s',
          }}
        />
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Main card */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 py-12 max-w-xl w-full mx-4">
        {/* Icon animation */}
        <div className="relative mb-8">
          <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center shadow-2xl shadow-indigo-500/40"
            style={{ animation: 'float 3s ease-in-out infinite' }}>
            <span style={{ fontSize: '3.5rem', lineHeight: 1 }}>🔧</span>
          </div>
          {/* Pulse rings */}
          <div className="absolute inset-0 rounded-3xl opacity-30 animate-ping"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              animationDuration: '2s',
            }}
          />
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight leading-tight">
          {info.title}
        </h1>

        {/* Divider */}
        <div className="w-16 h-1 rounded-full mb-6"
          style={{ background: 'linear-gradient(90deg, #6366f1, #ec4899)' }}
        />

        {/* Message */}
        <p className="text-lg text-gray-300 leading-relaxed font-medium mb-8 max-w-md">
          {info.message}
        </p>

        {/* Estimated return */}
        {info.estimated_return && (
          <div className="mb-8 px-6 py-4 rounded-2xl border border-indigo-500/30 bg-indigo-500/10 backdrop-blur-sm">
            <p className="text-indigo-300 font-bold text-sm uppercase tracking-widest mb-1">
              Previsão de Retorno
            </p>
            <p className="text-white font-black text-xl">
              {info.estimated_return}
            </p>
          </div>
        )}

        {/* Loading dots */}
        <div className="flex items-center gap-3 mb-10">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-2.5 h-2.5 rounded-full bg-indigo-400"
              style={{
                animation: 'bounce 1.4s ease-in-out infinite',
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>

        {/* Status bar */}
        <div className="w-full max-w-xs bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest mb-3">
            <span className="text-gray-400">Status do Sistema</span>
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              Manutenção
            </span>
          </div>
          {/* Progress bar animation */}
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                background: 'linear-gradient(90deg, #6366f1, #ec4899)',
                width: '65%',
                animation: 'progress 3s ease-in-out infinite alternate',
              }}
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes progress {
          0% { width: 40%; }
          100% { width: 85%; }
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
          40% { transform: translateY(-10px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
