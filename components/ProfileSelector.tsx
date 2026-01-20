

import React, { useState } from 'react';
import { ProfileType, ProfileData, UserType } from '../types';
import { PROFILE_CONFIGS, AVATAR_OPTIONS, SHOP_AVATARS } from '../constants';
import { AuthService } from '../services/authService';
import { ProfileService } from '../services/profileService';

interface ProfileSelectorProps {
  profiles: ProfileData[];
  onSelect: (profileId: string) => void;
  onCreate: (name: string, type: ProfileType, avatar: string) => void;
  onUpdate: (id: string, name: string, avatar: string) => void;
  onLogout: () => void;
  unlockedItems?: string[];
}

const ProfileSelector: React.FC<ProfileSelectorProps> = ({ profiles, onSelect, onCreate, onUpdate, onLogout, unlockedItems = [] }) => {
  const [editingProfile, setEditingProfile] = useState<ProfileData | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<ProfileType>(ProfileType.ADULTS);
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0]);
  const [error, setError] = useState('');

  const isLimitReached = profiles.length >= 4;

  // Calcula avatares disponíveis baseados no perfil sendo editado
  const getAvailableAvatars = () => {
    const list = [...AVATAR_OPTIONS];
    // Se estiver editando, usa os itens desbloqueados DAQUELE perfil
    if (editingProfile) {
      editingProfile.unlockedItems?.forEach(item => {
        if (SHOP_AVATARS[item]) list.push(SHOP_AVATARS[item]);
      });
    } else {
      // Se for criação, usa os itens passados via prop (geralmente vazios para novos perfis)
      unlockedItems.forEach(item => {
        if (SHOP_AVATARS[item]) list.push(SHOP_AVATARS[item]);
      });
    }
    return list;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newName.trim()) {
      setError('⚠️ Por favor, digite um nome para o perfil!');
      return;
    }

    if (editingProfile) {
      onUpdate(editingProfile.id, newName.trim(), selectedAvatar);
      setEditingProfile(null);
    } else {
      if (isLimitReached) {
        setError('⚠️ Limite de 4 perfis atingido.');
        return;
      }

      // Criar perfil localmente primeiro
      onCreate(newName.trim(), newType, selectedAvatar);

      // Criar perfil no Supabase
      try {
        const session = await AuthService.getCurrentSession();
        if (session?.user) {
          await ProfileService.createProfile(
            session.user.id,
            newName.trim(),
            newType,
            selectedAvatar
          );
          console.log(`✅ Perfil criado no Supabase: ${newName} (${newType})`);
        }
      } catch (error) {
        console.error('Erro ao criar perfil no Supabase:', error);
        // Não bloqueia a criação do perfil mesmo se falhar (fallback para localStorage)
      }
    }

    setNewName('');
    setShowAddForm(false);
  };

  const handleEdit = (p: ProfileData, e: React.MouseEvent) => {
    e.stopPropagation();
    setError('');
    setEditingProfile(p);
    setNewName(p.name);
    setNewType(p.type);
    setSelectedAvatar(p.avatar || AVATAR_OPTIONS[0]);
    setShowAddForm(true);
  };

  if (showAddForm) {
    const availableAvatars = getAvailableAvatars();

    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center p-6 text-gray-800 dark:text-white animate-in zoom-in-95 duration-300">
        <div className="w-full max-w-2xl bg-gray-50 dark:bg-gray-900 p-8 md:p-12 rounded-[3rem] shadow-2xl border border-gray-100 dark:border-gray-800">
          <h1 className="text-3xl font-bold mb-8 font-outfit text-center">
            {editingProfile ? 'Editar Perfil' : 'Novo Perfil'}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex flex-col items-center space-y-6">
              <div className="relative">
                <div
                  className={`w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-indigo-500 shadow-xl overflow-hidden flex items-center justify-center bg-white dark:bg-gray-800 relative group`}
                >
                  <span className="text-6xl md:text-7xl">{selectedAvatar}</span>
                </div>
              </div>

              <div className="flex flex-col items-center">
                <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-tighter">Escolha seu avatar</p>
              </div>

              <div className="w-full max-h-48 overflow-y-auto no-scrollbar p-2">
                <div className="flex flex-wrap justify-center gap-3">
                  {availableAvatars.map((emoji, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedAvatar(emoji)}
                      className={`w-12 h-12 flex items-center justify-center text-2xl rounded-xl border-2 transition-all ${selectedAvatar === emoji ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' : 'border-transparent bg-white dark:bg-gray-800 hover:bg-gray-50'}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6 text-center">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-2xl font-bold text-sm animate-bounce mb-4 border border-red-100 dark:border-red-900/40">
                  {error}
                </div>
              )}
              <input
                type="text"
                value={newName}
                onChange={(e) => { setNewName(e.target.value); if (error) setError(''); }}
                placeholder="Nome do Perfil"
                className="w-full bg-white dark:bg-gray-800 border-2 border-transparent rounded-2xl p-5 text-gray-800 dark:text-white outline-none text-lg focus:ring-4 focus:ring-indigo-100"
              />
              {!editingProfile && (
                <div className="grid grid-cols-2 gap-4">
                  {(Object.entries(PROFILE_CONFIGS) as [ProfileType, any][]).map(([type, config]) => (
                    <button key={type} type="button" onClick={() => setNewType(type)} className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center ${newType === type ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' : 'border-transparent bg-white dark:bg-gray-800 opacity-60'}`}>
                      <span className="text-3xl">{config.icon}</span>
                      <span className="text-[10px] font-black uppercase">{config.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <button type="submit" className="flex-1 bg-indigo-600 text-white font-bold py-5 rounded-2xl shadow-xl">Salvar</button>
              <button type="button" onClick={() => { setShowAddForm(false); setEditingProfile(null); }} className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-500 font-bold py-5 rounded-2xl">Cancelar</button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col items-center justify-center p-6 animate-in fade-in duration-700 relative overflow-hidden font-outfit">

      {/* Background Blobs */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 bg-blob-indigo"></div>
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 bg-blob-pink"></div>

      <div className="relative z-10 w-full max-w-5xl flex flex-col items-center">
        <h1 className="text-4xl md:text-6xl font-black mb-16 text-indigo-900 dark:text-white text-center tracking-tight drop-shadow-sm">Quem está estudando hoje?</h1>

        <div className="flex flex-wrap justify-center gap-8 md:gap-14">
          {profiles.map((profile) => (
            <div key={profile.id} className="relative group perspective-1000">
              <button
                onClick={() => onSelect(profile.id)}
                className="flex flex-col items-center space-y-6 transform transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <div className={`w-32 h-32 md:w-44 md:h-44 rounded-[2.5rem] flex items-center justify-center text-6xl md:text-8xl shadow-xl hover:shadow-2xl transition-all border-4 border-transparent group-hover:border-indigo-500/50 overflow-hidden ${PROFILE_CONFIGS[profile.type].color} relative`}>
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/10 to-transparent"></div>
                  <span className="relative drop-shadow-md transform group-hover:scale-110 transition-transform duration-300">{profile.avatar}</span>
                </div>
                <span className="text-xl md:text-2xl font-bold text-gray-700 dark:text-gray-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors tracking-tight">{profile.name}</span>
              </button>
              <button
                onClick={(e) => handleEdit(profile, e)}
                className="absolute -top-2 -right-2 bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-gray-50 dark:hover:bg-gray-700 hover:scale-110 border border-gray-100 dark:border-gray-700"
              >
                ✏️
              </button>
            </div>
          ))}

          {!isLimitReached ? (
            <button
              onClick={() => { setEditingProfile(null); setNewName(''); setSelectedAvatar(AVATAR_OPTIONS[0]); setError(''); setShowAddForm(true); }}
              className="group flex flex-col items-center space-y-6 transform transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <div className="w-32 h-32 md:w-44 md:h-44 rounded-[2.5rem] bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-4 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center text-5xl transition-all group-hover:border-indigo-500/50 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 text-gray-300 dark:text-gray-600 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                +
              </div>
              <span className="text-xl md:text-2xl font-bold text-gray-400 dark:text-gray-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors tracking-tight">Novo Perfil</span>
            </button>
          ) : (
            <div className="flex flex-col items-center space-y-6 opacity-50 grayscale cursor-not-allowed">
              <div className="w-32 h-32 md:w-44 md:h-44 rounded-[2.5rem] bg-gray-100 dark:bg-gray-800 border-4 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center text-5xl">🔒</div>
              <span className="text-xs font-black text-gray-400 uppercase tracking-widest text-center max-w-[120px]">Limite Atingido</span>
            </div>
          )}
        </div>

        <button
          onClick={onLogout}
          className="mt-24 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 font-bold text-xs uppercase tracking-widest bg-white/50 dark:bg-gray-900/50 px-8 py-3 rounded-full border border-gray-100 dark:border-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-200 dark:hover:border-red-800/30 transition-all"
        >
          Sair da Conta
        </button>
      </div>
    </div>
  );
};


export default ProfileSelector;
