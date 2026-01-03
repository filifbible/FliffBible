
import React, { useState, useMemo } from 'react';
import { ProfileType, VideoItem } from '../types';
import { VIDEO_LIBRARY } from '../constants';

interface VideosProps {
  profile: ProfileType;
  lastVideoDate?: string | null;
  onNavigate: (screen: any) => void;
  onVideoComplete: () => void;
}

const Videos: React.FC<VideosProps> = ({ profile, lastVideoDate, onNavigate, onVideoComplete }) => {
  const [activeVideo, setActiveVideo] = useState<(VideoItem & { youtubeId: string }) | null>(null);
  
  const todayStr = new Date().toISOString().split('T')[0];
  const alreadyWatched = lastVideoDate === todayStr;

  // Seleciona exatamente um vídeo baseado no dia do ano
  const dailyVideo = useMemo(() => {
    const videos = VIDEO_LIBRARY[profile] || [];
    if (videos.length === 0) return null;
    
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    
    return videos[dayOfYear % videos.length];
  }, [profile]);

  const finishVideo = () => {
    setActiveVideo(null);
    onVideoComplete();
  };

  if (!dailyVideo) {
    return (
      <div className="p-8 text-center mt-20">
        <p className="text-gray-500">Nenhum vídeo disponível para seu perfil hoje.</p>
      </div>
    );
  }

  if (alreadyWatched && !activeVideo) {
    return (
      <div className="p-4 md:p-8 max-w-2xl mx-auto mt-20 animate-in zoom-in-95 duration-500">
        <div className="bg-white dark:bg-gray-800 rounded-[3rem] p-12 text-center border-4 border-indigo-100 dark:border-indigo-900 shadow-xl shadow-indigo-100/50 dark:shadow-none">
          <div className="text-8xl mb-8">🍿</div>
          <h2 className="text-3xl font-black font-outfit text-indigo-900 dark:text-indigo-400 mb-4">MUITO BEM!</h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-10">
            Você já assistiu seu vídeo bíblico de hoje! Você está crescendo muito no conhecimento da Palavra. 
          </p>
          <div className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-bold p-6 rounded-2xl border-2 border-emerald-100 dark:border-emerald-800">
            Amanhã tem um vídeo novo esperando por você! ✨
          </div>
          <button 
            onClick={() => onNavigate('HOME')}
            className="mt-8 text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
          >
            Voltar para o Início
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto mb-20">
      <div className="mb-10 text-center">
        <h2 className="text-4xl font-black font-outfit text-gray-800 dark:text-white mb-2">Vídeo do Dia</h2>
        <p className="text-gray-500 dark:text-gray-400">Assista o vídeo de hoje e ganhe pontos!</p>
      </div>

      <div className="max-w-xl mx-auto">
        <div 
          onClick={() => setActiveVideo(dailyVideo)}
          className="bg-white dark:bg-gray-800 rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white dark:border-gray-700 hover:scale-[1.02] transition-all group cursor-pointer relative"
        >
          <div className="aspect-video bg-gray-200 dark:bg-gray-900 flex items-center justify-center relative overflow-hidden">
            <img 
              src={`https://img.youtube.com/vi/${dailyVideo.youtubeId}/maxresdefault.jpg`} 
              alt={dailyVideo.title}
              className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `https://img.youtube.com/vi/${dailyVideo.youtubeId}/hqdefault.jpg`;
              }}
            />
            
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center z-20">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                <span className="text-indigo-600 text-3xl ml-1">▶</span>
              </div>
            </div>
            
            <span className="absolute bottom-4 right-4 bg-black/70 text-white text-xs font-bold px-3 py-1 rounded-lg z-30">
              {dailyVideo.duration}
            </span>
          </div>
          <div className="p-8 text-center">
            <span className="text-indigo-500 dark:text-indigo-400 font-black text-xs uppercase tracking-[0.2em] mb-3 block">Lição de Hoje</span>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white leading-tight">{dailyVideo.title}</h3>
            <p className="text-gray-400 dark:text-gray-500 mt-4 font-medium italic">
              "Prepare a pipoca e vamos aprender!"
            </p>
          </div>
        </div>
      </div>

      {/* Full-Screen Video Modal com Z-Index altíssimo e sem bloqueios */}
      {activeVideo && (
        <div className="fixed inset-0 z-[10000] bg-black flex flex-col items-center justify-center animate-in fade-in duration-300">
          <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-[10001]">
             <h3 className="text-white font-bold text-lg md:text-xl truncate pr-4">{activeVideo.title}</h3>
             <button 
                onClick={() => setActiveVideo(null)}
                className="bg-white/20 hover:bg-white/40 text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all"
              >
                ✕
              </button>
          </div>
          
          <div className="w-full h-full md:h-auto md:aspect-video md:max-w-5xl md:rounded-[2rem] overflow-hidden shadow-2xl relative bg-black">
            <iframe 
              className="absolute inset-0 w-full h-full"
              src={`https://www.youtube.com/embed/${activeVideo.youtubeId}?autoplay=1&rel=0&modestbranding=1&controls=1&showinfo=0`}
              title={activeVideo.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>

          <div className="absolute bottom-8 left-0 right-0 text-center px-6 z-[10001]">
            <button 
              onClick={finishVideo}
              className="bg-indigo-600 text-white font-black px-12 py-5 rounded-[2rem] shadow-xl shadow-indigo-900/40 hover:scale-105 active:scale-95 transition-all text-lg border-2 border-indigo-400"
            >
              CONCLUÍDO! ✅ (+20pts)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Videos;
