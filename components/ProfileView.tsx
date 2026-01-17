
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
    <div className="p-4 md:p-8 max-w-4xl mx-auto mb-20 space-y-8 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-gray-800 rounded-[3rem] shadow-xl border border-gray-100 dark:border-gray-700 p-8 md:p-12">
        <div className="flex flex-col items-center text-center space-y-6">
          {/* Avatar Section */}
          <div className="relative group">
            <button
              onClick={onBack}
              className="absolute -left-16 md:-left-32 top-1/2 -translate-y-1/2 p-3 bg-gray-100 dark:bg-gray-700 rounded-xl shadow-md text-xl hover:scale-105 transition-transform hidden md:block"
            >
              ⬅️
            </button>
            <div className={`w-32 h-32 md:w-48 md:h-48 rounded-[2.5rem] overflow-hidden shadow-2xl flex items-center justify-center text-7xl ${PROFILE_CONFIGS[profile.type].color} border-8 border-white dark:border-gray-700`}>
              {avatar || profile.avatar || PROFILE_CONFIGS[profile.type].icon}
            </div>
            {isEditing && (
              <button
                onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                className="absolute -bottom-2 -right-2 bg-indigo-600 text-white w-12 h-12 rounded-full border-4 border-white dark:border-gray-800 flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
              >
                ✏️
              </button>
            )}
          </div>

          {/* Avatar Picker Overlay */}
          {isEditing && showAvatarPicker && (
            <div className="w-full bg-gray-50 dark:bg-gray-900 p-6 rounded-3xl animate-in zoom-in-95">
              <div className="flex flex-wrap justify-center gap-3 mb-4">
                {getAvailableAvatars().map((emoji, i) => (
                  <button
                    key={i}
                    onClick={() => { setAvatar(emoji); setShowAvatarPicker(false); }}
                    className={`w-12 h-12 flex items-center justify-center text-2xl rounded-xl border-2 transition-all ${avatar === emoji ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' : 'border-transparent bg-white dark:bg-gray-800'}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Info Section */}
          <div className="w-full space-y-4">
            {isEditing ? (
              <div className="space-y-4">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                  className="w-full bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-indigo-500 rounded-2xl p-5 text-center text-2xl font-black font-outfit text-gray-800 dark:text-white outline-none"
                />
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Conte um pouco sobre você e sua fé..."
                  className="w-full bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-indigo-500 rounded-2xl p-5 text-gray-700 dark:text-gray-300 outline-none resize-none h-32"
                />
                <div className="flex gap-4">
                  <button onClick={handleSave} className="flex-1 bg-emerald-600 text-white font-black py-4 rounded-2xl shadow-lg">Salvar</button>
                  <button onClick={() => setIsEditing(false)} className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-500 py-4 rounded-2xl">Cancelar</button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="text-4xl font-black font-outfit text-gray-800 dark:text-white">{profile.name}</h2>
                <div className="inline-flex items-center space-x-2 bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2 rounded-full">
                  <span className="text-xl">{currentLevel.icon}</span>
                  <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">{currentLevel.title}</span>
                </div>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
                  {profile.bio || "Nenhuma descrição adicionada ainda. Clique em editar para contar sua história!"}
                </p>
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest"
                >
                  Editar Perfil
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 pt-12 border-t border-gray-100 dark:border-gray-700">
          <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-3xl text-center">
            <span className="text-3xl mb-2 block">🪙</span>
            <span className="text-xl font-black text-gray-800 dark:text-white block">{profile.coins}</span>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Moedas</span>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-3xl text-center">
            <span className="text-3xl mb-2 block">⭐</span>
            <span className="text-xl font-black text-gray-800 dark:text-white block">{profile.points}</span>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pontos</span>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-3xl text-center">
            <span className="text-3xl mb-2 block">🔥</span>
            <span className="text-xl font-black text-gray-800 dark:text-white block">{profile.streak}</span>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Dias Seguindo</span>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-3xl text-center">
            <span className="text-3xl mb-2 block">🖼️</span>
            <span className="text-xl font-black text-gray-800 dark:text-white block">{profile.gallery?.length || 0}</span>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Obras</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <button
          onClick={onSwitchProfile}
          className="w-full bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 font-black py-6 rounded-[2rem] border-4 border-indigo-50 dark:border-indigo-900/30 shadow-lg hover:scale-[1.02] transition-transform flex items-center justify-center gap-3"
        >
          <span>👥</span>
          <span>Trocar Perfil</span>
        </button>

        <button
          onClick={onLogout}
          className="w-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-black py-6 rounded-[2rem] border-4 border-red-100 dark:border-red-900/30 shadow-lg hover:scale-[1.02] transition-transform flex items-center justify-center gap-3"
        >
          <span>🚪</span>
          <span>Sair da Conta</span>
        </button>
      </div>
    </div>
  );
};

export default ProfileView;
