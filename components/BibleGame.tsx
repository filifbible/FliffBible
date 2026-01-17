
import React, { useState } from 'react';
import MemoryGame from './MemoryGame';
import CatchGame from './CatchGame';
import RockGame from './RockGame';

interface BibleGameProps {
  onWin: (coins: number) => void;
  onBack: () => void;
}

const BibleGame: React.FC<BibleGameProps> = ({ onWin, onBack }) => {
  const [activeGame, setActiveGame] = useState<'MENU' | 'MEMORY' | 'CATCH' | 'ROCK'>('MENU');

  if (activeGame === 'MEMORY') {
    return <MemoryGame onWin={onWin} onBack={() => setActiveGame('MENU')} />;
  }

  if (activeGame === 'CATCH') {
    return <CatchGame onWin={onWin} onBack={() => setActiveGame('MENU')} />;
  }

  if (activeGame === 'ROCK') {
    return <RockGame onWin={onWin} onBack={() => setActiveGame('MENU')} />;
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto mb-24 animate-in fade-in duration-500">
      <div className="text-center mb-12 relative">
        <button
          onClick={onBack}
          className="absolute left-0 top-1/2 -translate-y-1/2 p-3 bg-white dark:bg-gray-800 rounded-xl shadow-md text-xl hover:scale-105 transition-transform hidden md:block"
        >
          ⬅️
        </button>
        <h2 className="text-4xl md:text-5xl font-black font-outfit text-indigo-900 dark:text-indigo-400">Jogos da Fé 🎮</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Aprenda brincando com as histórias da Bíblia!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div
          onClick={() => setActiveGame('MEMORY')}
          className="bg-white dark:bg-gray-800 p-8 rounded-[3.5rem] shadow-xl border-4 border-indigo-50 dark:border-gray-700 hover:border-indigo-400 cursor-pointer transition-all group flex flex-col items-center text-center"
        >
          <div className="text-8xl mb-6 group-hover:scale-110 transition-transform">🧠</div>
          <h3 className="text-2xl font-black text-gray-800 dark:text-white mb-2">Memória da Fé</h3>
          <p className="text-gray-400 text-sm leading-relaxed mb-6">Encontre os pares dos personagens bíblicos!</p>
          <span className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-widest group-hover:bg-indigo-700">Jogar</span>
        </div>

        <div
          onClick={() => setActiveGame('CATCH')}
          className="bg-white dark:bg-gray-800 p-8 rounded-[3.5rem] shadow-xl border-4 border-indigo-50 dark:border-gray-700 hover:border-blue-400 cursor-pointer transition-all group flex flex-col items-center text-center"
        >
          <div className="text-8xl mb-6 group-hover:scale-110 transition-transform">🍎</div>
          <h3 className="text-2xl font-black text-gray-800 dark:text-white mb-2">Chuva de Bênçãos</h3>
          <p className="text-gray-400 text-sm leading-relaxed mb-6">Capture as palavras dos versículos no céu!</p>
          <span className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-widest group-hover:bg-blue-700">Jogar</span>
        </div>

        <div
          onClick={() => setActiveGame('ROCK')}
          className="bg-white dark:bg-gray-800 p-8 rounded-[3.5rem] shadow-xl border-4 border-emerald-50 dark:border-gray-700 hover:border-emerald-400 cursor-pointer transition-all group flex flex-col items-center text-center"
        >
          <div className="text-8xl mb-6 group-hover:scale-110 transition-transform">🏠</div>
          <h3 className="text-2xl font-black text-gray-800 dark:text-white mb-2">A Casa na Rocha</h3>
          <p className="text-gray-400 text-sm leading-relaxed mb-6">Construa sua casa sobre a rocha firme de Jesus!</p>
          <span className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-widest group-hover:bg-emerald-700">Jogar</span>
        </div>
      </div>

      <div className="mt-16 bg-yellow-50 dark:bg-yellow-900/10 p-8 rounded-[3rem] border-4 border-dashed border-yellow-100 dark:border-yellow-900/40 text-center">
        <h4 className="text-xl font-black text-yellow-700 dark:text-yellow-400 mb-2">Sabia que... 💡</h4>
        <p className="text-yellow-600 dark:text-yellow-500/80 italic text-sm">"Quem ouve as palavras de Jesus e as pratica é como o homem sábio que constrói sua casa sobre a rocha!"</p>
      </div>
    </div>
  );
};

export default BibleGame;
