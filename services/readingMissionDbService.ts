import { supabase } from './supabase';

export interface ReadingMissionDb {
  id?: string;
  ref: string;
  text: string;
  hint: string;
  verification_question: string;
  options: string[];
  correct_index: number;
  active: boolean;
  created_at?: string;
}

export const ReadingMissionDbService = {
  async getAllMissions(): Promise<ReadingMissionDb[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('reading_missions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar missões de leitura:', error);
      return [];
    }
    return data as ReadingMissionDb[];
  },

  async getActiveMissions(): Promise<ReadingMissionDb[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('reading_missions')
      .select('*')
      .eq('active', true);

    if (error) {
      console.error('Erro ao buscar missões ativas:', error);
      return [];
    }
    return data as ReadingMissionDb[];
  },

  async createMission(mission: Omit<ReadingMissionDb, 'id' | 'created_at'>): Promise<ReadingMissionDb | null> {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('reading_missions')
      .insert(mission)
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar missão de leitura:', error);
      return null;
    }
    return data as ReadingMissionDb;
  },

  async toggleMissionStatus(id: string, active: boolean): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await supabase
      .from('reading_missions')
      .update({ active })
      .eq('id', id);

    if (error) {
      console.error('Erro ao atualizar missão:', error);
      return false;
    }
    return true;
  },

  async deleteMission(id: string): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await supabase
      .from('reading_missions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar missão:', error);
      return false;
    }
    return true;
  },

  async getDailyMission(): Promise<ReadingMissionDb | null> {
    const activeMissions = await this.getActiveMissions();
    if (activeMissions.length === 0) return null;

    const today = new Date();
    const daysSinceEpoch = Math.floor(today.getTime() / (1000 * 60 * 60 * 24));
    
    activeMissions.sort((a, b) => (a.created_at || '').localeCompare(b.created_at || ''));
    const missionIndex = daysSinceEpoch % activeMissions.length;
    
    return activeMissions[missionIndex];
  }
};
