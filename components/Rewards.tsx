
import React from 'react';
import { REWARD_LEVELS } from '../constants';

interface RewardsProps {
  points: number;
}

const Rewards: React.FC<RewardsProps> = ({ points }) => {
  const currentLevel = [...REWARD_LEVELS].reverse().find(l => points >= l.points) || REWARD_LEVELS[0];
  const nextLevel = REWARD_LEVELS.find(l => l.points > points);
  
  const progress = nextLevel 
    ? ((points - currentLevel.points) / (nextLevel.points - currentLevel.points)) * 100 
    : 100;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto mb-20">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold font-outfit text-gray-800">Sua Jornada Espiritual</h2>
        <p className="text-gray-500">Acumule pontos para subir de nível e desbloquear bênçãos digitais.</p>
      </div>

      <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-indigo-100 border border-indigo-50 mb-8 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-10 text-9xl">{currentLevel.icon}</div>
        <div className="relative z-10">
          <p className="text-indigo-600 font-bold uppercase tracking-widest text-sm mb-2">Nível Atual: {currentLevel.level}</p>
          <h3 className="text-4xl font-black text-indigo-900 mb-6">{currentLevel.title}</h3>
          
          <div className="flex justify-between items-end mb-2">
            <span className="text-indigo-600 font-bold">{points} Pontos</span>
            {nextLevel && <span className="text-gray-400 text-sm">Próximo: {nextLevel.points}</span>}
          </div>
          
          <div className="w-full h-4 bg-indigo-50 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          {nextLevel && (
            <p className="text-gray-400 text-xs mt-3">Faltam {nextLevel.points - points} pontos para o nível {nextLevel.level}</p>
          )}
        </div>
      </div>

      <h4 className="text-xl font-bold text-gray-800 mb-6">Conquistas e Recompensas</h4>
      <div className="grid gap-4">
        {REWARD_LEVELS.map((lvl) => {
          const isUnlocked = points >= lvl.points;
          return (
            <div 
              key={lvl.level}
              className={`p-6 rounded-3xl flex items-center space-x-5 transition-all ${
                isUnlocked 
                  ? 'bg-white border border-indigo-100 shadow-sm' 
                  : 'bg-gray-50 border border-transparent grayscale'
              }`}
            >
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-sm ${
                isUnlocked ? 'bg-indigo-100' : 'bg-gray-200'
              }`}>
                {lvl.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h5 className={`font-bold ${isUnlocked ? 'text-gray-800' : 'text-gray-400'}`}>
                    Nível {lvl.level}: {lvl.title}
                  </h5>
                  {isUnlocked && <span className="text-emerald-500 font-bold text-xs uppercase">Concluído</span>}
                </div>
                <p className="text-sm text-gray-500">Desbloqueia em {lvl.points} pontos</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Rewards;
