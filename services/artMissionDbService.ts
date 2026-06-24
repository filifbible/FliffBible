import { supabase } from './supabase';
import { ArtMissionEntity } from '../entities/art-mission.entity';

export interface ArtMissionDb {
  id?: string;
  title: string;
  instruction: string;
  icon: string;
  active: boolean;
  created_at?: string;
}

export const ArtMissionDbService = {
  async getAllMissions(): Promise<ArtMissionEntity[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('art_missions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar missões:', error);
      return [];
    }
    return data.map((d: any) => new ArtMissionEntity(
      d.id, d.title, d.instruction, d.icon, d.active, d.created_at
    ));
  },

  async getActiveMissions(): Promise<ArtMissionEntity[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('art_missions')
      .select('*')
      .eq('active', true);

    if (error) {
      console.error('Erro ao buscar missões ativas:', error);
      return [];
    }
    return data.map((d: any) => new ArtMissionEntity(
      d.id, d.title, d.instruction, d.icon, d.active, d.created_at
    ));
  },

  async createMission(mission: Omit<ArtMissionDb, 'id' | 'created_at'>): Promise<ArtMissionEntity | null> {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('art_missions')
      .insert(mission)
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar missão:', error);
      return null;
    }
    return new ArtMissionEntity(
      data.id, data.title, data.instruction, data.icon, data.active, data.created_at
    );
  },

  async toggleMissionStatus(id: string, active: boolean): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await supabase
      .from('art_missions')
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
      .from('art_missions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar missão:', error);
      return false;
    }
    return true;
  },

  async getDailyMission(): Promise<ArtMissionEntity | null> {
    const activeMissions = await this.getActiveMissions();
    if (activeMissions.length === 0) return null;

    // Usar a data atual para escolher a missão do dia de forma determinística
    const today = new Date();
    // Quantidade de dias desde 1 de Janeiro de 1970
    const daysSinceEpoch = Math.floor(today.getTime() / (1000 * 60 * 60 * 24));
    
    // Ordenar as missões por data de criação para garantir uma ordem fixa
    activeMissions.sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''));

    // O índice da missão é o resto da divisão dos dias pela quantidade de missões
    const missionIndex = daysSinceEpoch % activeMissions.length;
    
    return activeMissions[missionIndex];
  }
};
