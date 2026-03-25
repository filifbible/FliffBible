import React, { useState, useEffect } from 'react';
import MercadoPagoService from '../services/mercadopagoService';

interface SubscriptionCheckoutProps {
  userEmail: string;
  userId: string;
  onSuccess?: (subscription: any) => void;
  onError?: (error: string) => void;
}

export const SubscriptionCheckout: React.FC<SubscriptionCheckoutProps> = ({
  userEmail,
  userId,
  onSuccess,
  onError
}) => {
  const [plans, setPlans] = useState<any>(null);
  const [selectedPlan, setSelectedPlan] = useState<string>('familia');
  const [loading, setLoading] = useState(false);
  const [bricksReady, setBricksReady] = useState(false);
  const [mp, setMp] = useState<any>(null);
  const [cardPaymentBrick, setCardPaymentBrick] = useState<any>(null);

  const PUBLIC_KEY = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY;

  // Carregar SDK do Mercado Pago
  useEffect(() => {
    const loadMercadoPagoSDK = () => {
      if (document.getElementById('mercadopago-sdk')) {
        initializeBricks();
        return;
      }

      const script = document.createElement('script');
      script.id = 'mercadopago-sdk';
      script.src = 'https://sdk.mercadopago.com/js/v2';
      script.async = true;
      script.onload = () => initializeBricks();
      document.body.appendChild(script);
    };

    const initializeBricks = () => {
      // @ts-ignore
      if (typeof window.MercadoPago !== 'undefined') {
        // @ts-ignore
        const mpInstance = new window.MercadoPago(PUBLIC_KEY);
        setMp(mpInstance);
        console.log('✅ Mercado Pago SDK carregado');
      }
    };

    loadMercadoPagoSDK();
  }, [PUBLIC_KEY]);

  // Carregar planos
  useEffect(() => {
    loadPlans();
  }, []);

  // Renderizar Card Payment Brick quando MP estiver pronto
  useEffect(() => {
    if (mp && !cardPaymentBrick) {
      renderCardPaymentBrick();
    }
  }, [mp]);

  const loadPlans = async () => {
    try {
      const response = await MercadoPagoService.getPlans();
      if (response.success) {
        setPlans(response.plans);
      }
    } catch (error) {
      console.error('Erro ao carregar planos:', error);
    }
  };

  const renderCardPaymentBrick = async () => {
    if (!mp || !plans) return;

    const selectedPlanData = plans[selectedPlan];
    if (!selectedPlanData) return;

    try {
      // @ts-ignore
      const bricksBuilder = mp.bricks();

      // Destruir brick anterior se existir
      if (cardPaymentBrick) {
        await cardPaymentBrick.unmount();
      }

      const brick = await bricksBuilder.create('cardPayment', 'cardPaymentBrick', {
        initialization: {
          amount: selectedPlanData.price,
          payer: {
            email: userEmail
          }
        },
        customization: {
          visual: {
            style: {
              theme: 'dark'
            }
          },
          paymentMethods: {
            maxInstallments: 1 // Assinaturas não permitem parcelamento
          }
        },
        callbacks: {
          onReady: () => {
            setBricksReady(true);
            console.log('🧱 Card Payment Brick pronto');
          },
          onSubmit: async (formData: any) => {
            await handleSubmit(formData);
          },
          onError: (error: any) => {
            console.error('Erro no Brick:', error);
            onError?.('Erro ao processar cartão');
          }
        }
      });

      setCardPaymentBrick(brick);
    } catch (error) {
      console.error('Erro ao criar Card Payment Brick:', error);
    }
  };

  const handleSubmit = async (formData: any) => {
    setLoading(true);

    try {
      console.log('💳 Dados do formulário:', formData);

      const cardTokenId = formData.token;
      
      if (!cardTokenId) {
        throw new Error('Token do cartão não gerado');
      }

      // Criar assinatura no backend
      const result = await MercadoPagoService.createSubscription({
        planId: plans[selectedPlan].id, // Enviar ID real do MP
        cardTokenId: cardTokenId,
        userEmail: userEmail,
        userId: userId
      });

      if (result.success && result.subscription) {
        console.log('✅ Assinatura criada:', result.subscription);
        onSuccess?.(result.subscription);
      } else {
        throw new Error(result.error || 'Erro ao criar assinatura');
      }
    } catch (error: any) {
      console.error('❌ Erro ao processar assinatura:', error);
      onError?.(error.message || 'Erro ao processar pagamento');
    } finally {
      setLoading(false);
    }
  };

  // Atualizar brick quando plano mudar
  useEffect(() => {
    if (mp && plans && selectedPlan) {
      renderCardPaymentBrick();
    }
  }, [selectedPlan]);

  if (!plans) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Escolha seu Plano</h2>

      {/* Seleção de Planos */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        {Object.entries(plans).map(([planId, plan]: [string, any]) => (
          <div
            key={planId}
            onClick={() => setSelectedPlan(planId)}
            className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
              selectedPlan === planId
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-bold">{plan.name}</h3>
              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                🎁 2 dias grátis
              </span>
            </div>
            <p className="text-3xl font-bold text-blue-600 mb-2">
              R$ {plan.price.toFixed(2)}
              <span className="text-sm text-gray-600">
                /{plan.frequency === 'monthly' ? 'mês' : 'ano'}
              </span>
            </p>
            {selectedPlan === planId && (
              <span className="inline-block px-3 py-1 bg-blue-600 text-white text-sm rounded-full">
                Selecionado
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Card Payment Brick */}
      <div className="bg -white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Dados do Cartão</h3>
        <div id="cardPaymentBrick"></div>

        {loading && (
          <div className="mt-4 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3">Processando assinatura...</span>
          </div>
        )}
      </div>

      {/* Informações */}
      <div className="mt-6 p-4 bg-gray-100 rounded-lg">
        <p className="text-sm text-gray-700">
          🔒 teste seguro via Mercado Pago
        </p>
        <p className="text-sm text-green-700 mt-2 font-medium">
          🎁 2 dias de teste grátis — sem cobrança hoje
        </p>
        <p className="text-sm text-gray-700 mt-2">
          ✔️ Renovação automática mensal/anual
        </p>
        <p className="text-sm text-gray-700 mt-2">
          ❌ Cancele quando quiser
        </p>
      </div>
    </div>
  );
};

export default SubscriptionCheckout;
