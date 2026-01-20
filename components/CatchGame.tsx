
import React, { useState, useEffect, useRef } from 'react';

const VERSES = [
  { text: "Deus é amor", words: ["Deus", "é", "amor"] },
  { text: "Jesus me ama", words: ["Jesus", "me", "ama"] },
  { text: "O Senhor é luz", words: ["O", "Senhor", "é", "luz"] },
  { text: "Creia no Senhor", words: ["Creia", "no", "Senhor"] },
  { text: "Tudo posso em Deus", words: ["Tudo", "posso", "em", "Deus"] }
];

interface FallingItem {
  id: number;
  content: string;
  x: number;
  y: number;
  speed: number;
  type: 'WORD' | 'ROCK' | 'COIN';
}

interface CatchGameProps {
  onWin: (coins: number) => void;
  onBack: () => void;
}

const CatchGame: React.FC<CatchGameProps> = ({ onWin, onBack }) => {
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'WON' | 'LOST'>('START');
  const [currentVerseIdx, setCurrentVerseIdx] = useState(0);
  const [nextWordIdx, setNextWordIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [items, setItems] = useState<FallingItem[]>([]);
  const [playerPosition, setPlayerPosition] = useState(50);
  const [coinsEarned, setCoinsEarned] = useState(0);

  // Refs para manter valores atualizados dentro do loop sem causar re-renders ou reinícios de efeito
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const playerPosRef = useRef(50);
  const nextWordIdxRef = useRef(0);
  const itemsRef = useRef<FallingItem[]>([]);
  const lastSpawnRef = useRef<number>(0);
  const scoreRef = useRef(0);

  const currentVerse = VERSES[currentVerseIdx];
  const targetWord = currentVerse.words[nextWordIdx];

  const startGame = () => {
    scoreRef.current = 0;
    nextWordIdxRef.current = 0;
    itemsRef.current = [];
    playerPosRef.current = 50;
    
    setGameState('PLAYING');
    setLives(3);
    setScore(0);
    setNextWordIdx(0);
    setCurrentVerseIdx(Math.floor(Math.random() * VERSES.length));
    setItems([]);
    setCoinsEarned(0);
    lastSpawnRef.current = Date.now();
  };

  const spawnItem = () => {
    const isRock = Math.random() < 0.25;
    const isCoin = !isRock && Math.random() < 0.15;
    
    let content = "🪨";
    let type: 'WORD' | 'ROCK' | 'COIN' = 'ROCK';

    if (isCoin) {
      content = "🪙";
      type = 'COIN';
    } else if (!isRock) {
      const currentTarget = VERSES[currentVerseIdx].words[nextWordIdxRef.current];
      const shouldSpawnTarget = Math.random() < 0.45;
      
      if (shouldSpawnTarget && currentTarget) {
        content = currentTarget;
      } else {
        const randomVerse = VERSES[Math.floor(Math.random() * VERSES.length)];
        content = randomVerse.words[Math.floor(Math.random() * randomVerse.words.length)];
      }
      type = 'WORD';
    }

    const newItem: FallingItem = {
      id: Math.random(),
      content,
      x: Math.random() * 85 + 7.5,
      y: -5,
      speed: 0.15 + (scoreRef.current * 0.005) + (Math.random() * 0.15),
      type
    };

    itemsRef.current.push(newItem);
  };

  // Game Loop Principal
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    let frameId: number;
    
    const update = () => {
      // 1. Mover itens
      itemsRef.current = itemsRef.current
        .map(item => ({ ...item, y: item.y + item.speed }))
        .filter(item => item.y < 105);

      // 2. Spawnar novos itens
      const spawnInterval = Math.max(800, 1500 - (scoreRef.current * 10));
      if (Date.now() - lastSpawnRef.current > spawnInterval) {
        spawnItem();
        lastSpawnRef.current = Date.now();
      }

      // 3. Checar Colisões
      const remainingItems: FallingItem[] = [];
      for (const item of itemsRef.current) {
        const collided = item.y > 82 && item.y < 92 && Math.abs(item.x - playerPosRef.current) < 12;
        
        if (collided) {
          handleCollision(item);
        } else {
          remainingItems.push(item);
        }
      }
      itemsRef.current = remainingItems;

      // 4. Atualizar Estado Visual (uma vez por frame)
      setItems([...itemsRef.current]);
      
      frameId = requestAnimationFrame(update);
    };

    frameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frameId);
  }, [gameState, currentVerseIdx]);

  const handleCollision = (item: FallingItem) => {
    if (item.type === 'ROCK') {
      setLives(l => {
        const next = l - 1;
        if (next <= 0) setGameState('LOST');
        return next;
      });
    } else if (item.type === 'COIN') {
      setCoinsEarned(c => c + 1);
      scoreRef.current += 15;
      setScore(scoreRef.current);
    } else if (item.type === 'WORD') {
      const currentTarget = VERSES[currentVerseIdx].words[nextWordIdxRef.current];
      if (item.content === currentTarget) {
        scoreRef.current += 20;
        setScore(scoreRef.current);
        
        const nextIdx = nextWordIdxRef.current + 1;
        if (nextIdx >= VERSES[currentVerseIdx].words.length) {
          // Versículo completo
          nextWordIdxRef.current = 0;
          setNextWordIdx(0);
          
          // Atualizar moedas ganhas
          setCoinsEarned(c => {
            const newCoinsEarned = c + 2;
            
            if (scoreRef.current >= 150) {
              setGameState('WON');
              // Passar o total correto de moedas (incluindo o bônus de vitória)
              onWin(newCoinsEarned + 5);
            }
            
            return newCoinsEarned;
          });
          
          if (scoreRef.current < 150) {
            // Próximo versículo aleatório
            setCurrentVerseIdx(prev => {
              let next = Math.floor(Math.random() * VERSES.length);
              return next === prev ? (next + 1) % VERSES.length : next;
            });
          }
        } else {
          nextWordIdxRef.current = nextIdx;
          setNextWordIdx(nextIdx);
        }
      } else {
        // Palavra errada
        setLives(l => {
          const next = l - 1;
          if (next <= 0) setGameState('LOST');
          return next;
        });
      }
    }
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (gameState !== 'PLAYING' || !gameAreaRef.current) return;
    const rect = gameAreaRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const x = ((clientX - rect.left) / rect.width) * 100;
    const clampedX = Math.max(10, Math.min(90, x));
    playerPosRef.current = clampedX;
    setPlayerPosition(clampedX);
  };

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto h-[650px] flex flex-col mb-24 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-4 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <button onClick={onBack} className="bg-gray-100 dark:bg-gray-700 p-2 px-4 rounded-xl text-gray-500 font-bold hover:bg-red-50 hover:text-red-500 transition-all">← Sair</button>
        <div className="flex space-x-2 bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-full">
          {Array.from({ length: 3 }).map((_, i) => (
            <span key={i} className={`text-xl transition-all ${i < lives ? 'filter-none grayscale-0 scale-110' : 'filter grayscale opacity-30 scale-90'}`}>❤️</span>
          ))}
        </div>
        <div className="bg-indigo-600 text-white px-5 py-2 rounded-full font-black text-sm shadow-lg">Pontos: {score}</div>
      </div>

      <div 
        ref={gameAreaRef}
        onMouseMove={handleMove}
        onTouchMove={handleMove}
        className="flex-1 bg-gradient-to-b from-blue-100 to-blue-300 dark:from-indigo-950 dark:to-indigo-900 rounded-[3rem] relative overflow-hidden cursor-none border-4 border-white dark:border-gray-800 shadow-2xl"
      >
        {/* Nuvens decorativas */}
        <div className="absolute top-10 left-[10%] text-5xl opacity-30 animate-pulse">☁️</div>
        <div className="absolute top-24 left-[70%] text-6xl opacity-20 animate-bounce">☁️</div>

        {gameState === 'START' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-white/40 backdrop-blur-md z-50">
             <div className="text-9xl mb-8 animate-bounce">🍎</div>
             <h3 className="text-4xl font-black text-indigo-900 mb-4 font-outfit">Chuva de Bênçãos</h3>
             <p className="text-gray-700 mb-10 font-bold max-w-xs leading-relaxed">Capture as palavras do versículo na ordem certa! Cuidado com as pedras! 🪨</p>
             <button onClick={startGame} className="bg-indigo-600 text-white px-16 py-5 rounded-[2rem] font-black text-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all border-b-8 border-indigo-800">COMEÇAR!</button>
          </div>
        )}

        {gameState === 'PLAYING' && (
          <>
            <div className="absolute top-6 left-0 right-0 text-center px-4 z-20">
               <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl px-8 py-4 rounded-3xl inline-block shadow-xl border-2 border-indigo-200">
                  <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-1">Próxima Palavra</p>
                  <p className="text-3xl font-black text-indigo-900 dark:text-white animate-pulse">{targetWord || "..."}</p>
               </div>
            </div>

            {items.map(item => (
              <div 
                key={item.id}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-shadow pointer-events-none ${
                  item.type === 'WORD' 
                    ? 'bg-white dark:bg-indigo-600 px-6 py-3 rounded-full shadow-xl border-2 border-indigo-100 dark:border-indigo-400 font-black text-indigo-900 dark:text-white text-lg' 
                    : item.type === 'COIN' ? 'text-4xl drop-shadow-md animate-bounce' : 'text-4xl drop-shadow-lg'
                }`}
                style={{ 
                  left: `${item.x}%`, 
                  top: `${item.y}%`,
                  zIndex: 10
                }}
              >
                {item.content}
              </div>
            ))}

            <div 
              className="absolute bottom-12 w-28 h-20 flex items-center justify-center pointer-events-none"
              style={{ 
                left: `${playerPosition}%`, 
                transform: 'translateX(-50%)',
                zIndex: 30
              }}
            >
              <div className="text-7xl drop-shadow-2xl filter transform hover:scale-110 transition-transform">🚢</div>
              <div className="absolute -bottom-2 w-16 h-4 bg-black/20 rounded-full blur-md"></div>
            </div>
          </>
        )}

        {(gameState === 'WON' || gameState === 'LOST') && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-white/95 dark:bg-gray-950/95 z-50 animate-in zoom-in-95 duration-300">
             <div className="text-9xl mb-8">{gameState === 'WON' ? '🌈' : '⛈️'}</div>
             <h3 className="text-5xl font-black text-gray-800 dark:text-white mb-4 font-outfit">
               {gameState === 'WON' ? 'Vitória!' : 'Tente de Novo!'}
             </h3>
             <p className="text-gray-500 text-xl mb-8">Sua pontuação final foi: <span className="text-indigo-600 font-black">{score}</span></p>
             
             {coinsEarned > 0 && (
               <div className="bg-yellow-100 dark:bg-yellow-900/30 px-8 py-4 rounded-3xl mb-10 border-2 border-yellow-200">
                  <p className="text-3xl font-black text-yellow-700 dark:text-yellow-400">+ {coinsEarned} 🪙 coletadas!</p>
               </div>
             )}

             <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
                <button onClick={onBack} className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-500 py-5 rounded-3xl font-black text-lg hover:bg-gray-200 transition-all">Menu</button>
                <button onClick={startGame} className="flex-[2] bg-indigo-600 text-white py-5 rounded-3xl font-black text-xl shadow-2xl border-b-8 border-indigo-800 hover:scale-105 active:scale-95 transition-all">Jogar Novamente</button>
             </div>
          </div>
        )}
      </div>
      
      {gameState === 'PLAYING' && (
        <div className="mt-6 p-5 bg-white dark:bg-gray-800 rounded-[2rem] border-2 border-indigo-50 dark:border-gray-700 shadow-lg flex items-center space-x-4 overflow-x-auto no-scrollbar">
          <div className="flex-shrink-0 bg-indigo-100 dark:bg-indigo-900/40 p-2 px-4 rounded-xl text-indigo-600 dark:text-indigo-400 font-black text-xs uppercase">Seu Versículo:</div>
          <div className="flex items-center space-x-3">
            {currentVerse.words.map((w, i) => (
              <span key={i} className={`text-lg font-black whitespace-nowrap px-4 py-2 rounded-2xl transition-all duration-300 ${
                i < nextWordIdx 
                  ? 'bg-emerald-500 text-white scale-90 opacity-50' 
                  : i === nextWordIdx 
                    ? 'bg-indigo-600 text-white shadow-lg scale-110 ring-4 ring-indigo-100' 
                    : 'bg-gray-50 dark:bg-gray-700 text-gray-300 dark:text-gray-600'
              }`}>
                {w}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CatchGame;
