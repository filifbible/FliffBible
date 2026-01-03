
import React, { useState, useRef, useEffect } from 'react';
import PhysicalArtMission from './PhysicalArtMission';
import { ArtMissionTheme } from '../types';

interface PaintingRoomProps {
  onSave: (base64: string, isPhysical: boolean) => void;
  savedPaintings: string[];
  unlockedItems: string[];
  onNavigateToShop: () => void;
  initialMode?: 'SELECTION' | 'COLORING' | 'PIXEL_FREE' | 'PHYSICAL' | 'GALLERY';
  artMissionTheme?: ArtMissionTheme;
  onArtMissionThemeGenerated: (theme: ArtMissionTheme) => void;
  isArtMissionCompleted: boolean;
}

const BASE_PALETTE = [
  '#FF595E', '#FFCA3A', '#8AC926', '#1982C4', '#6A4C93', '#FFFFFF',
  '#F4A261', '#E76F51', '#2A9D8F', '#264653', '#000000', '#D3D3D3',
  '#FFC0CB', '#8B4513'
];

const ROYAL_PALETTE = ['#FFD700', '#C0C0C0', '#CD7F32', '#B8860B', '#800080', '#000080'];

const BRUSHES = [
  { id: 'brush_default', name: 'Lápis', icon: '✏️', size: 5, category: 'gratis' },
  { id: 'brush_crayon', name: 'Giz', icon: '🖍️', size: 12, category: 'gratis' },
  { id: 'brush_neon', name: 'Neon', icon: '🌈', size: 8, category: 'brush_neon' },
  { id: 'color_gold', name: 'Ouro', icon: '👑', size: 10, category: 'color_gold' }
];

const GRID_SIZE = 16;

