
import React, { useState, useEffect } from 'react';
import { UserState, ProfileType, AppScreen, ProfileData, AudioRecording, ArtMissionTheme } from './types';
import Navigation from './components/Navigation';
import ProfileSelector from './components/ProfileSelector';
import BibleReader from './components/BibleReader';
import AuthScreen from './components/AuthScreen';
import VerseChallenges from './components/VerseChallenges';
import Shop from './components/Shop';
import GalleryView from './components/GalleryView';
import BibleReadingKids from './components/BibleReadingKids';
import PaintingRoom from './components/PaintingRoom';
import BibleGame from './components/BibleGame';
import ProfileView from './components/ProfileView';
import RankingView from './components/RankingView';
import { generateDailyDevotional } from './services/geminiService';
import { PROFILE_CONFIGS, SHOP_ITEMS } from './constants';
import { Database } from './services/database';
import { AuthService } from './services/authService';
import { ProfileService } from './services/profileService';
import { AccountService } from './services/accountService';

const INITIAL_STATE: UserState = {
  email: null,
  isAuthenticated: false,
  isPremium: false,
  userType: null,
  theme: 'light',
  profiles: [],
  currentProfileId: null
};

const App: React.FC = () => {
  const [user, setUser] = useState<UserState>(() => {
    return Database.getLastSession() || INITIAL_STATE;
  });

  const [screen, setScreen] = useState<AppScreen>(() => {
    const session = Database.getLastSession();
    return session && session.isAuthenticated ? (session.currentProfileId ? 'HOME' : 'PICKER') : 'AUTH';
  });
  
  const [devotional, setDevotional] = useState<any>(null);
  const [loadingDevotional, setLoadingDevotional] = useState(false);
  const [paintingMode, setPaintingMode] = useState<'SELECTION' | 'PHYSICAL'>('SELECTION');

  // Verificar sessão do Supabase e carregar perfis ao inicializar
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const session = await AuthService.getCurrentSession();
        
        if (session?.user) {
          // Usuário autenticado via Supabase
          console.log('✅ Sessão Supabase ativa');
          
          // Carregar dados da conta
          const accountData = await AccountService.getAccount(session.user.id);
          
          // Carregar perfis do Supabase
          const supabaseProfiles = await ProfileService.getProfiles(session.user.id);
          
          // Converter perfis do Supabase para formato local
          const profiles: ProfileData[] = supabaseProfiles.map(sp => ({
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
          }));
          
          // Obter dados do localStorage para mesclar
          const localData = Database.getUserData(session.user.email!);
          
          const newUserState: UserState = {
            email: session.user.email!,
            isAuthenticated: true,
            isPremium: accountData?.is_premium || false,
            userType: null, // user_type agora é por perfil, não por conta
            theme: accountData?.theme || localData?.theme || 'light',
            profiles: profiles.length > 0 ? profiles : (localData?.profiles || []),
            currentProfileId: localData?.currentProfileId || null,
          };
          
          setUser(newUserState);
          Database.saveUserData(newUserState);
          setScreen(newUserState.currentProfileId ? 'HOME' : 'PICKER');
          
          console.log(`✅ Carregados ${profiles.length} perfis do Supabase`);
        } else {
          // Fallback para localStorage (usuários antigos ou offline)
          const lastSession = Database.getLastSession();
          if (lastSession) {
            setUser({ ...lastSession, userType: null });
            setScreen(lastSession.currentProfileId ? 'HOME' : 'PICKER');
            console.log('📦 Usando dados do localStorage');
          }
        }
      } catch (error) {
        console.error('⚠️ Erro ao inicializar autenticação:', error);
        // Em caso de erro, tentar localStorage
        const lastSession = Database.getLastSession();
        if (lastSession) {
          setUser({ ...lastSession, userType: null });
          setScreen(lastSession.currentProfileId ? 'HOME' : 'PICKER');
        }
      }
    };

    initializeAuth();
  }, []);

  useEffect(() => {
    if (user.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [user.theme]);

  const toggleTheme = () => {
    setUser(prev => ({ ...prev, theme: prev.theme === 'light' ? 'dark' : 'light' }));
  };

  const currentProfile = user.profiles.find(p => p.id === user.currentProfileId);
  const isAdult = currentProfile?.type === ProfileType.ADULTS;

  useEffect(() => {
    if (user.isAuthenticated && user.email) {
      Database.saveUserData(user);
    }
  }, [user]);

  useEffect(() => {
    if (user.isAuthenticated && currentProfile && screen === 'HOME' && !devotional) {
      const fetchDevo = async () => {
        setLoadingDevotional(true);
        const data = await generateDailyDevotional(currentProfile.type);
        setDevotional(data);
        setLoadingDevotional(false);
      };
      fetchDevo();
    }
  }, [screen, currentProfile?.type, devotional, user.isAuthenticated]);

  const handleAuthComplete = async (email: string) => {
    try {
      // Tentar obter sessão do Supabase
      const session = await AuthService.getCurrentSession();
      
      if (session?.user) {
        // Carregar dados da conta e perfis do Supabase
        const accountData = await AccountService.getAccount(session.user.id);
        const supabaseProfiles = await ProfileService.getProfiles(session.user.id);
        
        // Converter perfis
        const profiles: ProfileData[] = supabaseProfiles.map(sp => ({
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
        }));
        
        const newUserState: UserState = {
          email,
          isAuthenticated: true,
          isPremium: accountData?.is_premium || false,
          userType: null,
          theme: accountData?.theme || 'light',
          profiles: profiles,
          currentProfileId: null,
        };
        
        setUser(newUserState);
        Database.saveUserData(newUserState);
        setScreen('PICKER');
      } else {
        // Fallback para localStorage
        const data = Database.getUserData(email);
        if (data) {
          setUser({ ...data, userType: null });
          setScreen(data.currentProfileId ? 'HOME' : 'PICKER');
        }
      }
    } catch (error) {
      console.error('Erro ao completar autenticação:', error);
      // Fallback para dados do localStorage
      const data = Database.getUserData(email);
      if (data) {
        setUser({ ...data, userType: null });
        setScreen(data.currentProfileId ? 'HOME' : 'PICKER');
      }
    }
  };

  const handleProfileSelect = (profileId: string) => {
    setUser(prev => ({ ...prev, currentProfileId: profileId }));
    setScreen('HOME');
    setDevotional(null);
  };

  const handleProfileCreate = (name: string, type: ProfileType, avatar: string) => {
    if (user.profiles.length >= 4) {
      alert("⚠️ Você já atingiu o limite de 4 perfis para esta conta.");
      return;
    }

    const newProfile: ProfileData = {
      id: Date.now().toString(),
      name,
      type,
      avatar,
      points: 0,
      coins: 0,
      unlockedItems: ['coloring_book', 'pixel_free'],
      streak: 1,
      lastChallengeDate: null,
      lastArtDate: null,
      favorites: [],
      gallery: [],
      recordings: [],
      paintings: []
    };
    setUser(prev => ({
      ...prev,
      profiles: [...prev.profiles, newProfile],
      currentProfileId: newProfile.id
    }));
    setScreen('HOME');
  };

  const handleProfileUpdate = (id: string, name: string, avatar: string, bio?: string) => {
    setUser(prev => ({
      ...prev,
      profiles: prev.profiles.map(p => p.id === id ? { ...p, name, avatar, bio } : p)
    }));
  };

  const handleVerseChallengeComplete = () => {
    const today = new Date().toISOString().split('T')[0];
    setUser(prev => ({
      ...prev,
      profiles: prev.profiles.map(p => 
        p.id === prev.currentProfileId 
          ? { ...p, coins: (p.coins || 0) + 1, lastChallengeDate: today, points: p.points + 100 }
          : p
      )
    }));
  };

  const handleArtChallengeComplete = (imageUrl: string, isPhysical: boolean = false) => {
    const today = new Date().toISOString().split('T')[0];
    const isFirstToday = currentProfile?.lastArtDate !== today;

    setUser(prev => ({
      ...prev,
      profiles: prev.profiles.map(p => {
        if (p.id === prev.currentProfileId) {
          const newGallery = [...(p.gallery || []), imageUrl];
          if (isPhysical) {
            return { 
              ...p, 
              coins: isFirstToday ? (p.coins || 0) + 1 : p.coins,
              lastArtDate: today,
              gallery: newGallery,
              points: p.points + 100
            };
          }
          return { ...p, gallery: newGallery };
        }
        return p;
      })
    }));
    setScreen('HOME');
  };

  const handleArtMissionThemeGenerated = (theme: ArtMissionTheme) => {
    setUser(prev => ({
      ...prev,
      profiles: prev.profiles.map(p => 
        p.id === prev.currentProfileId ? { ...p, artMissionTheme: theme } : p
      )
    }));
  };

  const handleGameWin = (reward: number) => {
    setUser(prev => ({
      ...prev,
      profiles: prev.profiles.map(p => 
        p.id === prev.currentProfileId 
          ? { ...p, coins: (p.coins || 0) + reward, points: p.points + (reward * 20) }
          : p
      )
    }));
  };

  const handleBuyItem = (item: typeof SHOP_ITEMS[0]) => {
    if (!currentProfile || currentProfile.coins < item.price) return;
    setUser(prev => ({
      ...prev,
      profiles: prev.profiles.map(p => 
        p.id === prev.currentProfileId 
          ? { 
              ...p, 
              coins: p.coins - item.price, 
              unlockedItems: [...p.unlockedItems, item.id]
            }
          : p
      )
    }));
  };

  const handleAddPoints = (p: number) => {
    setUser(prev => ({ 
      ...prev, 
      profiles: prev.profiles.map(prof => 
        prof.id === prev.currentProfileId ? { ...prof, points: prof.points + p } : prof
      )
    }));
  };

  const toggleFavorite = (ref: string) => {
    setUser(prev => ({
      ...prev,
      profiles: prev.profiles.map(prof => {
        if (prof.id === prev.currentProfileId) {
          const exists = prof.favorites.includes(ref);
          return {
            ...prof,
            favorites: exists ? prof.favorites.filter(f => f !== ref) : [...prof.favorites, ref]
          };
        }
        return prof;
      })
    }));
  };

  const handleSaveRecording = (audio: string, ref: string) => {
    const today = new Date().toISOString().split('T')[0];
    const newRecording: AudioRecording = {
      id: Date.now().toString(),
      audio,
      ref,
      date: today
    };

    setUser(prev => ({
      ...prev,
      profiles: prev.profiles.map(p => 
        p.id === prev.currentProfileId 
          ? { 
              ...p, 
              recordings: [...(p.recordings || []), newRecording],
              points: p.points + 20 
            }
          : p
      )
    }));
  };

  const logout = async () => {
    try {
      await AuthService.logout();
    } catch (error) {
      console.error('Erro ao fazer logout do Supabase:', error);
    }
    Database.clearSession();
    setUser(INITIAL_STATE);
    setScreen('AUTH');
    setDevotional(null);
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const isVerseDone = currentProfile?.lastChallengeDate === todayStr;
  const isArtDone = currentProfile?.lastArtDate === todayStr;

  const renderScreen = () => {
    if (!user.isAuthenticated) return <AuthScreen onAuthComplete={handleAuthComplete} />;
    if (screen === 'PICKER' || !currentProfile) return <ProfileSelector profiles={user.profiles} onSelect={handleProfileSelect} onCreate={handleProfileCreate} onUpdate={handleProfileUpdate} onLogout={logout} unlockedItems={currentProfile?.unlockedItems} />;

    switch (screen) {
      case 'HOME':
        return (
          <div className="p-4 md:p-10 max-w-5xl mx-auto space-y-10 animate-in fade-in duration-500">
            {/* Header com Avatar e Nome */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className={`w-16 h-16 md:w-20 md:h-20 rounded-[2rem] overflow-hidden shadow-xl flex items-center justify-center text-4xl md:text-5xl ${PROFILE_CONFIGS[currentProfile.type].color} border-4 border-white dark:border-gray-800`}>
                    {currentProfile.avatar && currentProfile.avatar.startsWith('data:') ? (
                      <img src={currentProfile.avatar} className="w-full h-full object-cover" alt="" />
                    ) : (
                      currentProfile.avatar || PROFILE_CONFIGS[currentProfile.type].icon
                    )}
                 </div>
                 <div>
                    <h1 className="text-3xl md:text-4xl font-black font-outfit text-gray-800 dark:text-white leading-tight">Olá, {currentProfile.name}!</h1>
                    <p className="text-indigo-400 dark:text-indigo-300 font-bold text-xs uppercase tracking-widest">Abençoado dia de estudos!</p>
                 </div>
              </div>
              {!isAdult && (
                <div className="bg-white dark:bg-gray-800 px-6 py-4 rounded-3xl shadow-lg border border-indigo-50 dark:border-gray-700 flex items-center space-x-3 transform hover:scale-105 transition-transform">
                  <span className="text-3xl">🪙</span>
                  <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{currentProfile.coins || 0}</span>
                </div>
              )}
            </div>

            {/* DESTAQUE 1: LEMBRETE DE DEUS */}
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
                     <button onClick={() => setScreen('BIBLE')} className="bg-amber-500 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-amber-200 dark:shadow-none hover:scale-105 transition-all">Abrir na Bíblia</button>
                     <div className="flex-1 bg-white/50 dark:bg-gray-900/40 p-6 rounded-2xl border border-amber-100 dark:border-gray-700">
                        <p className="text-amber-800 dark:text-amber-300 text-sm font-medium leading-relaxed">{devotional.reflection}</p>
                     </div>
                   </div>
                </div>
              </div>
            )}

            {/* Missões Diárias */}
            <div className="bg-white dark:bg-gray-800 rounded-[3.5rem] p-8 md:p-12 border border-gray-100 dark:border-gray-700 shadow-xl relative overflow-hidden">
               <div className="relative z-10">
                 <h2 className="text-3xl font-black font-outfit text-gray-800 dark:text-white mb-10">Missões de Hoje</h2>
                 
                 <div className={`grid gap-8 ${isAdult ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
                    <div 
                      onClick={() => setScreen('CHALLENGES')}
                      className={`group relative overflow-hidden rounded-[3rem] p-10 border-4 transition-all cursor-pointer ${
                        isVerseDone 
                          ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800' 
                          : 'bg-indigo-50 border-indigo-100 dark:bg-indigo-900/20 dark:border-indigo-800 hover:border-indigo-300'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-8">
                        <span className="text-6xl">{isVerseDone ? '✅' : '📖'}</span>
                        <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full ${
                          isVerseDone ? 'bg-emerald-200 text-emerald-700' : 'bg-indigo-200 text-indigo-700'
                        }`}>
                          {isVerseDone ? 'Cumprida' : 'Disponível'}
                        </span>
                      </div>
                      <h3 className={`text-2xl font-black mb-4 ${isVerseDone ? 'text-emerald-700 dark:text-emerald-400' : 'text-indigo-900 dark:text-white'}`}>
                        Missão da Palavra
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                        Encontre o versículo premiado e responda o quiz!
                      </p>
                    </div>

                    {!isAdult && (
                      <div 
                        onClick={() => { setPaintingMode('PHYSICAL'); setScreen('ART_MISSION'); }}
                        className={`group relative overflow-hidden rounded-[3rem] p-10 border-4 transition-all cursor-pointer ${
                          isArtDone 
                            ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800' 
                            : 'bg-pink-50 border-pink-100 dark:bg-pink-900/20 dark:border-pink-800 hover:border-pink-300'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-8">
                          <span className="text-6xl">{isArtDone ? '🎨' : '📸'}</span>
                          <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full ${
                            isArtDone ? 'bg-emerald-200 text-emerald-700' : 'bg-pink-200 text-pink-700'
                          }`}>
                            {isArtDone ? 'Cumprida' : 'Disponível'}
                          </span>
                        </div>
                        <h3 className={`text-2xl font-black mb-4 ${isArtDone ? 'text-emerald-700 dark:text-emerald-400' : 'text-pink-900 dark:text-white'}`}>
                          Missão de Desenho
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                          Desenhe no papel e use a câmera para ganhar moedas!
                        </p>
                      </div>
                    )}
                 </div>
               </div>
            </div>

            {/* BÍBLIA E MINHA VOZ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <button 
                onClick={() => setScreen('BIBLE')} 
                className="relative h-44 bg-gradient-to-br from-indigo-800 to-blue-950 rounded-[3rem] p-8 text-white shadow-2xl overflow-hidden group transition-all hover:scale-[1.02] border-2 border-white/10"
               >
                  <div className="absolute right-[-20px] top-[-20px] text-[12rem] opacity-20 transform group-hover:rotate-12 transition-transform">📖</div>
                  <div className="relative z-10 h-full flex flex-col justify-center items-start text-left">
                     <span className="bg-white/20 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">Leitura Sagrada</span>
                     <h3 className="text-4xl font-black font-outfit">Bíblia</h3>
                     <p className="text-white/70 font-medium mt-2">Navegar pelos Testamentos</p>
                  </div>
               </button>

               {!isAdult && (
                 <button 
                  onClick={() => setScreen('READING')} 
                  className="relative h-44 bg-gradient-to-br from-rose-400 to-orange-400 rounded-[3rem] p-8 text-white shadow-2xl overflow-hidden group transition-all hover:scale-[1.02] border-2 border-white/10"
                 >
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
               <button onClick={() => setScreen('GAMES')} className="flex-1 bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-lg flex flex-col items-center group hover:bg-emerald-50 transition-all">
                  <span className="text-4xl mb-3 group-hover:scale-110 transition-transform">🎮</span>
                  <span className="font-black text-xs uppercase tracking-widest text-gray-800 dark:text-white">Jogar</span>
               </button>
               {!isAdult && (
                 <button onClick={() => setScreen('SHOP')} className="flex-1 bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-lg flex flex-col items-center group hover:bg-yellow-50 transition-all">
                    <span className="text-4xl mb-3 group-hover:scale-110 transition-transform">🛍️</span>
                    <span className="font-black text-xs uppercase tracking-widest text-gray-800 dark:text-white">Loja</span>
                 </button>
               )}
               {!isAdult && (
                 <button onClick={() => { setPaintingMode('SELECTION'); setScreen('ART_MISSION'); }} className="flex-1 bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-lg flex flex-col items-center group hover:bg-pink-50 transition-all">
                    <span className="text-4xl mb-3 group-hover:scale-110 transition-transform">🎨</span>
                    <span className="font-black text-xs uppercase tracking-widest text-gray-800 dark:text-white">Ateliê</span>
                 </button>
               )}
               <button onClick={() => setScreen('RANKING')} className="flex-1 bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-lg flex flex-col items-center group hover:bg-indigo-50 transition-all">
                  <span className="text-4xl mb-3 group-hover:scale-110 transition-transform">🏆</span>
                  <span className="font-black text-xs uppercase tracking-widest text-gray-800 dark:text-white">Jornada</span>
               </button>
            </div>
          </div>
        );
      case 'SHOP': return <Shop coins={currentProfile.coins || 0} unlockedItems={currentProfile.unlockedItems || []} onBuy={handleBuyItem} />;
      case 'ART_MISSION': return <PaintingRoom onSave={handleArtChallengeComplete} savedPaintings={currentProfile.gallery || []} unlockedItems={currentProfile.unlockedItems || []} onNavigateToShop={() => setScreen('SHOP')} initialMode={paintingMode} artMissionTheme={currentProfile.artMissionTheme} onArtMissionThemeGenerated={handleArtMissionThemeGenerated} isArtMissionCompleted={isArtDone} />;
      case 'BIBLE': return <BibleReader onFavorite={toggleFavorite} favorites={currentProfile.favorites} />;
      case 'CHALLENGES': return <VerseChallenges onComplete={handleVerseChallengeComplete} onGoToBible={() => setScreen('BIBLE')} lastChallengeDate={currentProfile.lastChallengeDate} unlockedItems={currentProfile.unlockedItems || []} />;
      case 'READING': return <BibleReadingKids onSaveRecording={handleSaveRecording} recordings={currentProfile.recordings || []} />;
      case 'GALLERY': return <GalleryView images={currentProfile.gallery || []} />;
      case 'PROFILE': return <ProfileView profile={currentProfile} onUpdateProfile={handleProfileUpdate} onSwitchProfile={() => setScreen('PICKER')} onLogout={logout} />;
      case 'RANKING': return <RankingView profiles={user.profiles} currentProfileId={user.currentProfileId} />;
      case 'GAMES': return <BibleGame onWin={handleGameWin} />;
      default: return null;
    }
  };

  return (
    <div className={`min-h-screen transition-all duration-300 dark:bg-gray-900`}>
      {user.isAuthenticated && screen !== 'PICKER' && screen !== 'AUTH' && currentProfile && (
        <Navigation currentScreen={screen} profileType={currentProfile.type} unlockedItems={currentProfile.unlockedItems} onNavigate={(s) => setScreen(s)} onLogout={logout} theme={user.theme} onToggleTheme={toggleTheme} />
      )}
      <main className={`animate-in fade-in slide-in-from-bottom-2 duration-500 ${user.isAuthenticated && screen !== 'PICKER' && screen !== 'AUTH' ? 'pt-16 pb-20 md:pb-8' : ''}`}>
        {renderScreen()}
      </main>
    </div>
  );
};

export default App;
