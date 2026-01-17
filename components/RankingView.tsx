
import React, { useState, useEffect } from 'react';
import { ProfileData } from '../types';
import { PROFILE_CONFIGS, REWARD_LEVELS } from '../constants';
import { ProfileService } from '../services/profileService';
import { AuthService } from '../services/authService';

interface RankingViewProps {
  profiles: ProfileData[];
  currentProfileId: string | null;
  onBack: () => void;
}

const RankingView: React.FC<RankingViewProps> = ({ profiles: initialProfiles, currentProfileId, onBack }) => {
  const [profiles, setProfiles] = useState<ProfileData[]>(initialProfiles);
  const [loading, setLoading] = useState(true);

  // Buscar perfis frescos do Supabase
  useEffect(() => {
    const fetchProfiles = async () => {
      setLoading(true);
      try {
        const session = await AuthService.getCurrentSession();
        if (session?.user) {
          const supabaseProfiles = await ProfileService.getProfiles(session.user.id);
          
          // Converter para formato local
          const formattedProfiles: ProfileData[] = supabaseProfiles.map(sp => ({
            id: sp.id,
            name: sp.name,
            type: sp.profile_type,
            avatar: sp.avatar || undefined,
            bio: sp.bio || undefined,
            points: sp.points,
            coins: sp.coins,
            unlockedItems: sp.unlocked_items,
            streak: sp.streak,
            lastChallengeDate: sp.last_challenge_date,
            lastArtDate: sp.last_art_date,
            lastVideoDate: sp.last_video_date,
            favorites: sp.favorites,
            gallery: sp.gallery,
            recordings: sp.recordings,
            paintings: sp.paintings,
            artMissionTheme: sp.art_mission_theme || undefined,
            is_admin: sp.is_admin,
            is_blocked: sp.is_blocked,
          }));
          
          setProfiles(formattedProfiles);
        } else {
          // Fallback para dados locais se não houver sessão
          setProfiles(initialProfiles);
        }
      } catch (error) {
        console.error('Erro ao buscar perfis do ranking:', error);
        // Em caso de erro, usar dados locais
        setProfiles(initialProfiles);
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, [initialProfiles]);

  const currentProfile = profiles.find(p => p.id === currentProfileId);
  const userPoints = currentProfile?.points || 0;

  // Ordena os perfis para o ranking familiar na parte inferior
  const sortedProfiles = [...profiles].sort((a, b) => (b.points || 0) - (a.points || 0));

  const currentLevelInfo = [...REWARD_LEVELS].reverse().find(l => userPoints >= l.points) || REWARD_LEVELS[0];
  const nextLevel = REWARD_LEVELS.find(l => l.points > userPoints);

  const progressToNext = nextLevel
    ? ((userPoints - currentLevelInfo.points) / (nextLevel.points - currentLevelInfo.points)) * 100
    : 100;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto mb-20 space-y-12 animate-in fade-in duration-500">
      {/* HEADER: STATUS ATUAL */}
      <div className="text-center space-y-4 relative">
        <button
          onClick={onBack}
          className="absolute left-0 top-0 p-3 bg-white dark:bg-gray-800 rounded-xl shadow-md text-xl hover:scale-105 transition-transform hidden md:block"
        >
          ⬅️
        </button>
        <h2 className="text-4xl md:text-5xl font-black font-outfit text-indigo-900 dark:text-indigo-400">Jornada da Fé ✨</h2>
        <p className="text-gray-500 dark:text-gray-400 font-medium">Continue cumprindo missões para subir de nível e brilhar!</p>
        
        {/* Loading state */}
        {loading && (
          <div className="flex justify-center items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
            <span className="text-sm font-bold">Atualizando ranking...</span>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 p-8 rounded-[3rem] shadow-xl border-4 border-indigo-50 dark:border-gray-700 mt-8 relative overflow-hidden"
          style={{ opacity: loading ? 0.6 : 1, transition: 'opacity 0.3s' }}
        >
          <div className="absolute top-0 right-0 p-8 text-9xl opacity-5 rotate-12">{currentLevelInfo.icon}</div>
          <div className="relative z-10 flex flex-col items-center">
            <span className="text-6xl mb-4">{currentLevelInfo.icon}</span>
            <h3 className="text-3xl font-black text-indigo-900 dark:text-white uppercase tracking-tight">{currentLevelInfo.title}</h3>
            <div className="mt-6 w-full max-w-md">
              <div className="flex justify-between text-xs font-black uppercase tracking-widest mb-2">
                <span className="text-indigo-600 dark:text-indigo-400">{userPoints} Pontos</span>
                <span className="text-gray-400">{nextLevel ? `Próximo: ${nextLevel.points}` : 'Nível Máximo!'}</span>
              </div>
              <div className="w-full h-4 bg-gray-100 dark:bg-gray-900 rounded-full overflow-hidden border-2 border-white dark:border-gray-700">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-1000 shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                  style={{ width: `${progressToNext}%` }}
                />
              </div>
              {nextLevel && (
                <p className="text-[10px] text-gray-400 mt-3 font-bold uppercase tracking-tighter">
                  Faltam {nextLevel.points - userPoints} pontos para o próximo marco!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* TRILHA DE PROGRESSÃO (MARCOS) */}
      <div className="space-y-6">
        <h3 className="text-2xl font-black font-outfit text-gray-800 dark:text-white px-4">Marcos da Caminhada 👣</h3>
        <div className="grid gap-4">
          {REWARD_LEVELS.map((lvl, index) => {
            const isUnlocked = userPoints >= lvl.points;
            const isCurrent = currentLevelInfo.level === lvl.level;

            return (
              <div
                key={lvl.level}
                className={`relative flex items-center p-6 rounded-[2.5rem] border-4 transition-all ${isUnlocked
                    ? 'bg-white dark:bg-gray-800 border-indigo-100 dark:border-indigo-900/40 shadow-md'
                    : 'bg-gray-50 dark:bg-gray-900/50 border-transparent opacity-60 grayscale'
                  } ${isCurrent ? 'ring-4 ring-indigo-500 ring-offset-4 dark:ring-offset-gray-900' : ''}`}
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-4xl shadow-inner ${isUnlocked ? 'bg-indigo-50 dark:bg-indigo-900/30' : 'bg-gray-200 dark:bg-gray-800'
                  }`}>
                  {lvl.icon}
                </div>

                <div className="ml-6 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className={`font-black text-lg ${isUnlocked ? 'text-gray-800 dark:text-white' : 'text-gray-400'}`}>
                      {lvl.title}
                    </h4>
                    {isUnlocked && <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-black uppercase">Desbloqueado</span>}
                  </div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Nível {lvl.level} • {lvl.points} Pontos</p>
                </div>

                <div className="text-right">
                  {isUnlocked ? (
                    <span className="text-2xl">✅</span>
                  ) : (
                    <div className="flex flex-col items-end">
                      <span className="text-xl">🔒</span>
                      <span className="text-[8px] font-black text-gray-400 uppercase">Bloqueado</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RANKING FAMILIAR (LISTA INFERIOR) */}
      <div className="space-y-6 pt-8">
        <h3 className="text-2xl font-black font-outfit text-gray-800 dark:text-white px-4">Mural da Família 🏠</h3>
        <div className="bg-white dark:bg-gray-800 rounded-[3rem] shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="divide-y divide-gray-50 dark:divide-gray-750">
            {sortedProfiles.map((profile, index) => {
              const isMe = profile.id === currentProfileId;
              const position = index + 1;

              return (
                <div
                  key={profile.id}
                  className={`flex items-center justify-between p-6 transition-colors ${isMe ? 'bg-indigo-50/50 dark:bg-indigo-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-900/40'
                    }`}
                >
                  <div className="flex items-center space-x-5">
                    <span className={`w-8 text-center font-black text-lg ${position <= 3 ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-300'}`}>
                      #{position}
                    </span>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm ${PROFILE_CONFIGS[profile.type].color}`}>
                      {profile.avatar && profile.avatar.startsWith('data:') ? (
                        <img src={profile.avatar} className="w-full h-full object-cover rounded-xl" alt="" />
                      ) : (
                        profile.avatar || PROFILE_CONFIGS[profile.type].icon
                      )}
                    </div>
                    <div>
                      <span className="font-black text-gray-800 dark:text-white text-base block leading-none">{profile.name}</span>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{profile.points} Pontos</span>
                    </div>
                  </div>
                  {isMe && <span className="bg-indigo-600 text-white text-[8px] font-black px-2 py-1 rounded-full uppercase">Você</span>}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* INFO DE COMO GANHAR */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 rounded-[3rem] text-white shadow-xl relative overflow-hidden group">
        <div className="absolute -right-10 -bottom-10 text-[10rem] opacity-10 rotate-12 group-hover:rotate-0 transition-transform">💎</div>
        <h4 className="text-xl font-black mb-4 relative z-10">Como subir de nível rápido? 🚀</h4>
        <div className="grid grid-cols-2 gap-4 relative z-10">
          <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm">
            <span className="text-2xl block mb-2">📖</span>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Missão Versículo</p>
            <p className="font-bold">+100 Pontos</p>
          </div>
          <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm">
            <span className="text-2xl block mb-2">🎨</span>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Desenho Físico</p>
            <p className="font-bold">+100 Pontos</p>
          </div>
          <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm">
            <span className="text-2xl block mb-2">🎮</span>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Vencer Jogos</p>
            <p className="font-bold">+50 Pontos</p>
          </div>
          <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm">
            <span className="text-2xl block mb-2">🎤</span>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Gravar Versículo</p>
            <p className="font-bold">+20 Pontos</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RankingView;
