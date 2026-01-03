
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
}

const Navigation: React.FC<NavigationProps> = ({ currentScreen, profileType, unlockedItems = [], onNavigate, onLogout, theme, onToggleTheme }) => {
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
      <div className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md h-16 flex items-center justify-between px-6 z-[70] border-b border-gray-100 dark:border-gray-800">
         <div className="flex items-center space-x-3">
            <span className="text-2xl">📖</span>
            <h1 className="text-xl font-black font-outfit text-indigo-900 dark:text-indigo-400">FiliF Bible+</h1>
         </div>
         
         <div className="flex items-center space-x-2">
            <button 
              onClick={onToggleTheme}
              className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-lg hover:scale-105 transition-transform"
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            <button 
              onClick={() => setIsMenuOpen(true)}
              className="p-2.5 rounded-xl bg-indigo-600 text-white text-lg hover:bg-indigo-700 transition-colors"
            >
              ☰
            </button>
         </div>
      </div>

      {/* BARRA INFERIOR MOBILE (APENAS MOBILE) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-around items-center h-16 md:hidden z-[60]">
        <button onClick={() => onNavigate('HOME')} className={`flex flex-col items-center flex-1 ${currentScreen === 'HOME' ? 'text-indigo-600' : 'text-gray-400'}`}>
          <span className="text-xl">🏠</span>
          <span className="text-[10px] font-bold">Início</span>
        </button>
        <button onClick={() => onNavigate('RANKING')} className={`flex flex-col items-center flex-1 ${currentScreen === 'RANKING' ? 'text-indigo-600' : 'text-gray-400'}`}>
          <span className="text-xl">🏆</span>
          <span className="text-[10px] font-bold">Ranking</span>
        </button>
        <button onClick={() => onNavigate('BIBLE')} className={`flex flex-col items-center flex-1 ${currentScreen === 'BIBLE' ? 'text-indigo-600' : 'text-gray-400'}`}>
          <span className="text-xl">📖</span>
          <span className="text-[10px] font-bold">Bíblia</span>
        </button>
        <button onClick={() => setIsMenuOpen(true)} className={`flex flex-col items-center flex-1 ${isMenuOpen ? 'text-indigo-600' : 'text-gray-400'}`}>
          <span className="text-xl">☰</span>
          <span className="text-[10px] font-bold">Menu</span>
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
                  className={`flex flex-col items-center justify-center p-6 md:p-8 rounded-[2.5rem] transition-all group active:scale-95 ${
                    currentScreen === item.id 
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
