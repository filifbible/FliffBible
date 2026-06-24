import React, { useState, useEffect } from 'react';
import { ProfileType, ProfileData } from '../types';
import { AVATAR_OPTIONS, SHOP_AVATARS } from '../constants';
import { ProfileService } from '../services/profileService';

interface EditProfileModalProps {
  profileId: string;
  onClose: () => void;
  onUpdate: () => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ profileId, onClose, onUpdate }) => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [newName, setNewName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ProfileService.getProfile(profileId).then(data => {
      if (data) {
        setProfile(data as any);
        setNewName(data.name);
        setSelectedAvatar(data.avatar || AVATAR_OPTIONS[0]);
      }
      setLoading(false);
    });
  }, [profileId]);

  const getAvailableAvatars = () => {
    const list = [...AVATAR_OPTIONS];
    if (profile?.unlockedItems) {
      profile.unlockedItems.forEach((item: string) => {
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

    try {
      await ProfileService.updateProfileInfo(profileId, newName.trim(), selectedAvatar);
      onUpdate();
      onClose();
    } catch (err) {
      setError('Erro ao salvar o perfil.');
    }
  };

  if (loading) return null;

  const availableAvatars = getAvailableAvatars();

  return (
    <div className="fixed inset-0 z-[120] bg-black/60 flex items-center justify-center p-6 animate-in fade-in duration-200" onClick={onClose}>
      <div className="w-full max-w-lg bg-gray-50 dark:bg-gray-900 p-8 rounded-[2rem] shadow-2xl border border-gray-100 dark:border-gray-800" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold font-outfit text-gray-800 dark:text-white">Editar Perfil</h2>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:text-red-500 transition-colors text-xl">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-24 h-24 rounded-full border-4 border-indigo-500 shadow-xl overflow-hidden flex items-center justify-center bg-white dark:bg-gray-800">
              <span className="text-5xl">{selectedAvatar}</span>
            </div>

            <div className="w-full max-h-40 overflow-y-auto no-scrollbar p-2">
              <div className="flex flex-wrap justify-center gap-2">
                {availableAvatars.map((emoji, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedAvatar(emoji)}
                    className={`w-10 h-10 flex items-center justify-center text-xl rounded-xl border-2 transition-all ${selectedAvatar === emoji ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' : 'border-transparent bg-white dark:bg-gray-800 hover:bg-gray-50'}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {error && <div className="text-red-500 text-sm font-bold text-center bg-red-50 dark:bg-red-900/20 p-3 rounded-xl">{error}</div>}
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider ml-1">Nome do Perfil</label>
              <input
                type="text"
                maxLength={20}
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-4 font-black text-gray-800 dark:text-white focus:border-indigo-500 outline-none transition-colors"
                placeholder="Ex: Joãozinho"
              />
            </div>
          </div>

          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-xl transition-all active:scale-[0.98]">
            Salvar Alterações
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