const PaintingRoom: React.FC<PaintingRoomProps> = ({ 
  onSave, 
  savedPaintings, 
  unlockedItems, 
  onNavigateToShop, 
  initialMode = 'SELECTION',
  artMissionTheme,
  onArtMissionThemeGenerated,
  isArtMissionCompleted
}) => {
  const [mode, setMode] = useState<any>(initialMode);
  const [pixelGrid, setPixelGrid] = useState<string[]>(Array(GRID_SIZE * GRID_SIZE).fill('#ffffff'));
  const [activeColor, setActiveColor] = useState(BASE_PALETTE[0]);
  const [selectedBrush, setSelectedBrush] = useState(BRUSHES[0]);
  const [brushSize, setBrushSize] = useState(8);
  const [isEraser, setIsEraser] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [brushPos, setBrushPos] = useState({ x: -100, y: -100 });
  const [showBrush, setShowBrush] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  const hasGold = unlockedItems.includes('color_gold');
  
  const fullPalette = hasGold ? [...BASE_PALETTE, ...ROYAL_PALETTE] : BASE_PALETTE;

  const syncCanvasSize = () => {
    if (mode === 'COLORING' && canvasRef.current) {
      const canvas = canvasRef.current;
      const dpr = window.devicePixelRatio || 1;
      
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = activeColor;
        ctx.lineWidth = brushSize;
        contextRef.current = ctx;
        
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      }
    }
  };

  useEffect(() => {
    if (mode === 'COLORING') {
      setTimeout(syncCanvasSize, 50);
    }
  }, [mode]);

  useEffect(() => {
    window.addEventListener('resize', syncCanvasSize);
    return () => window.removeEventListener('resize', syncCanvasSize);
  }, [mode]);

  useEffect(() => {
    if (contextRef.current) {
      contextRef.current.strokeStyle = isEraser ? '#FFFFFF' : (selectedBrush.id === 'color_gold' ? '#FFD700' : activeColor);
      contextRef.current.lineWidth = brushSize;
      
      if (selectedBrush.id === 'brush_neon') {
        contextRef.current.shadowBlur = 15;
        contextRef.current.shadowColor = activeColor;
      } else {
        contextRef.current.shadowBlur = 0;
      }
    }
  }, [activeColor, brushSize, isEraser, selectedBrush]);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const { x, y } = getCoordinates(e);
    contextRef.current?.beginPath();
    contextRef.current?.moveTo(x, y);
    setIsDragging(true);
    setShowBrush(true);
    setBrushPos({ x, y });
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    const { x, y } = getCoordinates(e);
    setBrushPos({ x, y });
    if (!isDragging) return;
    contextRef.current?.lineTo(x, y);
    contextRef.current?.stroke();
  };

  const stopDrawing = () => {
    contextRef.current?.closePath();
    setIsDragging(false);
  };

  const savePainting = () => {
    if (canvasRef.current) {
      onSave(canvasRef.current.toDataURL('image/png'), false);
      setMode('GALLERY');
    }
  };

  const savePixelArt = () => {
    const c = document.createElement('canvas');
    c.width = 400;
    c.height = 400;
    const ctx = c.getContext('2d');
    if (ctx) {
      pixelGrid.forEach((col, idx) => {
        ctx.fillStyle = col;
        ctx.fillRect((idx % GRID_SIZE) * (400 / GRID_SIZE), Math.floor(idx / GRID_SIZE) * (400 / GRID_SIZE), (400 / GRID_SIZE), (400 / GRID_SIZE));
      });
      onSave(c.toDataURL(), false);
      setMode('GALLERY');
    }
  };

  if (mode === 'PHYSICAL') {
    return <PhysicalArtMission onSave={(img) => onSave(img, true)} onCancel={() => setMode('SELECTION')} savedTheme={artMissionTheme} onThemeGenerated={onArtMissionThemeGenerated} isCompleted={isArtMissionCompleted} />;
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto mb-24 animate-in fade-in duration-500">
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-5xl font-black font-outfit text-indigo-900 dark:text-indigo-400">Ateliê FiliF 🎨</h2>
      </div>

      <div className="flex justify-center gap-3 mb-8">
        <button onClick={() => setMode('SELECTION')} className={`px-5 py-3 rounded-2xl font-black text-sm transition-all ${mode !== 'GALLERY' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white dark:bg-gray-800 text-gray-500'}`}>Novo</button>
        <button onClick={() => setMode('GALLERY')} className={`px-5 py-3 rounded-2xl font-black text-sm transition-all ${mode === 'GALLERY' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white dark:bg-gray-800 text-gray-500'}`}>Galeria</button>
      </div>

      {mode === 'SELECTION' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div onClick={() => setMode('PHYSICAL')} className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] shadow-xl border-4 border-pink-100 hover:border-pink-300 transition-all text-center flex flex-col items-center cursor-pointer group">
            <span className="text-5xl mb-4 group-hover:scale-110 transition-transform">{isArtMissionCompleted ? '💎' : '📸'}</span>
            <h3 className="text-xs md:text-sm font-black text-gray-800 dark:text-gray-200 uppercase tracking-tighter">Missão no Papel</h3>
          </div>

          <div onClick={() => unlockedItems.includes('coloring_book') ? setMode('COLORING') : onNavigateToShop()} 
               className={`bg-white dark:bg-gray-800 p-6 rounded-[2rem] shadow-xl border-4 transition-all text-center flex flex-col items-center cursor-pointer group ${unlockedItems.includes('coloring_book') ? 'border-transparent hover:border-indigo-400' : 'opacity-60 border-gray-100'}`}>
            <span className="text-5xl mb-4 group-hover:scale-110 transition-transform">{unlockedItems.includes('coloring_book') ? '🖍️' : '🔒'}</span>
            <h3 className="text-xs md:text-sm font-black text-gray-800 dark:text-gray-200 uppercase tracking-tighter">Desenho Livre</h3>
          </div>

          <div onClick={() => unlockedItems.includes('pixel_free') ? (setPixelGrid(Array(GRID_SIZE * GRID_SIZE).fill('#ffffff')), setMode('PIXEL_FREE')) : onNavigateToShop()} 
               className={`bg-white dark:bg-gray-800 p-6 rounded-[2rem] shadow-xl border-4 transition-all text-center flex flex-col items-center cursor-pointer group ${unlockedItems.includes('pixel_free') ? 'border-transparent hover:border-yellow-400' : 'opacity-60 border-gray-100'}`}>
            <span className="text-5xl mb-4 group-hover:scale-110 transition-transform">{unlockedItems.includes('pixel_free') ? '✨' : '🔒'}</span>
            <h3 className="text-xs md:text-sm font-black text-gray-800 dark:text-gray-200 uppercase tracking-tighter">Pixel Livre</h3>
          </div>
        </div>
      )}

      {mode === 'COLORING' && (
        <div className="flex flex-col items-center gap-6 animate-in slide-in-from-bottom-4">
          <div className="relative w-full max-w-2xl aspect-square md:aspect-[4/3] bg-white rounded-[2rem] shadow-2xl border-4 border-indigo-50 dark:border-gray-700 overflow-hidden cursor-none touch-none"
               style={{ touchAction: 'none' }}>
            <canvas 
              ref={canvasRef} 
              onMouseDown={startDrawing} 
              onMouseMove={draw} 
              onMouseUp={stopDrawing} 
              onTouchStart={startDrawing} 
              onTouchMove={draw} 
              onTouchEnd={stopDrawing} 
              className="w-full h-full block bg-white" 
            />
            {showBrush && (
              <div className="pointer-events-none absolute z-50 transition-none" 
                   style={{ 
                     left: brushPos.x, 
                     top: brushPos.y, 
                     transform: `translate(-10%, -90%)`
                   }}>
                 <span className="text-4xl filter drop-shadow-lg">{isEraser ? '🧼' : selectedBrush.icon}</span>
              </div>
            )}
          </div>

          <div className="w-full bg-white dark:bg-gray-800 p-6 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-700">
             <div className="flex flex-col gap-6">
                <div className="flex flex-wrap justify-center gap-2">
                   {fullPalette.map(color => (
                     <button key={color} onClick={() => { setActiveColor(color); setIsEraser(false); }} className={`w-9 h-9 md:w-11 md:h-11 rounded-full border-4 transition-all ${activeColor === color && !isEraser ? 'border-indigo-600 scale-110' : 'border-white dark:border-gray-700'}`} style={{ backgroundColor: color }} />
                   ))}
                   <button onClick={() => setIsEraser(true)} className={`w-9 h-9 md:w-11 md:h-11 rounded-full border-4 flex items-center justify-center bg-white text-xl ${isEraser ? 'border-indigo-600 scale-110' : 'border-gray-200'}`}>🧼</button>
                </div>

                <div className="flex flex-wrap justify-center gap-2">
                   {BRUSHES.map(brush => {
                     const isLocked = brush.category !== 'gratis' && !unlockedItems.includes(brush.category);
                     return (
                       <button key={brush.id} onClick={() => isLocked ? onNavigateToShop() : (setSelectedBrush(brush), setIsEraser(false), setBrushSize(brush.size))} 
                               className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${selectedBrush.id === brush.id && !isEraser ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'}`}>
                         <span>{isLocked ? '🔒' : brush.icon}</span> {brush.name}
                       </button>
                     );
                   })}
                </div>
             </div>
             <div className="flex gap-4 mt-6">
                <button onClick={() => setMode('SELECTION')} className="flex-1 py-4 bg-gray-100 dark:bg-gray-700 text-gray-400 font-black rounded-2xl">Voltar</button>
                <button onClick={savePainting} className="flex-[2] py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl">Salvar Obra</button>
             </div>
          </div>
        </div>
      )}

      {mode === 'PIXEL_FREE' && (
        <div className="flex flex-col items-center gap-6 animate-in zoom-in-95">
           <div className="grid bg-gray-200 dark:bg-gray-700 p-1 rounded-2xl shadow-2xl relative select-none touch-none overflow-hidden" 
                style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`, width: 'min(90vw, 420px)', height: 'min(90vw, 420px)', gap: '1px' }} 
                onMouseDown={() => setIsDragging(true)} onMouseUp={() => setIsDragging(false)} onTouchStart={() => setIsDragging(true)} onTouchEnd={() => setIsDragging(false)}>
             {pixelGrid.map((color, i) => (
                <div key={i} 
                     onMouseDown={() => { const n=[...pixelGrid]; n[i]=activeColor; setPixelGrid(n); }} 
                     onMouseEnter={() => isDragging && (()=>{const n=[...pixelGrid]; n[i]=activeColor; setPixelGrid(n);})()} 
                     className="w-full h-full cursor-crosshair transition-colors" 
                     style={{ backgroundColor: color }}>
                </div>
             ))}
           </div>

           <div className="w-full bg-white dark:bg-gray-800 p-6 rounded-[2.5rem] shadow-xl">
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {fullPalette.map(color => (
                  <button key={color} onClick={() => setActiveColor(color)} className={`w-8 h-8 rounded-full border-4 ${activeColor === color ? 'border-indigo-600 scale-110' : 'border-white dark:border-gray-700'}`} style={{ backgroundColor: color }} />
                ))}
              </div>
              <div className="flex gap-4">
                <button onClick={() => setMode('SELECTION')} className="flex-1 py-4 bg-gray-100 dark:bg-gray-700 text-gray-400 font-bold rounded-xl">Cancelar</button>
                <button onClick={savePixelArt} className="flex-[2] py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg">Finalizar Pixel ✨</button>
              </div>
           </div>
        </div>
      )}

      {mode === 'GALLERY' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in">
           {savedPaintings.length === 0 ? (
             <div className="col-span-full py-20 text-center opacity-40">Nenhuma obra ainda...</div>
           ) : (
             savedPaintings.map((img, idx) => (
               <div key={idx} className="bg-white dark:bg-gray-800 p-2 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                  <img src={img} className="w-full aspect-square object-cover rounded-xl" alt="" />
               </div>
             ))
           )}
        </div>
      )}
    </div>
  );
};

export default PaintingRoom;
