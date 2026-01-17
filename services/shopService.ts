import { supabase } from './supabase';

export interface ShopItemPrice {
    id: string;
    price: number;
}

export const ShopService = {
    /**
     * Obtém todos os preços personalizados da loja
     */
    async getAllPrices(): Promise<ShopItemPrice[]> {
        if (!supabase) return [];

        const { data, error } = await supabase
            .from('shop_items')
            .select('id, price');

        if (error) {
            console.error('Erro ao buscar preços da loja:', error);
            return [];
        }

        return data || [];
    },

    /**
     * Atualiza o preço de um item
     */
    async updatePrice(itemId: string, newPrice: number): Promise<boolean> {
        if (!supabase) return false;

        // Upsert (insert or update)
        const { error } = await supabase
            .from('shop_items')
            .upsert({
                id: itemId,
                price: newPrice,
                updated_at: new Date().toISOString()
            });

        if (error) {
            console.error('Erro ao atualizar preço do item:', error);
            return false;
        }

        return true;
    }
};
