'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import dynamic from 'next/dynamic';
import { ProfileService } from '@/services/profileService';
import { ProfileData, ProfileType } from '@/types';
import { PROFILE_CONFIGS } from '@/constants';
import { generateDailyDevotional } from '@/services/geminiService';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

const Navigation = dynamic(() => import('@/components/Navigation'), { ssr: false });

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [devotional, setDevotional] = useState<any>(null);
  const [loadingDevo, setLoadingDevo] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const saved = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (saved) setTheme(saved);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { router.replace('/auth'); return; }

      const profileId = localStorage.getItem('selectedProfileId');
      if (!profileId) { router.replace('/home'); return; }

      const data = await ProfileService.getProfile(profileId);
      if (!data) { router.replace('/home'); return; }

      const p: ProfileData = {
        id: data.id, name: data.name,
        type: (data.profile_type as ProfileType) ?? ProfileType.ADULTS,
        avatar: data.avatar ?? undefined,
        bio: data.bio ?? undefined,
        points: data.points, coins: data.coins, streak: data.streak,
        unlockedItems: data.unlocked_items ?? [],
        favorites: data.favorites ?? [], gallery: data.gallery ?? [],
        recordings: data.recordings ?? [], paintings: data.paintings ?? [],
        lastChallengeDate: data.last_challenge_date,
        lastArtDate: data.last_art_date,
        is_admin: data.is_admin, is_blocked: data.is_blocked,
      };
      setProfile(p);

      // Carrega devocional
      if (!devotional) {
        setLoadingDevo(true);
        try {
          const devo = await generateDailyDevotional(p.type);
          setDevotional(devo);
        } catch (e) { /* silently fail */ }
        setLoadingDevo(false);
      }
    }
    load();
  }, [router]);

  const handleLogout = async () => {
    localStorage.removeItem('selectedProfileId');
    await supabase.auth.signOut();
    router.replace('/auth');
  };

  if (!profile) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif', color: '#64748b' }}>
        Carregando...
      </div>
    );
  }

  const isAdult = profile.type === ProfileType.ADULTS;
  const todayStr = new Date().toISOString().split('T')[0];
  const isVerseDone = profile.lastChallengeDate === todayStr;
  const isArtDone = profile.lastArtDate === todayStr;
  const profileConfig = PROFILE_CONFIGS[profile.type];

  return (
    <Navigation
      profileType={profile.type}
      profileId={profile.id}
      unlockedItems={profile.unlockedItems}
      isAdmin={profile.is_admin}
      theme={theme}
      onToggleTheme={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
      onLogout={handleLogout}
    >
      <div className="p-4 md:p-10 max-w-5xl mx-auto space-y-10 animate-in fade-in duration-500">

        {/* Header com Avatar e Nome */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 md:w-20 md:h-20 rounded-[2rem] overflow-hidden shadow-xl flex items-center justify-center text-4xl md:text-5xl ${profileConfig.color} border-4 border-white dark:border-gray-800`}>
              {profile.avatar || profileConfig.icon}
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black font-outfit text-gray-800 dark:text-white leading-tight">
                Olá, {profile.name}!
              </h1>
              <p className="text-indigo-400 dark:text-indigo-300 font-bold text-xs uppercase tracking-widest">
                Abençoado dia de estudos!
              </p>
            </div>
          </div>
          {!isAdult && (
            <div className="bg-white dark:bg-gray-800 px-6 py-4 rounded-3xl shadow-lg border border-indigo-50 dark:border-gray-700 flex items-center space-x-3 transform hover:scale-105 transition-transform">
              <span className="text-3xl">🪙</span>
              <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{profile.coins || 0}</span>
            </div>
          )}
        </div>

        {/* Lembrete de Deus (Devocional) */}
        {devotional && (
          <div className="bg-[#FFF9F2] dark:bg-gray-800 p-10 md:p-14 rounded-[3.5rem] shadow-xl border-4 border-amber-100/50 dark:border-gray-700 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-10 text-[10rem] opacity-5 rotate-12 group-hover:rotate-0 transition-transform">✨</div>
            <div className="relative z-10">
              <div className="inline-flex items-center space-x-2 bg-amber-200/40 dark:bg-amber-900/30 px-6 py-2 rounded-full mb-6">
                <span className="text-xl">🌟</span>
                <p className="text-amber-700 dark:text-amber-400 font-black uppercase tracking-[0.2em] text-[10px]">Lembrete de Deus</p>
              </div>
              <h2 className="text-4xl font-black font-outfit mb-6 text-gray-800 dark:text-white">{devotional.verseRef}</h2>
              <p className="text-2xl italic leading-relaxed mb-10 text-gray-700 dark:text-gray-300 font-serif">"{devotional.verseText}"</p>
              <div className="flex flex-col md:flex-row gap-4">
                <button onClick={() => router.push('/bible')} className="bg-amber-500 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-amber-200 dark:shadow-none hover:scale-105 transition-all">
                  Abrir na Bíblia
                </button>
                <div className="flex-1 bg-white/50 dark:bg-gray-900/40 p-6 rounded-2xl border border-amber-100 dark:border-gray-700">
                  <p className="text-amber-800 dark:text-amber-300 text-sm font-medium leading-relaxed">{devotional.reflection}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Missões de Hoje */}
        <div className="bg-white dark:bg-gray-800 rounded-[3.5rem] p-8 md:p-12 border border-gray-100 dark:border-gray-700 shadow-xl">
          <h2 className="text-3xl font-black font-outfit text-gray-800 dark:text-white mb-10">Missões de Hoje</h2>
          <div className={`grid gap-8 ${isAdult ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>

            {/* Missão da Palavra */}
            <div onClick={() => router.push('/challenges')} className={`group relative overflow-hidden rounded-[3rem] p-10 border-4 transition-all cursor-pointer ${isVerseDone ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800' : 'bg-indigo-50 border-indigo-100 dark:bg-indigo-900/20 dark:border-indigo-800 hover:border-indigo-300'}`}>
              <div className="flex justify-between items-center mb-8">
                <span className="text-6xl">{isVerseDone ? '✅' : '📖'}</span>
                <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full ${isVerseDone ? 'bg-emerald-200 text-emerald-700' : 'bg-indigo-200 text-indigo-700'}`}>
                  {isVerseDone ? 'Cumprida' : 'Disponível'}
                </span>
              </div>
              <h3 className={`text-2xl font-black mb-4 ${isVerseDone ? 'text-emerald-700 dark:text-emerald-400' : 'text-indigo-900 dark:text-white'}`}>Missão da Palavra</h3>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed font-medium">Encontre o versículo premiado e responda o quiz!</p>
            </div>

            {/* Missão de Desenho (apenas crianças) */}
            {!isAdult && (
              <div onClick={() => router.push('/games')} className={`group relative overflow-hidden rounded-[3rem] p-10 border-4 transition-all cursor-pointer ${isArtDone ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800' : 'bg-pink-50 border-pink-100 dark:bg-pink-900/20 dark:border-pink-800 hover:border-pink-300'}`}>
                <div className="flex justify-between items-center mb-8">
                  <span className="text-6xl">{isArtDone ? '🎨' : '📸'}</span>
                  <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full ${isArtDone ? 'bg-emerald-200 text-emerald-700' : 'bg-pink-200 text-pink-700'}`}>
                    {isArtDone ? 'Cumprida' : 'Disponível'}
                  </span>
                </div>
                <h3 className={`text-2xl font-black mb-4 ${isArtDone ? 'text-emerald-700 dark:text-emerald-400' : 'text-pink-900 dark:text-white'}`}>Missão de Desenho</h3>
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed font-medium">Desenhe no papel e use a câmera para ganhar moedas!</p>
              </div>
            )}
          </div>
        </div>

        {/* Bíblia e Voz da Fé */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button onClick={() => router.push('/bible')} className="relative h-44 bg-gradient-to-br from-indigo-800 to-blue-950 rounded-[3rem] p-8 text-white shadow-2xl overflow-hidden group transition-all hover:scale-[1.02] border-2 border-white/10">
            <div className="absolute right-[-20px] top-[-20px] text-[12rem] opacity-20 transform group-hover:rotate-12 transition-transform">📖</div>
            <div className="relative z-10 h-full flex flex-col justify-center items-start text-left">
              <span className="bg-white/20 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">Leitura Sagrada</span>
              <h3 className="text-4xl font-black font-outfit">Bíblia</h3>
              <p className="text-white/70 font-medium mt-2">Navegar pelos Testamentos</p>
            </div>
          </button>

          {!isAdult && (
            <button onClick={() => router.push('/bible')} className="relative h-44 bg-gradient-to-br from-rose-400 to-orange-400 rounded-[3rem] p-8 text-white shadow-2xl overflow-hidden group transition-all hover:scale-[1.02] border-2 border-white/10">
              <div className="absolute right-[-20px] top-[-20px] text-[12rem] opacity-20 transform group-hover:rotate-12 transition-transform">🎤</div>
              <div className="relative z-10 h-full flex flex-col justify-center items-start text-left">
                <span className="bg-white/20 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">Minha Voz</span>
                <h3 className="text-4xl font-black font-outfit">Voz da Fé</h3>
                <p className="text-white/70 font-medium mt-2">Grave suas leituras favoritas</p>
              </div>
            </button>
          )}
        </div>

        {/* Atalhos */}
        <div className="flex flex-wrap gap-4">
          {[
            { label: 'Jogar',   icon: '🎮', route: '/games',   hover: 'hover:bg-emerald-50' },
            ...(!isAdult ? [
              { label: 'Loja',   icon: '🛍️', route: '/shop',    hover: 'hover:bg-yellow-50' },
              { label: 'Ateliê', icon: '🎨', route: '/games',   hover: 'hover:bg-pink-50' },
            ] : []),
            { label: 'Jornada', icon: '🏆', route: '/ranking', hover: 'hover:bg-indigo-50' },
          ].map(item => (
            <button key={item.label} onClick={() => router.push(item.route)}
              className={`flex-1 bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-lg flex flex-col items-center group ${item.hover} transition-all`}
            >
              <span className="text-4xl mb-3 group-hover:scale-110 transition-transform">{item.icon}</span>
              <span className="font-black text-xs uppercase tracking-widest text-gray-800 dark:text-white">{item.label}</span>
            </button>
          ))}
        </div>

      </div>
    </Navigation>
  );
}
