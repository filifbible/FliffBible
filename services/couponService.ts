import { supabase } from './supabase';
import { Coupon, CouponUse } from '../types';

export class CouponService {
  static async getAllCoupons(): Promise<Coupon[]> {
    if (!supabase) return [];
    
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    if (!userId) return [];

    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar cupons:', error);
      return [];
    }

    return data as Coupon[];
  }

  static async createCoupon(couponData: Omit<Coupon, 'id' | 'created_at' | 'times_used' | 'created_by'>): Promise<Coupon | null> {
    if (!supabase) return null;

    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    if (!userId) return null;

    // Converte o código para maiúsculo para padronizar
    const formattedData = {
      ...couponData,
      code: couponData.code.toUpperCase(),
      times_used: 0,
      created_by: userId
    };

    const { data, error } = await supabase
      .from('coupons')
      .insert([formattedData])
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar cupom:', error);
      return null;
    }

    return data as Coupon;
  }

  static async toggleCouponStatus(id: string, currentStatus: boolean): Promise<boolean> {
    if (!supabase) return false;

    const { error } = await supabase
      .from('coupons')
      .update({ active: !currentStatus })
      .eq('id', id);

    if (error) {
      console.error('Erro ao atualizar status do cupom:', error);
      return false;
    }

    return true;
  }

  static async deleteCoupon(id: string): Promise<boolean> {
    if (!supabase) return false;

    const { error } = await supabase
      .from('coupons')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar cupom:', error);
      return false;
    }

    return true;
  }

  static async getCouponUses(couponId: string): Promise<CouponUse[]> {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('coupon_uses')
      .select(`
        *,
        account:user_id(
          full_name,
          email
        )
      `)
      .eq('coupon_id', couponId)
      .order('used_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar usos do cupom:', error);
      return [];
    }

    // A API do Supabase retorna account como array se for foreign key sem unicity, ou objeto.
    // Como accounts(id) é PK, geralmente vem como objeto.
    return data.map((item: any) => ({
      ...item,
      account: Array.isArray(item.account) ? item.account[0] : item.account
    })) as CouponUse[];
  }
}
