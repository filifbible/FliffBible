/**
 * Serviço de integração com Mercado Pago - Assinaturas Recorrentes
 * Gerencia criação de card tokens e assinaturas usando Preapproval API
 */

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'free' | 'monthly' | 'yearly';
  description: string;
}

// Planos locais com metadados (sem IDs — os IDs vêm do backend)
export const PLAN_METADATA: Record<string, Omit<SubscriptionPlan, 'id'>> = {
  familia: {
    name: 'Família +',
    price: 29.90,
    interval: 'monthly',
    description: 'Até 4 perfis, missões ilimitadas, IA generativa'
  },
  anual: {
    name: 'Anual',
    price: 299.00,
    interval: 'yearly',
    description: 'Todos os recursos + conteúdos exclusivos'
  }
};


export interface CardData {
  cardNumber: string;
  cardholderName: string;
  expirationMonth: string;
  expirationYear: string;
  securityCode: string;
  identificationType: string;
  identificationNumber: string;
}

class MercadoPagoService {
  private publicKey: string;
  private apiUrl: string;
  private mp: any;

  constructor() {
    this.publicKey = import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY || '';
    this.apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
    
    console.log('🔧 MercadoPago Service initialized:', {
      apiUrl: this.apiUrl,
      hasPublicKey: !!this.publicKey
    });
  }

  /**
   * Retorna os planos disponíveis — buscados do backend (IDs sempre atuais)
   */
  async getPlans(): Promise<{ success: boolean; plans: Record<string, any> }> {
    try {
      const response = await fetch(`${this.apiUrl}/api/subscription/plans`);
      if (!response.ok) throw new Error('Falha ao buscar planos');
      const data = await response.json();
      return data; // { success: true, plans: { familia: { id, name, price, frequency }, anual: {...} } }
    } catch (error) {
      console.error('❌ Erro ao buscar planos do backend:', error);
      return { success: false, plans: {} };
    }
  }

  /**
   * Carrega e inicializa SDK do Mercado Pago
   */
  async loadSDK(): Promise<void> {
    if (this.mp) return;

    return new Promise((resolve, reject) => {
      if (document.getElementById('mercadopago-sdk')) {
        this.initializeMercadoPago();
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.id = 'mercadopago-sdk';
      script.src = 'https://sdk.mercadopago.com/js/v2';
      script.async = true;
      
      script.onload = () => {
        this.initializeMercadoPago();
        resolve();
      };
      script.onerror = () => reject(new Error('Erro ao carregar SDK do Mercado Pago'));
      
      document.body.appendChild(script);
    });
  }

  /**
   * Inicializa instância do Mercado Pago
   */
  private initializeMercadoPago() {
    // @ts-ignore
    if (typeof window.MercadoPago !== 'undefined' && this.publicKey) {
      // @ts-ignore
      this.mp = new window.MercadoPago(this.publicKey);
      console.log('✅ Mercado Pago SDK initialized');
    }
  }

  /**
   * Cria token do cartão
   */
  async createCardToken(cardData: CardData): Promise<string | null> {
    try {
      if (!this.mp) {
        await this.loadSDK();
      }

      const cardTokenPayload = {
        cardNumber: cardData.cardNumber.replace(/\s/g, ''),
        cardholderName: cardData.cardholderName,
        cardExpirationMonth: cardData.expirationMonth,
        cardExpirationYear: cardData.expirationYear,
        securityCode: cardData.securityCode,
        identificationType: cardData.identificationType,
        identificationNumber: cardData.identificationNumber
      };

      console.log('🔑 Criando card token...', { cardholderName: cardData.cardholderName });

      const response = await this.mp.createCardToken(cardTokenPayload);
      
      console.log('📋 Resposta completa do Mercado Pago:', response);

      // A resposta do SDK retorna o objeto do token diretamente
      if (response && response.id) {
        console.log('✅ Card token criado:', response.id);
        return response.id;
      } else {
        console.error('❌ Erro ao criar card token:', response);
        return null;
      }
    } catch (error) {
      console.error('❌ Erro ao criar card token:', error);
      return null;
    }
  }

  /**
   * Cria assinatura recorrente
   */
  async createSubscription({
    userId,
    userEmail,
    planId,
    cardTokenId
  }: {
    userId: string;
    userEmail: string;
    planId: string;
    cardTokenId: string;
  }): Promise<{ success: boolean; subscription?: any; error?: string }> {
    try {
      if (!planId) {
        return { success: false, error: 'ID do plano não informado' };
      }

      console.log('📦 Criando assinatura:', { userId, userEmail, planId });

      const response = await fetch(`${this.apiUrl}/api/subscription/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          payer_email: userEmail,
          plan_id: planId,
          card_token_id: cardTokenId
        })
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.details || 'Erro ao criar assinatura' };
      }

      const data = await response.json();
      console.log('✅ Assinatura criada:', data.subscription);
      
      return { success: true, subscription: data.subscription };
    } catch (error) {
      console.error('❌ Erro ao criar assinatura:', error);
      return { success: false, error: 'Erro ao processar assinatura' };
    }
  }

  /**
   * Verifica status de assinatura
   */
  async getSubscriptionStatus(userId: string): Promise<{
    isActive: boolean;
    plan?: string;
    status?: string;
  }> {
    try {
      const response = await fetch(`${this.apiUrl}/api/subscription/status/${userId}`);
      
      if (!response.ok) {
        throw new Error('Erro ao verificar status da assinatura');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ Erro ao verificar status:', error);
      return { isActive: false };
    }
  }
}

export default new MercadoPagoService();
