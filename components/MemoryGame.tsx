
import React, { useState, useEffect } from 'react';

const BIBLE_ICONS = [
  { icon: '🚢', name: 'Arca' },
  { icon: '🦁', name: 'Daniel' },
  { icon: '🐟', name: 'Jonas' },
  { icon: '🍇', name: 'Promessa' },
  { icon: '⛪', name: 'Igreja' },
  { icon: '📜', name: 'Lei' },
  { icon: '⭐', name: 'Jesus' },
  { icon: '🕊️', name: 'Pomba' }
];

interface Card {
  id: number;
  icon: string;
  name: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface MemoryGameProps {
  onWin: (coins: number) => void;
  onBack: () => void;
}

const MemoryGame: React.FC<MemoryGameProps> = ({ onWin, onBack }) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM'>('EASY');
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    let interval: any;
    if (gameStarted && !cards.every(c => c.isMatched)) {
      interval = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [gameStarted, cards]);

  const initGame = (diff: 'EASY' | 'MEDIUM') => {
    const iconCount = diff === 'EASY' ? 4 : 8;
    const selectedIcons = BIBLE_ICONS.slice(0, iconCount);
    const gameCards = [...selectedIcons, ...selectedIcons]
      .sort(() => Math.random() - 0.5)
      .map((item, index) => ({
        id: index,
        ...item,
        isFlipped: false,
        isMatched: false
      }));
    
    setCards(gameCards);
    setFlippedCards([]);
    setMoves(0);
    setTimer(0);
    setDifficulty(diff);
    setGameStarted(true);
  };

  const handleCardClick = (id: number) => {
    if (flippedCards.length === 2 || cards[id].isFlipped || cards[id].isMatched) return;

    const newCards = [...cards];
    newCards[id].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedCards, id];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [first, second] = newFlipped;
      
      if (cards[first].name === cards[second].name) {
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            (c.id === first || c.id === second) ? { ...c, isMatched: true } : c
          ));
          setFlippedCards([]);
          
          const allMatched = newCards.every(c => c.isMatched || c.id === first || c.id === second);
          if (allMatched) {
            const reward = difficulty === 'EASY' ? 1 : 2;
            onWin(reward);
          }
        }, 600);
      } else {
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            (c.id === first || c.id === second) ? { ...c, isFlipped: false } : c
          ));
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  const isGameWon = gameStarted && cards.length > 0 && cards.every(c => c.isMatched);

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto mb-24 animate-in fade-in duration-500">
      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>

      <div className="flex items-center justify-between mb-10">
        <button onClick={onBack} className="bg-gray-100 dark:bg-gray-800 p-3 rounded-2xl text-gray-500 hover:text-indigo-600 transition-all">← Voltar</button>
        <h2 className="text-3xl font-black font-outfit text-indigo-900 dark:text-indigo-400">Memória da Fé</h2>
        <div className="w-10"></div>
      </div>

      {!gameStarted || isGameWon ? (
        <div className="bg-white dark:bg-gray-800 rounded-[3rem] p-12 text-center shadow-xl border-4 border-indigo-50 dark:border-gray-700">
          <div className="text-8xl mb-6">{isGameWon ? '🎉' : '🧠'}</div>
          <h3 className="text-3xl font-black text-gray-800 dark:text-white mb-4">
            {isGameWon ? 'Missão Cumprida!' : 'Pronto para o Desafio?'}
          </h3>
          {isGameWon && (
            <div className="mb-8 p-6 bg-indigo-50 dark:bg-indigo-900/30 rounded-3xl inline-block">
              <p className="text-indigo-600 dark:text-indigo-400 font-bold">Tempo: {timer}s | Movimentos: {moves}</p>
              <p className="text-2xl font-black text-yellow-600 mt-2">Recompensa: +{difficulty === 'EASY' ? 1 : 2} 🪙</p>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-sm mx-auto">
            <button onClick={() => initGame('EASY')} className="py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all text-lg">Nível Fácil</button>
            <button onClick={() => initGame('MEDIUM')} className="py-4 bg-purple-600 text-white font-black rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all text-lg">Nível Médio</button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
             <div className="flex items-center space-x-6">
                <div className="flex flex-col text-center">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Movimentos</span>
                  <span className="font-black text-xl text-indigo-600">{moves}</span>
                </div>
                <div className="w-px h-8 bg-gray-100 dark:bg-gray-700"></div>
                <div className="flex flex-col text-center">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tempo</span>
                  <span className="font-black text-xl text-indigo-600">{timer}s</span>
                </div>
             </div>
             <button onClick={() => setGameStarted(false)} className="bg-red-50 text-red-500 px-4 py-2 rounded-xl font-bold text-sm">Reiniciar</button>
          </div>

          <div className="grid gap-4 perspective-1000" style={{ gridTemplateColumns: `repeat(${difficulty === 'EASY' ? 2 : 4}, 1fr)` }}>
            {cards.map((card) => (
              <div key={card.id} onClick={() => handleCardClick(card.id)} className="aspect-square cursor-pointer relative group">
                <div className={`w-full h-full transition-all duration-500 preserve-3d relative ${card.isFlipped || card.isMatched ? 'rotate-y-180' : ''}`}>
                  <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-3xl border-4 border-indigo-300 shadow-lg flex items-center justify-center">
                    <span className="text-4xl md:text-6xl text-white font-black opacity-40">?</span>
                  </div>
                  <div className={`absolute inset-0 backface-hidden rotate-y-180 bg-white dark:bg-gray-700 rounded-3xl border-4 shadow-xl flex items-center justify-center text-5xl md:text-6xl ${card.isMatched ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20' : 'border-indigo-100 dark:border-gray-600'}`}>
                    <span className={card.isMatched ? 'animate-bounce' : ''}>{card.icon}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MemoryGame;
