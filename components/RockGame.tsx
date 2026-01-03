
import React, { useState, useEffect, useRef } from 'react';

interface Block {
  id: number;
  y: number;
  x: number;
  width: number;
  color: string;
  word: string;
}

const VIRTUES = ["AMOR", "FÉ", "PAZ", "BONDADE", "ALEGRIA", "PERDÃO", "ESPERANÇA"];
const COLORS = ["#FF595E", "#FFCA3A", "#8AC926", "#1982C4", "#6A4C93", "#F4A261", "#E76F51"];

const RockGame: React.FC<{ onWin: (coins: number) => void; onBack: () => void }> = ({ onWin, onBack }) => {
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'WON' | 'LOST'>('START');
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [swingX, setSwingX] = useState(50);
  const [swingDir, setSwingDir] = useState(1);
  const [isDropping, setIsDropping] = useState(false);
  const [currentY, setCurrentY] = useState(10);
  const [currentX, setCurrentX] = useState(50);
  const [score, setScore] = useState(0);

  const requestRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  const startNewGame = () => {
    setGameState('PLAYING');
    setBlocks([]);
    setScore(0);
    setIsDropping(false);
    setCurrentY(10);
  };

  const dropBlock = () => {
    if (isDropping || gameState !== 'PLAYING') return;
    setIsDropping(true);
    setCurrentX(swingX);
  };

  useEffect(() => {
    const animate = (time: number) => {
      const deltaTime = time - lastTimeRef.current;
      lastTimeRef.current = time;

      if (gameState === 'PLAYING') {
        // Balanço do bloco no topo
        if (!isDropping) {
          setSwingX(prev => {
            const speed = 0.15 + (score * 0.02);
            let next = prev + (swingDir * speed * deltaTime / 16);
            if (next > 80) { setSwingDir(-1); return 80; }
            if (next < 20) { setSwingDir(1); return 20; }
            return next;
          });
        } else {
          // Queda do bloco
          setCurrentY(prev => {
            const next = prev + 1.2 * (deltaTime / 16);
            
            // Checar colisão
            const targetY = blocks.length === 0 ? 85 : blocks[blocks.length - 1].y - 8;
            
            if (next >= targetY) {
              const baseCenter = blocks.length === 0 ? 50 : blocks[blocks.length - 1].x;
              const diff = Math.abs(currentX - baseCenter);
              
              if (diff < 15) { // Sucesso no empilhamento
                const newBlock: Block = {
                  id: Date.now(),
                  x: currentX,
                  y: targetY,
                  width: 30 - (diff * 0.5),
                  color: COLORS[score % COLORS.length],
                  word: VIRTUES[score % VIRTUES.length]
                };
                
                setBlocks(prevBlocks => [...prevBlocks, newBlock]);
                setScore(s => s + 1);
                setIsDropping(false);
                setCurrentY(10);
                
                if (score + 1 >= 7) {
                  setGameState('WON');
                  onWin(3);
                }
              } else {
                setGameState('LOST');
              }
              return next;
            }
            return next;
          });
        }
      }
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [gameState, isDropping, swingDir, score, blocks, currentX]);

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto h-[700px] flex flex-col mb-24 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 bg-white dark:bg-gray-800 p-4 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
        <button onClick={onBack} className="bg-gray-100 dark:bg-gray-700 px-5 py-2 rounded-xl text-gray-500 font-black hover:text-red-500 transition-all">← Sair</button>
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Andares</span>
          <span className="text-xl font-black text-emerald-600">{score}/7</span>
        </div>
        <div className="bg-emerald-600 text-white px-6 py-2 rounded-full font-black text-sm shadow-lg">ROCHA</div>
      </div>

      <div 
        onClick={dropBlock}
        className="flex-1 bg-gradient-to-b from-blue-100 to-blue-200 dark:from-indigo-950 dark:to-indigo-900 rounded-[3rem] relative overflow-hidden select-none border-4 border-white dark:border-gray-800 shadow-2xl cursor-pointer"
      >
        {/* Nuvens e Sol */}
        <div className="absolute top-10 right-10 text-6xl opacity-20">☀️</div>
        <div className="absolute top-20 left-10 text-4xl opacity-30 animate-pulse">☁️</div>

        {gameState === 'START' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-white/40 backdrop-blur-md z-50">
             <div className="text-9xl mb-8 animate-bounce">🏠</div>
             <h3 className="text-4xl font-black text-indigo-900 dark:text-indigo-400 mb-4 font-outfit">A Casa na Rocha</h3>
             <p className="text-gray-700 dark:text-gray-200 mb-10 font-bold max-w-xs leading-relaxed">
               Jesus é a nossa Rocha! Empilhe as virtudes para construir uma casa que nunca cai. Toque para soltar o bloco!
             </p>
             <button onClick={startNewGame} className="bg-emerald-600 text-white px-16 py-5 rounded-[2.5rem] font-black text-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all border-b-8 border-emerald-800">CONSTRUIR!</button>
          </div>
        )}

        {/* O Bloco Balançando/Caindo */}
        {gameState === 'PLAYING' && (
          <div 
            className="absolute h-10 flex items-center justify-center rounded-2xl shadow-lg border-b-4 border-black/20 text-white font-black text-xs md:text-sm"
            style={{ 
              left: `${isDropping ? currentX : swingX}%`, 
              top: `${currentY}%`, 
              width: '120px',
              backgroundColor: COLORS[score % COLORS.length],
              transform: 'translateX(-50%)',
              zIndex: 30
            }}
          >
            {VIRTUES[score % VIRTUES.length]}
          </div>
        )}

        {/* Guindaste (Linha do topo) */}
        {gameState === 'PLAYING' && !isDropping && (
          <div className="absolute top-0 w-1 h-[10%] bg-gray-400/50" style={{ left: `${swingX}%` }} />
        )}

        {/* Blocos Empilhados */}
        {blocks.map(block => (
          <div 
            key={block.id}
            className="absolute h-10 flex items-center justify-center rounded-2xl shadow-md border-b-4 border-black/10 text-white font-black text-xs md:text-sm animate-in slide-in-from-top-2"
            style={{ 
              left: `${block.x}%`, 
              top: `${block.y}%`, 
              width: `${block.width * 4}px`, 
              backgroundColor: block.color,
              transform: 'translateX(-50%)',
              zIndex: 20
            }}
          >
            {block.word}
          </div>
        ))}

        {/* A Rocha (Base) */}
        <div className="absolute bottom-0 left-0 right-0 h-[10%] bg-[#5d4037] flex items-center justify-center">
           <div className="w-[40%] h-full bg-[#3e2723] rounded-t-[3rem] flex items-center justify-center border-t-8 border-white/10">
              <span className="text-white font-black text-lg md:text-xl tracking-[0.2em]">JESUS</span>
           </div>
        </div>

        {/* Resultado: Vitória ou Derrota */}
        {(gameState === 'WON' || gameState === 'LOST') && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-white/95 dark:bg-gray-950/95 z-50 animate-in zoom-in-95 duration-500">
             <div className="text-9xl mb-8">{gameState === 'WON' ? '🌟' : '🌊'}</div>
             <h3 className="text-5xl font-black text-gray-800 dark:text-white mb-4 font-outfit">
               {gameState === 'WON' ? 'SÁBIO!' : 'OPS!'}
             </h3>
             <p className="text-gray-500 text-xl mb-10 leading-relaxed max-w-xs">
               {gameState === 'WON' 
                 ? 'Sua casa está firme! Você construiu sua vida na Palavra de Deus.' 
                 : 'A areia não aguentou... Mas não desanime! Vamos tentar construir na Rocha agora?'}
             </p>
             
             {gameState === 'WON' && (
               <div className="bg-yellow-100 dark:bg-yellow-900/30 px-10 py-5 rounded-[2.5rem] mb-12 border-2 border-yellow-200">
                  <p className="text-4xl font-black text-yellow-700 dark:text-yellow-400">+ 3 🪙 Recompensa!</p>
               </div>
             )}

             <div className="flex gap-4 w-full max-w-sm">
                <button onClick={onBack} className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-500 py-5 rounded-3xl font-black text-lg">Menu</button>
                <button onClick={startNewGame} className="flex-[2] bg-emerald-600 text-white py-5 rounded-3xl font-black text-xl shadow-2xl border-b-8 border-emerald-800">Tentar de Novo</button>
             </div>
          </div>
        )}
      </div>

      <p className="mt-6 text-center text-gray-400 font-bold italic text-sm">
        "E caiu a chuva, e correram os rios, e assopraram ventos, e combateram aquela casa, e não caiu, porque estava edificada sobre a rocha." 📖
      </p>
    </div>
  );
};

export default RockGame;
