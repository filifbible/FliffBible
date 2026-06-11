import React, { useRef, useState, useEffect } from "react";
import { ProfileService } from "@/services/profileService";

interface Point {
  x: number;
  y: number;
}

interface LetterTracingGameProps {
  onWin?: (coins: number) => void;
  onBack?: () => void;
}

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const LetterTracingGame: React.FC<LetterTracingGameProps> = ({ onWin, onBack }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const backgroundCanvasRef = useRef<HTMLCanvasElement>(null);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentLetterIndex, setCurrentLetterIndex] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [currentColor, setCurrentColor] = useState("#3B82F6"); // Default Blue
  const [brushSize, setBrushSize] = useState(14); // Lápis padrão menor
  const [hasDrawn, setHasDrawn] = useState(false); // Para checar se a criança desenhou antes de avançar
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isEraser, setIsEraser] = useState(false); // Estado para a borracha
  const [coverage, setCoverage] = useState(0); // Porcentagem preenchida
  const [isLetterCompleted, setIsLetterCompleted] = useState(false); // Se atingiu a meta (ex: 70%)
  const [showRewardAnimation, setShowRewardAnimation] = useState(false); // Animação da moeda

  const colors = [
    { name: "Azul", hex: "#3B82F6" },
    { name: "Vermelho", hex: "#EF4444" },
    { name: "Verde", hex: "#10B981" },
    { name: "Amarelo", hex: "#F59E0B" },
    { name: "Roxo", hex: "#8B5CF6" },
    { name: "Rosa", hex: "#EC4899" },
  ];
  
  const currentLetter = ALPHABET[currentLetterIndex];

  const drawBackgroundLetter = () => {
    const canvas = backgroundCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Ajusta resolução para telas retina se necessário (simples scaling)
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Desenha a letra pontilhada no centro
    ctx.font = "bold 280px 'Nunito', 'Outfit', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    
    // Configura o tracejado (pontinhos)
    ctx.lineWidth = 12;
    ctx.setLineDash([20, 30]); // Tamanho do traço e do espaço
    ctx.strokeStyle = "#94A3B8"; // Cor do pontilhado mais escura (slate-400) para melhor visibilidade
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    
    // Posiciona no centro (+20px para compensar a baseline da fonte)
    ctx.strokeText(currentLetter, canvas.width / 2, canvas.height / 2 + 20);
    
    // Reseta o dash
    ctx.setLineDash([]);
  };

  const calculateCoverage = () => {
    const bgCanvas = backgroundCanvasRef.current;
    const fgCanvas = canvasRef.current;
    if (!bgCanvas || !fgCanvas) return 0;

    // Use willReadFrequently to optimize for getImageData
    const bgCtx = bgCanvas.getContext('2d', { willReadFrequently: true });
    const fgCtx = fgCanvas.getContext('2d', { willReadFrequently: true });
    if (!bgCtx || !fgCtx) return 0;

    const width = bgCanvas.width;
    const height = bgCanvas.height;

    try {
      const bgData = bgCtx.getImageData(0, 0, width, height).data;
      const fgData = fgCtx.getImageData(0, 0, width, height).data;

      let targetPixels = 0;
      let coveredPixels = 0;

      // Cada pixel ocupa 4 posições (R, G, B, Alpha)
      // Vamos verificar apenas o Alpha (opacidade) no índice i
      for (let i = 3; i < bgData.length; i += 4) {
        if (bgData[i] > 20) { // Se o fundo tem cor (faz parte da letra)
          targetPixels++;
          if (fgData[i] > 20) { // Se a criança pintou por cima
            coveredPixels++;
          }
        }
      }

      if (targetPixels === 0) return 0;
      const percent = (coveredPixels / targetPixels) * 100;
      return percent;
    } catch (e) {
      console.error("Erro ao calcular preenchimento:", e);
      return 0;
    }
  };

  const loadTraceLocally = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const profileId = localStorage.getItem('selectedProfileId');
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (profileId) {
      const savedData = localStorage.getItem(`filif_trace_${profileId}_${currentLetter}`);
      if (savedData) {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0);
          setHasDrawn(true);
          const currentCoverage = calculateCoverage();
          setCoverage(currentCoverage);
          setIsLetterCompleted(currentCoverage >= 70); // 70% de cobertura é considerado concluído
        };
        img.src = savedData;
        return;
      }
    }
    setHasDrawn(false);
    setCoverage(0);
    setIsLetterCompleted(false);
  };

  const saveTraceLocally = () => {
    const canvas = canvasRef.current;
    const profileId = localStorage.getItem('selectedProfileId');
    if (!canvas || !profileId) return;
    
    const dataUrl = canvas.toDataURL('image/png');
    localStorage.setItem(`filif_trace_${profileId}_${currentLetter}`, dataUrl);
  };

  useEffect(() => {
    drawBackgroundLetter();
    loadTraceLocally();
  }, [currentLetter]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const pos = getCoordinates(e, canvas);
    if (!pos) return;

    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = brushSize; // Usa a espessura escolhida
    
    // Configuração da borracha vs desenho
    ctx.globalCompositeOperation = isEraser ? "destination-out" : "source-over";
    ctx.strokeStyle = isEraser ? "rgba(0,0,0,1)" : currentColor;
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const pos = getCoordinates(e, canvas);
    if (!pos) return;

    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    if (!hasDrawn) setHasDrawn(true);
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveTraceLocally(); // Salva sempre que a criança tira o dedo/mouse
      
      const currentCoverage = calculateCoverage();
      setCoverage(currentCoverage);
      
      if (currentCoverage >= 70 && !isLetterCompleted) {
        setIsLetterCompleted(true);
        setShowRewardAnimation(true);
        setTimeout(() => setShowRewardAnimation(false), 2000); // Esconde a animação após 2s
      }
    }
  };

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement): Point | null => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ("touches" in e) {
      if (e.touches.length === 0) return null;
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY
      };
    }
    return {
      x: ((e as React.MouseEvent).clientX - rect.left) * scaleX,
      y: ((e as React.MouseEvent).clientY - rect.top) * scaleY
    };
  };

  const clearDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setCompleted(false);
    setHasDrawn(false);
    setCoverage(0);
    setIsLetterCompleted(false);
    
    const profileId = localStorage.getItem('selectedProfileId');
    if (profileId) {
      localStorage.removeItem(`filif_trace_${profileId}_${currentLetter}`);
    }
  };

  const nextLetter = () => {
    // Só recompensa e dispara o salvamento se a criança PREENCHEU a letra
    if (hasDrawn && isLetterCompleted) {
      saveTracing(); // Dispara em segundo plano (fire-and-forget)
      if (onWin) {
        onWin(1); // Dá 1 moedinha por letra completada
      }
    }
    
    // Troca de letra instantaneamente, sem esperar o banco de dados
    setCurrentLetterIndex((prev) => (prev + 1) % ALPHABET.length);
    setHasDrawn(false);
    setIsLetterCompleted(false);
    setCoverage(0);
  };

  const prevLetter = () => {
    setCurrentLetterIndex((prev) => (prev - 1 + ALPHABET.length) % ALPHABET.length);
  };

  const saveTracing = () => {
    if (!hasDrawn) return;
    
    const canvas = canvasRef.current;
    const bgCanvas = backgroundCanvasRef.current;
    if (!canvas || !bgCanvas) return;

    setIsSaving(true);
    
    // Criação do canvas é síncrona e super rápida (antes de apagar a tela)
    const offscreen = document.createElement('canvas');
    offscreen.width = canvas.width;
    offscreen.height = canvas.height;
    const offCtx = offscreen.getContext('2d');
    
    if (offCtx) {
      offCtx.fillStyle = 'white';
      offCtx.fillRect(0, 0, canvas.width, canvas.height);
      offCtx.drawImage(bgCanvas, 0, 0);
      offCtx.drawImage(canvas, 0, 0);
      
      const dataUrl = offscreen.toDataURL('image/png');
      const profileId = localStorage.getItem('selectedProfileId');
      
      if (profileId) {
         // O upload para o banco acontece em segundo plano (Assíncrono)
         ProfileService.addToArray(profileId, 'paintings', dataUrl)
           .then(() => {
             setSaved(true);
             setTimeout(() => setSaved(false), 2500);
           })
           .catch(err => console.error("Erro ao salvar traçado", err))
           .finally(() => setIsSaving(false));
      } else {
        setIsSaving(false);
      }
    } else {
      setIsSaving(false);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center p-6 bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(8,_112,_184,_0.07)] w-full max-w-3xl mx-auto border border-white/40">
      
      {/* Animação de Recompensa Flutuante (Lateral) */}
      {showRewardAnimation && (
        <div className="absolute top-6 right-6 md:top-10 md:right-10 z-50 pointer-events-none">
          <div className="bg-gradient-to-r from-yellow-300 to-yellow-500 text-yellow-900 font-bold text-2xl px-5 py-2 rounded-full shadow-lg border-2 border-yellow-200 flex items-center gap-2 animate-float-up">
            +1 🪙
          </div>
        </div>
      )}

      {/* Header */}
      <div className="relative text-center mb-8 w-full">
        {onBack && (
          <button
            onClick={onBack}
            className="absolute left-0 top-1/2 -translate-y-1/2 p-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all shadow-sm"
            title="Voltar ao Menu"
          >
            ⬅️ Voltar
          </button>
        )}
        <h2 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-3 font-outfit mt-12 md:mt-0">
          Vamos Escrever!
        </h2>
        <p className="text-gray-500 font-medium text-lg">
          Ligue os pontinhos para formar a letra <span className="font-bold text-indigo-600 text-xl ml-1">{currentLetter}</span>
        </p>
      </div>
      
      {/* Canvas Container */}
      <div className="relative group">
        <style>{`
          @keyframes floatUpFade {
            0% { opacity: 0; transform: translateY(20px) scale(0.5); }
            20% { opacity: 1; transform: translateY(0px) scale(1.2); }
            80% { opacity: 1; transform: translateY(-30px) scale(1); }
            100% { opacity: 0; transform: translateY(-50px) scale(0.8); }
          }
          .animate-float-up {
            animation: floatUpFade 1.8s ease-out forwards;
          }
        `}</style>

        <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-[3rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative w-[320px] h-[320px] md:w-[450px] md:h-[450px] bg-white border-4 border-indigo-50 rounded-[2.5rem] overflow-hidden cursor-crosshair touch-none shadow-inner">
          
          {/* Background Canvas para a letra pontilhada */}
          <canvas
            ref={backgroundCanvasRef}
            width={450}
            height={450}
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
          />
          
          {/* Foreground Canvas para o desenho do usuário */}
          <canvas
            ref={canvasRef}
            width={450}
            height={450}
            className="absolute top-0 left-0 w-full h-full z-10"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseOut={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        </div>
      </div>

      {/* Ferramentas: Tamanho do Lápis e Cores */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-8 bg-gray-50/50 p-4 rounded-3xl border border-gray-100 w-full shadow-sm">
        
        {/* Tamanho do Lápis */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-400 mr-1 uppercase tracking-wider">Lápis:</span>
          {[
            { id: 'fino', size: 8, label: 'Fino' },
            { id: 'medio', size: 14, label: 'Médio' },
            { id: 'grosso', size: 24, label: 'Grosso' }
          ].map((b) => (
            <button
              key={b.id}
              onClick={() => setBrushSize(b.size)}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                brushSize === b.size 
                  ? 'bg-white shadow-md border-2 border-indigo-200 scale-110' 
                  : 'hover:bg-white/60 hover:scale-105 border border-transparent'
              }`}
              title={`Tamanho ${b.label}`}
            >
              <div 
                className="rounded-full transition-all" 
                style={{ 
                  width: b.size, 
                  height: b.size,
                  backgroundColor: currentColor 
                }}
              />
            </button>
          ))}
        </div>

        <div className="w-full sm:w-px h-px sm:h-10 bg-gray-200"></div>

        {/* Cores e Borracha */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-gray-400 mr-1 uppercase tracking-wider">Cores:</span>
          {colors.map((c) => (
            <button
              key={c.hex}
              onClick={() => { setCurrentColor(c.hex); setIsEraser(false); }}
              className={`w-10 h-10 rounded-full transition-all transform shadow-sm ${
                currentColor === c.hex && !isEraser ? 'ring-4 ring-offset-2 ring-gray-200 scale-110' : 'hover:ring-2 ring-offset-1 ring-gray-100 hover:scale-110'
              }`}
              style={{ backgroundColor: c.hex }}
              title={c.name}
            />
          ))}

          <div className="w-px h-8 bg-gray-200 mx-1"></div>

          <button
            onClick={() => setIsEraser(true)}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all text-xl shadow-sm ${
              isEraser ? 'bg-indigo-50 ring-4 ring-offset-2 ring-indigo-200 scale-110' : 'bg-gray-50 hover:bg-gray-100 hover:scale-110'
            }`}
            title="Borracha"
          >
            🧼
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 mt-8 w-full justify-between px-4">
        <button
          onClick={prevLetter}
          className="flex items-center justify-center w-14 h-14 bg-white text-gray-600 rounded-full font-bold hover:bg-gray-50 border-2 border-gray-100 transition-all shadow-sm hover:shadow group"
          title="Letra Anterior"
        >
          <svg className="w-6 h-6 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
        </button>
        
        <div className="flex gap-3">
          <button
            onClick={clearDrawing}
            className="px-6 py-4 bg-rose-50 text-rose-600 rounded-full font-bold hover:bg-rose-100 transition-all flex items-center gap-2 group border border-rose-100"
          >
            <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            Apagar
          </button>

          <button
            onClick={saveTracing}
            disabled={!isLetterCompleted || isSaving}
            className={`px-6 py-4 rounded-full font-bold transition-all flex items-center gap-2 border shadow-sm ${
              saved 
                ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
          >
            {saved ? 'Salvo! ✅' : (isSaving ? 'Salvando...' : 'Salvar Obra 💾')}
          </button>
        </div>

        {isLetterCompleted ? (
          <button
            onClick={nextLetter}
            className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-400 to-green-500 text-white rounded-full font-bold hover:from-emerald-500 hover:to-green-600 transition-all shadow-lg shadow-green-500/30 transform hover:-translate-y-1 scale-105 group"
          >
            Perfeito! Próxima
            <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
          </button>
        ) : (
          <button
            disabled={true}
            className="flex items-center gap-3 px-8 py-4 bg-gray-100 text-gray-400 rounded-full font-bold cursor-not-allowed opacity-70"
            title="Pinte a letra toda para avançar"
          >
            Pinte a letra
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default LetterTracingGame;
