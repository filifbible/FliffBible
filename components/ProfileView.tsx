
import React, { useState } from 'react';
import { ProfileData } from '../types';
import { PROFILE_CONFIGS, REWARD_LEVELS, AVATAR_OPTIONS, SHOP_AVATARS } from '../constants';

interface ProfileViewProps {
  profile: ProfileData;
  onUpdateProfile: (id: string, name: string, avatar: string, bio?: string) => void;
  onSwitchProfile: () => void;
  onLogout: () => void;
  onBack: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ profile, onUpdateProfile, onSwitchProfile, onLogout, onBack }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(profile.name);
  const [bio, setBio] = useState(profile.bio || '');
  const [avatar, setAvatar] = useState(profile.avatar || '');
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const currentLevel = [...REWARD_LEVELS].reverse().find(l => profile.points >= l.points) || REWARD_LEVELS[0];

  const handleSave = () => {
    onUpdateProfile(profile.id, name, avatar, bio);
    setIsEditing(false);
  };

  const getAvailableAvatars = () => {
    const list = [...AVATAR_OPTIONS];
    profile.unlockedItems?.forEach(item => {
      if (SHOP_AVATARS[item]) list.push(SHOP_AVATARS[item]);
    });
    return list;
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto mb-20 space-y-8 animate-in fade-in duration-500 font-outfit relative">

      {/* Background Blobs */}
      <div className="absolute top-20 right-0 -translate-y-1/2 translate-x-1/4 bg-blob-indigo opacity-50"></div>
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 bg-blob-pink opacity-50"></div>

      <div className="bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl rounded-[3rem] shadow-2xl border border-white/50 dark:border-gray-800/50 p-8 md:p-12 relative z-10 transition-colors duration-300">
        <div className="flex flex-col items-center text-center space-y-6">
          {/* Avatar Section */}
          <div className="relative group">
            <button
              onClick={onBack}
              className="absolute -left-16 md:-left-32 top-1/2 -translate-y-1/2 p-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md rounded-2xl shadow-lg hover:shadow-xl text-xl hover:scale-105 transition-all hidden md:block border border-white/50 dark:border-gray-700"
            >
              ⬅️
            </button>
            <div className={`w-32 h-32 md:w-48 md:h-48 rounded-[2.5rem] overflow-hidden shadow-2xl flex items-center justify-center text-7xl ${PROFILE_CONFIGS[profile.type].color} border-8 border-white/80 dark:border-gray-800/80 relative`}>
              <div className="absolute inset-0 bg-gradient-to-tr from-black/10 to-transparent"></div>
              <span className="relative drop-shadow-md">{avatar || profile.avatar || PROFILE_CONFIGS[profile.type].icon}</span>
            </div>
            {isEditing && (
              <button
                onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                className="absolute -bottom-2 -right-2 bg-indigo-600 text-white w-14 h-14 rounded-full border-4 border-white dark:border-gray-800 flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
              >
                ✏️
              </button>
            )}
          </div>

          {/* Avatar Picker Overlay */}
          {isEditing && showAvatarPicker && (
            <div className="w-full bg-gray-50/90 dark:bg-gray-900/90 backdrop-blur-sm p-6 rounded-3xl animate-in zoom-in-95 border border-gray-200 dark:border-gray-700 shadow-inner">
              <div className="flex flex-wrap justify-center gap-3 mb-4">
                {getAvailableAvatars().map((emoji, i) => (
                  <button
                    key={i}
                    onClick={() => { setAvatar(emoji); setShowAvatarPicker(false); }}
                    className={`w-14 h-14 flex items-center justify-center text-3xl rounded-2xl border-2 transition-all ${avatar === emoji ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' : 'border-transparent bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Info Section */}
          <div className="w-full space-y-6">
            {isEditing ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Nome</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome"
                    className="w-full bg-gray-50/50 dark:bg-gray-900/50 border-2 border-transparent focus:border-indigo-500 rounded-2xl p-5 text-center text-3xl font-black font-outfit text-gray-800 dark:text-white outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-gray-700"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Bio</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Conte um pouco sobre você e sua fé..."
                    className="w-full bg-gray-50/50 dark:bg-gray-900/50 border-2 border-transparent focus:border-indigo-500 rounded-2xl p-5 text-gray-700 dark:text-gray-300 outline-none resize-none h-32 transition-all placeholder:text-gray-300 dark:placeholder:text-gray-700"
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button onClick={handleSave} className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-black py-5 rounded-2xl shadow-xl hover:shadow-emerald-500/20 transition-all hover:scale-[1.02]">Salvar Alterações</button>
                  <button onClick={() => setIsEditing(false)} className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-bold py-5 rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Cancelar</button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                <h2 className="text-5xl font-black font-outfit text-gray-800 dark:text-white tracking-tight">{profile.name}</h2>
                <div className="inline-flex items-center space-x-3 bg-white dark:bg-gray-800 border border-indigo-100 dark:border-gray-700 px-6 py-3 rounded-full shadow-sm">
                  <span className="text-2xl">{currentLevel.icon}</span>
                  <div className="flex flex-col items-start">
                    <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 leading-none mb-1">Nível Atual</span>
                    <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest leading-none">{currentLevel.title}</span>
                  </div>
                </div>
                <p className="text-lg text-gray-500 dark:text-gray-400 max-w-lg mx-auto leading-relaxed font-medium">
                  {profile.bio || "Nenhuma descrição adicionada ainda."}
                </p>
                <div className="pt-4">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
                  >
                    Editar Perfil
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 pt-12 border-t border-gray-100 dark:border-gray-800">
          <div className="bg-gray-50/50 dark:bg-gray-900/30 p-6 rounded-3xl text-center border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900/30 transition-all group">
            <span className="text-4xl mb-3 block group-hover:scale-110 transition-transform">🪙</span>
            <span className="text-2xl font-black text-gray-800 dark:text-white block mb-1">{profile.coins}</span>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-indigo-500 transition-colors">Moedas</span>
          </div>
          <div className="bg-gray-50/50 dark:bg-gray-900/30 p-6 rounded-3xl text-center border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900/30 transition-all group">
            <span className="text-4xl mb-3 block group-hover:scale-110 transition-transform">⭐</span>
            <span className="text-2xl font-black text-gray-800 dark:text-white block mb-1">{profile.points}</span>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-amber-500 transition-colors">Pontos</span>
          </div>
          <div className="bg-gray-50/50 dark:bg-gray-900/30 p-6 rounded-3xl text-center border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900/30 transition-all group">
            <span className="text-4xl mb-3 block group-hover:scale-110 transition-transform">🔥</span>
            <span className="text-2xl font-black text-gray-800 dark:text-white block mb-1">{profile.streak}</span>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-orange-500 transition-colors">Dias</span>
          </div>
          <div className="bg-gray-50/50 dark:bg-gray-900/30 p-6 rounded-3xl text-center border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900/30 transition-all group">
            <span className="text-4xl mb-3 block group-hover:scale-110 transition-transform">🖼️</span>
            <span className="text-2xl font-black text-gray-800 dark:text-white block mb-1">{profile.gallery?.length || 0}</span>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-pink-500 transition-colors">Obras</span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 relative z-10">
        <button
          onClick={onSwitchProfile}
          className="w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-md text-indigo-600 dark:text-indigo-400 font-black py-6 rounded-[2.5rem] border-2 border-indigo-100 dark:border-indigo-900/30 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3 group"
        >
          <span className="text-2xl group-hover:scale-110 transition-transform">👥</span>
          <span className="uppercase tracking-widest text-sm">Trocar Perfil</span>
        </button>

        <button
          onClick={onLogout}
          className="w-full bg-red-50/80 dark:bg-red-900/10 backdrop-blur-md text-red-600 dark:text-red-400 font-black py-6 rounded-[2.5rem] border-2 border-red-100 dark:border-red-900/30 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3 group"
        >
          <span className="text-2xl group-hover:scale-110 transition-transform">🚪</span>
          <span className="uppercase tracking-widest text-sm">Sair da Conta</span>
        </button>
      </div>
    </div>
  );
};

export default ProfileView;
