import { supabase } from './supabase';
import { Notice } from '../types';

export const NoticeService = {
  async getActiveNotices(): Promise<Notice[]> {
    const { data, error } = await supabase
      .from('notices')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar avisos:', error);
      return [];
    }

    return data as Notice[];
  },

  async getAllNotices(): Promise<Notice[]> {
    const { data, error } = await supabase
      .from('notices')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar todos os avisos:', error);
      return [];
    }

    return data as Notice[];
  },

  async createNotice(notice: Omit<Notice, 'id' | 'created_at'>): Promise<Notice | null> {
    const { data, error } = await supabase
      .from('notices')
      .insert(notice)
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar aviso:', error);
      return null;
    }

    return data as Notice;
  },

  async toggleNoticeStatus(id: string, active: boolean): Promise<boolean> {
    const { error } = await supabase
      .from('notices')
      .update({ active })
      .eq('id', id);

    if (error) {
      console.error('Erro ao atualizar aviso:', error);
      return false;
    }

    return true;
  },

  async deleteNotice(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('notices')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar aviso:', error);
      return false;
    }

    return true;
  }
};
