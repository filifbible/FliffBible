import { supabase } from './supabase';

export interface AccountData {
  id: string;
  email: string;
  full_name: string | null;
  is_premium: boolean;
  theme: 'light' | 'dark';
  created_at: string;
  updated_at: string;
}

export const AccountService = {
  /**
   * Cria uma nova conta no Supabase após registro
   */
  async createAccount(
    userId: string,
    email: string,
    fullName?: string
  ): Promise<AccountData | null> {
    if (!supabase) {
      throw new Error('Supabase não está configurado');
    }

    const { data, error } = await supabase
      .from('accounts')
      .insert({
        id: userId,
        email: email.toLowerCase().trim(),
        full_name: fullName || null,
        is_premium: false,
        theme: 'light',
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar conta:', error);
      throw error;
    }

    return data;
  },

  /**
   * Obtém dados da conta
   */
  async getAccount(userId: string): Promise<AccountData | null> {
    if (!supabase) {
      return null;
    }

    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Erro ao buscar conta:', error);
      return null;
    }

    return data;
  },

  /**
   * Atualiza dados da conta
   */
  async updateAccount(
    userId: string,
    updates: Partial<Pick<AccountData, 'full_name' | 'theme' | 'is_premium'>>
  ): Promise<boolean> {
    if (!supabase) {
      return false;
    }

    const { error } = await supabase
      .from('accounts')
      .update(updates)
      .eq('id', userId);

    if (error) {
      console.error('Erro ao atualizar conta:', error);
      return false;
    }

    return true;
  },

  /**
   * Atualiza o tema da conta
   */
  async updateTheme(userId: string, theme: 'light' | 'dark'): Promise<boolean> {
    return await this.updateAccount(userId, { theme });
  },

  /**
   * Atualiza status premium
   */
  async updatePremium(userId: string, isPremium: boolean): Promise<boolean> {
    return await this.updateAccount(userId, { is_premium: isPremium });
  },
};
