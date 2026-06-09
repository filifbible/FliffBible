import { supabase } from './supabase';

export interface AdminLog {
  id: string;
  admin_profile_id: string;
  admin_name?: string;
  action: string;
  target_profile_id?: string;
  target_name?: string;
  details?: string;
  created_at: string;
}

export const AdminLogService = {
  async addLog(params: {
    adminProfileId: string;
    adminName: string;
    action: string;
    targetProfileId?: string;
    targetName?: string;
    details?: string;
  }): Promise<void> {
    if (!supabase) return;

    await supabase.from('admin_logs').insert({
      admin_profile_id: params.adminProfileId,
      admin_name: params.adminName,
      action: params.action,
      target_profile_id: params.targetProfileId ?? null,
      target_name: params.targetName ?? null,
      details: params.details ?? null,
    });
  },

  async getLogs(limit = 100): Promise<AdminLog[]> {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('admin_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Erro ao buscar logs:', error);
      return [];
    }

    return data as AdminLog[];
  },
};
