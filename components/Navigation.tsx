
import React, { useState } from 'react';
import { AppScreen, ProfileType } from '../types';

interface NavigationProps {
  currentScreen: AppScreen;
  profileType: ProfileType;
  unlockedItems?: string[];
  onNavigate: (screen: AppScreen) => void;
  onLogout: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  isAdmin?: boolean;
}

const Navigation: React.FC<NavigationProps> = ({ currentScreen, profileType, unlockedItems = [], onNavigate, onLogout, theme, onToggleTheme, isAdmin }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isAdult = profileType === ProfileType.ADULTS;

  const navItems = [
    { id: 'HOME', label: 'Início', icon: '🏠' },
    { id: 'BIBLE', label: 'Bíblia', icon: '📖' },
    { id: 'RANKING', label: 'Ranking', icon: '🏆' },
    { id: 'CHALLENGES', label: 'Desafios', icon: '🎯' },
    { id: 'GAMES', label: 'Jogar', icon: '🎮' },
    ...(!isAdult ? [
      { id: 'SHOP', label: 'Lojinha', icon: '🛍️' }
    ] : []),
    ...(!isAdult ? [
      { id: 'ART_MISSION', label: 'Desenhar', icon: '🎨' },
      { id: 'READING', label: 'Minha Voz', icon: '🎤' },
      { id: 'GALLERY', label: 'Galeria', icon: '🖼️' }
    ] : []),
  ];

  return (
    <>

      {/* HEADER UNIVERSAL (MOBILE, TABLET, DESKTOP) */}
      <div className="fixed top-0 left-0 right-0 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl h-20 flex items-center justify-between px-6 z-[70] border-b border-white/20 dark:border-gray-800 transition-all duration-300">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-xl flex items-center justify-center text-2xl">
            📖
          </div>
          <h1 className="text-xl font-black font-outfit text-indigo-900 dark:text-indigo-100 tracking-tight">FiliF Bible+</h1>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onToggleTheme}
            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800/50 flex items-center justify-center text-lg hover:scale-110 transition-transform active:scale-95"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>

          {isAdmin && (
            <button
              onClick={() => onNavigate('ADMIN_PANEL')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 text-white text-xs font-black uppercase tracking-widest hover:shadow-lg hover:shadow-rose-500/30 transition-all active:scale-95"
            >
              Painel
            </button>
          )}

          <button
            onClick={() => setIsMenuOpen(true)}
            className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center text-lg hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/30 transition-all active:scale-95"
          >
            ☰
          </button>
        </div>
      </div>

      {/* BARRA INFERIOR MOBILE (APENAS MOBILE) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-t border-gray-200 dark:border-gray-800 flex justify-around items-center h-[4.5rem] md:hidden z-[60] pb-safe">
        <button onClick={() => onNavigate('HOME')} className={`flex flex-col items-center justify-center flex-1 h-full space-y-1 transition-colors ${currentScreen === 'HOME' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}>
          <span className={`text-xl transition-transform ${currentScreen === 'HOME' ? 'scale-110' : ''}`}>🏠</span>
          <span className="text-[10px] font-bold tracking-wide">Início</span>
        </button>
        <button onClick={() => onNavigate('RANKING')} className={`flex flex-col items-center justify-center flex-1 h-full space-y-1 transition-colors ${currentScreen === 'RANKING' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}>
          <span className={`text-xl transition-transform ${currentScreen === 'RANKING' ? 'scale-110' : ''}`}>🏆</span>
          <span className="text-[10px] font-bold tracking-wide">Ranking</span>
        </button>
        <button onClick={() => onNavigate('BIBLE')} className={`flex flex-col items-center justify-center flex-1 h-full space-y-1 transition-colors ${currentScreen === 'BIBLE' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}>
          <span className={`text-xl transition-transform ${currentScreen === 'BIBLE' ? 'scale-110' : ''}`}>📖</span>
          <span className="text-[10px] font-bold tracking-wide">Bíblia</span>
        </button>
        <button onClick={() => setIsMenuOpen(true)} className={`flex flex-col items-center justify-center flex-1 h-full space-y-1 transition-colors ${isMenuOpen ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}>
          <span className="text-xl">☰</span>
          <span className="text-[10px] font-bold tracking-wide">Menu</span>
        </button>
      </nav>

      {/* MENU OVERLAY POPUP (Aparece ao clicar nos 3 traços em qualquer tela) */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300" onClick={() => setIsMenuOpen(false)}>
          <div
            className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-[3rem] p-8 md:p-12 shadow-2xl animate-in zoom-in-95 duration-300 overflow-y-auto max-h-[90vh]"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center space-x-3">
                <span className="text-4xl">🌟</span>
                <h2 className="text-3xl font-black font-outfit text-indigo-900 dark:text-white">Explorar FiliF</h2>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="w-12 h-12 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-full text-gray-500 hover:text-red-500 transition-colors text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { onNavigate(item.id as AppScreen); setIsMenuOpen(false); }}
                  className={`flex flex-col items-center justify-center p-6 md:p-8 rounded-[2.5rem] transition-all group active:scale-95 ${currentScreen === item.id
                    ? 'bg-indigo-600 text-white shadow-xl ring-4 ring-indigo-200 dark:ring-indigo-900/50'
                    : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-600'
                    }`}
                >
                  <span className="text-4xl md:text-5xl mb-4 group-hover:scale-110 transition-transform">{item.icon}</span>
                  <span className="text-xs md:text-sm font-black uppercase tracking-widest text-center leading-tight">{item.label}</span>
                </button>
              ))}
            </div>

            <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-4 justify-center">
              <button
                onClick={() => { onNavigate('PROFILE'); setIsMenuOpen(false); }}
                className="flex items-center justify-center space-x-3 px-10 py-5 rounded-[2rem] bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-black hover:scale-105 transition-transform"
              >
                <span className="text-xl">👤</span>
                <span className="uppercase tracking-widest text-sm">Meu Perfil</span>
              </button>
              <button
                onClick={() => { onLogout(); setIsMenuOpen(false); }}
                className="flex items-center justify-center space-x-3 px-10 py-5 rounded-[2rem] bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 font-black hover:scale-105 transition-transform"
              >
                <span className="text-xl">🚪</span>
                <span className="uppercase tracking-widest text-sm">Sair</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navigation;
