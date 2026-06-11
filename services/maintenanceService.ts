import { supabase } from './supabase';

export interface MaintenanceSettings {
  is_active: boolean;
  message: string;
  title: string;
  estimated_return: string | null;
  updated_at?: string;
}

const SETTING_KEY = 'maintenance_mode';

const DEFAULT_SETTINGS: MaintenanceSettings = {
  is_active: false,
  message: 'Estamos realizando melhorias para oferecer uma experiência ainda melhor. Voltaremos em breve!',
  title: 'Sistema em Manutenção',
  estimated_return: null,
};

export const MaintenanceService = {
  async getSettings(): Promise<MaintenanceSettings> {
    if (!supabase) return DEFAULT_SETTINGS;

    const { data, error } = await supabase
      .from('app_settings')
      .select('value, updated_at')
      .eq('key', SETTING_KEY)
      .single();

    if (error || !data) {
      return DEFAULT_SETTINGS;
    }

    return { ...(data.value as MaintenanceSettings), updated_at: data.updated_at };
  },

  async updateSettings(settings: Partial<MaintenanceSettings>): Promise<boolean> {
    if (!supabase) return false;

    // Fetch current to merge
    const current = await this.getSettings();
    const merged = { ...current, ...settings };

    const { error } = await supabase
      .from('app_settings')
      .upsert(
        { key: SETTING_KEY, value: merged },
        { onConflict: 'key' }
      );

    if (error) {
      console.error('Erro ao salvar configurações de manutenção:', error);
      return false;
    }

    return true;
  },

  async setMaintenanceMode(active: boolean): Promise<boolean> {
    return this.updateSettings({ is_active: active });
  },

  async isMaintenanceActive(): Promise<boolean> {
    const settings = await this.getSettings();
    return settings.is_active;
  },
};
