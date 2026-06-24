import { supabase } from './supabase';
import { ReadingMissionEntity } from '../entities/reading-mission.entity';

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
  async getAllMissions(): Promise<ReadingMissionEntity[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('reading_missions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar missões de leitura:', error);
      return [];
    }
    return data.map((d: any) => new ReadingMissionEntity(
      d.id, d.ref, d.text, d.hint, d.verification_question, d.options, d.correct_index, d.active, d.created_at
    ));
  },

  async getActiveMissions(): Promise<ReadingMissionEntity[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('reading_missions')
      .select('*')
      .eq('active', true);

    if (error) {
      console.error('Erro ao buscar missões ativas:', error);
      return [];
    }
    return data.map((d: any) => new ReadingMissionEntity(
      d.id, d.ref, d.text, d.hint, d.verification_question, d.options, d.correct_index, d.active, d.created_at
    ));
  },

  async createMission(mission: Omit<ReadingMissionDb, 'id' | 'created_at'>): Promise<ReadingMissionEntity | null> {
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
    return new ReadingMissionEntity(
      data.id, data.ref, data.text, data.hint, data.verification_question, data.options, data.correct_index, data.active, data.created_at
    );
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

  async getDailyMission(): Promise<ReadingMissionEntity | null> {
    const activeMissions = await this.getActiveMissions();
    if (activeMissions.length === 0) return null;

    const today = new Date();
    const daysSinceEpoch = Math.floor(today.getTime() / (1000 * 60 * 60 * 24));
    
    activeMissions.sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''));
    const missionIndex = daysSinceEpoch % activeMissions.length;
    
    return activeMissions[missionIndex];
  }
};
