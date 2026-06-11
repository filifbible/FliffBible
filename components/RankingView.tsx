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

const MEDAL: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

const RankingRow = ({
  profile,
  position,
  currentProfileId,
}: {
  profile: ProfileData;
  position: number;
  currentProfileId: string | null;
}) => {
  const isMe = profile.id === currentProfileId;
  const medal = MEDAL[position];
  const profileType = ((profile as any).profile_type ?? (profile as any).type) as keyof typeof PROFILE_CONFIGS;

  return (
    <div
      className={`flex items-center justify-between p-5 transition-colors ${
        isMe ? 'bg-indigo-50/70 dark:bg-indigo-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-900/40'
      }`}
    >
      <div className="flex items-center gap-4">
        {/* Position */}
        <div className={`w-10 text-center font-black ${medal ? 'text-2xl' : 'text-gray-300 dark:text-gray-600 text-base'}`}>
          {medal || `#${position}`}
        </div>

        {/* Avatar */}
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm overflow-hidden ${
            PROFILE_CONFIGS[profileType]?.color || 'bg-gray-100'
          }`}
        >
          {profile.avatar && profile.avatar.startsWith('data:') ? (
            <img src={profile.avatar} className="w-full h-full object-cover" alt="" />
          ) : (
            profile.avatar || PROFILE_CONFIGS[profileType]?.icon || '👤'
          )}
        </div>

        {/* Name + stats */}
        <div>
          <span className={`font-black text-base block leading-none ${
            isMe ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-800 dark:text-white'
          }`}>
            {profile.name}
          </span>
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
            {profile.points?.toLocaleString('pt-BR')} pontos
            {profile.streak ? ` • 🔥 ${profile.streak}` : ''}
          </span>
        </div>
      </div>

      {isMe && (
        <span className="bg-indigo-600 text-white text-[8px] font-black px-2 py-1 rounded-full uppercase">
          Você
        </span>
      )}
    </div>
  );
};

const RankingView: React.FC<RankingViewProps> = ({ profiles: initialProfiles, currentProfileId, onBack }) => {
  const [familyProfiles, setFamilyProfiles] = useState<ProfileData[]>(initialProfiles);
  const [globalProfiles, setGlobalProfiles] = useState<ProfileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingGlobal, setLoadingGlobal] = useState(false);
  const [activeTab, setActiveTab] = useState<'family' | 'global'>('family');

  // Buscar perfis da família
  useEffect(() => {
    const fetchFamily = async () => {
      setLoading(true);
      try {
        const session = await AuthService.getCurrentSession();
        if (session?.user) {
          const supabaseProfiles = await ProfileService.getProfiles(session.user.id);
          const formatted: ProfileData[] = supabaseProfiles.map(sp => ({
            id: sp.id,
            account_id: sp.account_id,
            name: sp.name,
            type: sp.profile_type,
            profile_type: sp.profile_type,
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
            recordings: sp.recordings,
            paintings: sp.paintings,
            artMissionTheme: sp.art_mission_theme || undefined,
            is_admin: sp.is_admin,
            is_blocked: sp.is_blocked,
          }));
          setFamilyProfiles(formatted);
        } else {
          setFamilyProfiles(initialProfiles);
        }
      } catch (error) {
        console.error('Erro ao buscar perfis da família:', error);
        setFamilyProfiles(initialProfiles);
      } finally {
        setLoading(false);
      }
    };
    fetchFamily();
  }, []);

  // Buscar ranking global somente quando a aba for aberta (lazy)
  useEffect(() => {
    if (activeTab !== 'global') return;
    if (globalProfiles.length > 0) return;

    const fetchGlobal = async () => {
      setLoadingGlobal(true);
      try {
        const data = await ProfileService.getGlobalRanking(50);
        setGlobalProfiles(data as any[]);
      } catch (e) {
        console.error('Erro ao buscar ranking global:', e);
      } finally {
        setLoadingGlobal(false);
      }
    };
    fetchGlobal();
  }, [activeTab]);

  const currentProfile = familyProfiles.find(p => p.id === currentProfileId);
  const userPoints = currentProfile?.points || 0;
  const sortedFamily = [...familyProfiles].sort((a, b) => (b.points || 0) - (a.points || 0));
  const currentLevelInfo = [...REWARD_LEVELS].reverse().find(l => userPoints >= l.points) || REWARD_LEVELS[0];
  const nextLevel = REWARD_LEVELS.find(l => l.points > userPoints);
  const progressToNext = nextLevel
    ? ((userPoints - currentLevelInfo.points) / (nextLevel.points - currentLevelInfo.points)) * 100
    : 100;

  // Posição do usuário no ranking global
  const myGlobalPosition = globalProfiles.findIndex(p => p.id === currentProfileId) + 1;

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

        {loading && (
          <div className="flex justify-center items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
            <span className="text-sm font-bold">Atualizando ranking...</span>
          </div>
        )}

        <div
          className="bg-white dark:bg-gray-800 p-8 rounded-[3rem] shadow-xl border-4 border-indigo-50 dark:border-gray-700 mt-8 relative overflow-hidden"
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
          {REWARD_LEVELS.map((lvl) => {
            const isUnlocked = userPoints >= lvl.points;
            const isCurrent = currentLevelInfo.level === lvl.level;
            return (
              <div
                key={lvl.level}
                className={`relative flex items-center p-6 rounded-[2.5rem] border-4 transition-all ${
                  isUnlocked
                    ? 'bg-white dark:bg-gray-800 border-indigo-100 dark:border-indigo-900/40 shadow-md'
                    : 'bg-gray-50 dark:bg-gray-900/50 border-transparent opacity-60 grayscale'
                } ${isCurrent ? 'ring-4 ring-indigo-500 ring-offset-4 dark:ring-offset-gray-900' : ''}`}
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-4xl shadow-inner ${
                  isUnlocked ? 'bg-indigo-50 dark:bg-indigo-900/30' : 'bg-gray-200 dark:bg-gray-800'
                }`}>
                  {lvl.icon}
                </div>
                <div className="ml-6 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className={`font-black text-lg ${isUnlocked ? 'text-gray-800 dark:text-white' : 'text-gray-400'}`}>
                      {lvl.title}
                    </h4>
                    {isUnlocked && (
                      <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-black uppercase">
                        Desbloqueado
                      </span>
                    )}
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

      {/* MURAL DA FAMÍLIA COM ABAS */}
      <div className="space-y-5 pt-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-2xl font-black font-outfit text-gray-800 dark:text-white">Mural da Família 🏠</h3>
          {myGlobalPosition > 0 && activeTab === 'global' && (
            <span className="text-xs bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 px-3 py-1.5 rounded-full font-bold">
              Você é #{myGlobalPosition} global 🌍
            </span>
          )}
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-100 dark:bg-gray-800/80 p-1 rounded-2xl gap-1">
          <button
            onClick={() => setActiveTab('family')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'family'
                ? 'bg-white dark:bg-gray-700 shadow-md text-indigo-600 dark:text-indigo-400'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            🏠 Família
          </button>
          <button
            onClick={() => setActiveTab('global')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'global'
                ? 'bg-white dark:bg-gray-700 shadow-md text-indigo-600 dark:text-indigo-400'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            🌍 Global
          </button>
        </div>

        {/* Ranking List */}
        <div className="bg-white dark:bg-gray-800 rounded-[3rem] shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          {activeTab === 'family' ? (
            loading ? (
              <div className="flex justify-center items-center gap-3 p-12 text-gray-400">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-400"></div>
                <span className="font-bold">Carregando...</span>
              </div>
            ) : sortedFamily.length === 0 ? (
              <div className="p-12 text-center text-gray-400 font-bold">Nenhum membro encontrado.</div>
            ) : (
              <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
                {sortedFamily.map((profile, index) => (
                  <RankingRow
                    key={profile.id}
                    profile={profile}
                    position={index + 1}
                    currentProfileId={currentProfileId}
                  />
                ))}
              </div>
            )
          ) : loadingGlobal ? (
            <div className="flex justify-center items-center gap-3 p-12 text-gray-400">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-400"></div>
              <span className="font-bold">Carregando ranking global...</span>
            </div>
          ) : globalProfiles.length === 0 ? (
            <div className="p-12 text-center text-gray-400 font-bold">Nenhum dado disponível.</div>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
              {globalProfiles.map((profile, index) => (
                <RankingRow
                  key={profile.id}
                  profile={profile}
                  position={index + 1}
                  currentProfileId={currentProfileId}
                />
              ))}
            </div>
          )}
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
