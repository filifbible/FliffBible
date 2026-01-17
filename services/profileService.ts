import { supabase } from './supabase';
import { ProfileType, UserType, AudioRecording, ArtMissionTheme } from '../types';

export interface ProfileData {
  id: string;
  account_id: string;
  name: string;
  profile_type: ProfileType;
  user_type: UserType;
  avatar: string | null;
  bio: string | null;
  points: number;
  coins: number;
  streak: number;
  last_challenge_date: string | null;
  last_art_date: string | null;
  last_video_date: string | null;
  unlocked_items: string[];
  favorites: string[];
  gallery: string[];
  recordings: AudioRecording[];
  paintings: string[];
  art_mission_theme: ArtMissionTheme | null;
  created_at: string;
  updated_at: string;
  is_admin?: boolean;
  is_blocked?: boolean;
}

export const ProfileService = {
  /**
   * Cria um novo perfil
   */
  async createProfile(
    accountId: string,
    name: string,
    profileType: ProfileType,
    avatar?: string
  ): Promise<ProfileData | null> {
    if (!supabase) {
      throw new Error('Supabase não está configurado');
    }

    // Mapear ProfileType para UserType
    const userType: UserType = profileType === ProfileType.ADULTS ? UserType.ADULT : UserType.CHILD;

    const { data, error } = await supabase
      .from('profiles')
      .insert({
        account_id: accountId,
        name: name.trim(),
        profile_type: profileType,
        user_type: userType,
        avatar: avatar || null,
        bio: null,
        points: 0,
        coins: 0,
        streak: 1,
        unlocked_items: ['coloring_book', 'pixel_free'],
        favorites: [],
        gallery: [],
        recordings: [],
        paintings: [],
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar perfil:', error);
      throw error;
    }

    return data;
  },

  /**
   * Obtém todos os perfis de uma conta
   */
  async getProfiles(accountId: string): Promise<ProfileData[]> {
    if (!supabase) {
      return [];
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('account_id', accountId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Erro ao buscar perfis:', error);

      // Detectar erro de recursão infinita (Infinite Recursion)
      if (error.code === '42P17') {
        console.error('🚨 ERRO CRÍTICO DE RLS: Recursão infinita detectada nas políticas de segurança.');
        console.error('👉 IMPORTANTE: Execute o script "fix_rls_error.sql" no SQL Editor do Supabase para corrigir.');
        alert('Erro de configuração no banco de dados. Por favor, contate o suporte. (Erro 42P17: RLS Recursion)');
      }

      return [];
    }

    return data || [];
  },

  /**
   * Obtém um perfil específico
   */
  async getProfile(profileId: string): Promise<ProfileData | null> {
    if (!supabase) {
      return null;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', profileId)
      .single();

    if (error) {
      console.error('Erro ao buscar perfil:', error);
      return null;
    }

    return data;
  },

  /**
   * Atualiza um perfil
   */
  async updateProfile(
    profileId: string,
    updates: Partial<Omit<ProfileData, 'id' | 'account_id' | 'created_at' | 'updated_at'>>
  ): Promise<boolean> {
    if (!supabase) {
      return false;
    }

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', profileId);

    if (error) {
      console.error('Erro ao atualizar perfil:', error);
      return false;
    }

    return true;
  },

  /**
   * Atualiza informações básicas do perfil
   */
  async updateProfileInfo(
    profileId: string,
    name: string,
    avatar: string,
    bio?: string
  ): Promise<boolean> {
    return await this.updateProfile(profileId, {
      name: name.trim(),
      avatar,
      bio: bio || null,
    });
  },

  /**
   * Atualiza progresso do perfil
   */
  async updateProgress(
    profileId: string,
    points?: number,
    coins?: number,
    streak?: number
  ): Promise<boolean> {
    const updates: any = {};
    if (points !== undefined) updates.points = points;
    if (coins !== undefined) updates.coins = coins;
    if (streak !== undefined) updates.streak = streak;

    return await this.updateProfile(profileId, updates);
  },

  /**
   * Adiciona pontos e moedas
   */
  async addRewards(
    profileId: string,
    pointsToAdd: number,
    coinsToAdd: number
  ): Promise<boolean> {
    if (!supabase) {
      return false;
    }

    // Primeiro, obter valores atuais
    const profile = await this.getProfile(profileId);
    if (!profile) return false;

    return await this.updateProgress(
      profileId,
      profile.points + pointsToAdd,
      profile.coins + coinsToAdd
    );
  },

  /**
   * Atualiza arrays (favoritos, galeria, etc)
   */
  async updateArrayField(
    profileId: string,
    field: 'unlocked_items' | 'favorites' | 'gallery' | 'recordings' | 'paintings',
    value: any[]
  ): Promise<boolean> {
    return await this.updateProfile(profileId, { [field]: value });
  },

  /**
   * Adiciona item a um array
   */
  async addToArray(
    profileId: string,
    field: 'unlocked_items' | 'favorites' | 'gallery' | 'recordings' | 'paintings',
    item: any
  ): Promise<boolean> {
    const profile = await this.getProfile(profileId);
    if (!profile) return false;

    const currentArray = profile[field] || [];
    const newArray = [...currentArray, item];

    return await this.updateArrayField(profileId, field, newArray);
  },

  /**
   * Remove item de um array
   */
  async removeFromArray(
    profileId: string,
    field: 'favorites',
    item: any
  ): Promise<boolean> {
    const profile = await this.getProfile(profileId);
    if (!profile) return false;

    const currentArray = profile[field] || [];
    const newArray = currentArray.filter((i: any) => i !== item);

    return await this.updateArrayField(profileId, field, newArray);
  },

  /**
   * Atualiza datas de última atividade
   */
  async updateLastActivity(
    profileId: string,
    activityType: 'challenge' | 'art' | 'video'
  ): Promise<boolean> {
    const today = new Date().toISOString().split('T')[0];
    const fieldMap = {
      challenge: 'last_challenge_date',
      art: 'last_art_date',
      video: 'last_video_date',
    };

    return await this.updateProfile(profileId, {
      [fieldMap[activityType]]: today,
    });
  },

  /**
   * Deleta um perfil
   */
  async deleteProfile(profileId: string): Promise<boolean> {
    if (!supabase) {
      return false;
    }

    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', profileId);

    if (error) {
      console.error('Erro ao deletar perfil:', error);
      return false;
    }

    return true;
  },

  /**
   * ADMIN: Obtém TODOS os perfis do banco (apenas para admins)
   */
  async getAllAllProfiles(): Promise<ProfileData[]> {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar todos os perfis:', error);
      return [];
    }

    return data || [];
  },

  /**
   * ADMIN: Atualiza status de bloqueio ou admin de um perfil
   */
  async updateProfileStatus(profileId: string, updates: { is_blocked?: boolean, is_admin?: boolean }): Promise<boolean> {
    if (!supabase) return false;

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', profileId);

    if (error) {
      console.error('Erro ao atualizar status do perfil:', error);
      return false;
    }

    return true;
  },
};
