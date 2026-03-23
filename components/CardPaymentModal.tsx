import React, { useState, useEffect, useRef } from 'react';
import { AuthService } from '../services/authService';

interface CardPaymentModalProps {
    planId: 'familia' | 'anual';
    planName: string;
    planPrice: number;
    onSuccess: (result: any) => void;
    onCancel: () => void;
    onError: (error: string) => void;
}

declare global {
    interface Window {
        MercadoPago: any;
    }
}

export const CardPaymentModal: React.FC<CardPaymentModalProps> = ({
    planId,
    planName,
    planPrice,
    onSuccess,
    onCancel,
    onError
}) => {
    const [mp, setMp] = useState<any>(null);
    const [brickReady, setBrickReady] = useState(false);
    const [loading, setLoading] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const [userName, setUserName] = useState('');
    const [userPassword, setUserPassword] = useState('');
    const [showCardForm, setShowCardForm] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [subscriptionData, setSubscriptionData] = useState<any>(null);
    const [accountError, setAccountError] = useState('');
    const [createdUserId, setCreatedUserId] = useState<string | null>(null);
    const [planMPId, setPlanMPId] = useState<string | null>(null); // ID dinâmico do plano
    const createdUserIdRef = useRef<string | null>(null);
    const brickControllerRef = useRef<any>(null);

    const PUBLIC_KEY = import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY;
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

    useEffect(() => {
        loadMercadoPagoSDK();
        loadPlanId();
        return () => {
            if (brickControllerRef.current) {
                brickControllerRef.current.unmount();
            }
        };
    }, []);

    // Busca o ID real do plano no backend (evita IDs hardcoded desatualizados)
    const loadPlanId = async () => {
        try {
            const res = await fetch(`${API_URL}/api/subscription/plans`);
            const data = await res.json();
            if (data.success && data.plans?.[planId]?.id) {
                setPlanMPId(data.plans[planId].id);
                console.log(`✅ Plan ID carregado do backend: ${data.plans[planId].id}`);
            } else {
                console.error('❌ Plano não encontrado na resposta do backend:', data);
            }
        } catch (err) {
            console.error('❌ Erro ao buscar planos do backend:', err);
        }
    };

    const loadMercadoPagoSDK = () => {
        if (document.getElementById('mercadopago-sdk')) {
            initializeMercadoPago();
            return;
        }

        const script = document.createElement('script');
        script.id = 'mercadopago-sdk';
        script.src = 'https://sdk.mercadopago.com/js/v2';
        script.async = true;
        script.onload = () => initializeMercadoPago();
        document.body.appendChild(script);
    };

    const initializeMercadoPago = () => {
        if (typeof window.MercadoPago !== 'undefined' && PUBLIC_KEY) {
            const mpInstance = new window.MercadoPago(PUBLIC_KEY);
            setMp(mpInstance);
            console.log('✅ Mercado Pago SDK carregado');
        }
    };

    const renderCardPaymentBrick = async () => {
        if (!mp || !userEmail) return;

        try {
            // Destruir brick anterior se existir
            if (brickControllerRef.current) {
                await brickControllerRef.current.unmount();
            }

            const bricksBuilder = mp.bricks();

            const settings = {
                initialization: {
                    amount: planPrice,
                },
                customization: {
                    visual: {
                        style: {
                            theme: 'default'
                        }
                    },
                    paymentMethods: {
                        maxInstallments: 1
                    }
                },
                callbacks: {
                    onReady: () => {
                        setBrickReady(true);
                        console.log('✅ Card Payment Brick pronto');
                    },
                    onSubmit: async (cardFormData: any) => {
                        return handleCardSubmit(cardFormData);
                    },
                    onError: (error: any) => {
                        console.error('❌ Erro no brick:', error);
                        onError('Erro ao processar formulário de cartão');
                    }
                }
            };

            brickControllerRef.current = await bricksBuilder.create(
                'cardPayment',
                'cardPaymentBrick_container',
                settings
            );

        } catch (error) {
            console.error('❌ Erro ao criar Card Payment Brick:', error);
            onError('Erro ao carregar formulário de pagamento');
        }
    };

    const handleCardSubmit = async (cardFormData: any) => {
        setLoading(true);

        try {
            console.log('💳 Token do cartão gerado:', cardFormData.token);
            
            if (!planMPId) {
                throw new Error('ID do plano ainda não carregado. Aguarde e tente novamente.');
            }

            const resolvedUserId = createdUserIdRef.current || createdUserId || '';
            console.log('👤 userId usado no payload:', resolvedUserId);

            if (!resolvedUserId) {
                throw new Error('ID do usuário não encontrado. Tente reiniciar o processo.');
            }

            const payload = {
                user_id: resolvedUserId,
                payer_email: userEmail,
                plan_id: planMPId,
                card_token_id: cardFormData.token
            };

            console.log('📤 Enviando para backend:', payload);

            const response = await fetch(`${API_URL}/api/subscription/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                console.log('✅ Assinatura criada:', result.subscription);
                setSubscriptionData(result);
                setShowSuccess(true); // Mostrar modal de sucesso
            } else {
                throw new Error(result.error || result.details || 'Erro ao criar assinatura');
            }

        } catch (error: any) {
            console.error('❌ Erro ao processar assinatura:', error);
            onError(error.message || 'Erro ao processar pagamento');
        } finally {
            setLoading(false);
        }
    };

    const handleProceed = async () => {
        if (!userName || !userEmail || !userPassword) {
            setAccountError('Por favor, preencha todos os campos.');
            return;
        }

        // Validação básica de senha
        if (userPassword.length < 5) {
            setAccountError('A senha precisa ter no mínimo 5 caracteres.');
            return;
        }
        if (!/[!@#$%^&*(),.?":{}|<>_]/.test(userPassword)) {
            setAccountError('A senha precisa ter pelo menos um caractere especial (ex: @, #, $).');
            return;
        }

        setLoading(true);
        setAccountError('');

        try {
            // Criar conta no Supabase antes de ir ao pagamento
            const authResult = await AuthService.register(
                userEmail.toLowerCase().trim(),
                userPassword,
                null,
                userName
            );
            setCreatedUserId(authResult.user.id);
            createdUserIdRef.current = authResult.user.id; // atualizar ref imediatamente
            console.log('✅ Conta criada com sucesso, userId:', authResult.user.id);

            setShowCardForm(true);
            // Renderizar brick após um pequeno delay para garantir que o container existe
            setTimeout(() => {
                renderCardPaymentBrick();
            }, 100);
        } catch (err: any) {
            console.error('❌ Erro ao criar conta:', err);
            setAccountError(err.message || 'Erro ao criar conta. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            {/* Modal de Sucesso */}
            {showSuccess ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8 text-center animate-in fade-in zoom-in duration-300">
                    {/* Ícone de Sucesso */}
                    <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
                        <svg className="w-12 h-12 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>

                    {/* Mensagem de Sucesso */}
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        🎉 Assinatura Confirmada!
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                        Sua assinatura foi criada com sucesso!
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400 font-semibold mb-2">
                        🎁 Você tem 2 dias de teste gratuito — nenhuma cobrança hoje.
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mb-8">
                        Após o período de teste, a cobrança de R$ {planPrice.toFixed(2)} será feita automaticamente.
                    </p>

                    {/* Botão de Login */}
                    <button
                        onClick={() => {
                            onSuccess(subscriptionData); // Chama callback original
                            onCancel(); // Fecha o modal
                        }}
                        className="w-full bg-indigo-600 text-white py-4 rounded-lg font-bold hover:bg-indigo-700 transition-all transform hover:scale-105"
                    >
                        Fazer Login
                    </button>

                    {/* Informação adicional */}
                    <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-xs text-blue-800 dark:text-blue-200">
                            💡 Use o email <strong>{userEmail}</strong> para fazer login
                        </p>
                    </div>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800 z-10">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Assinar {planName}
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                R$ {planPrice.toFixed(2)}/mês
                            </p>
                            <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 text-xs font-semibold rounded-full">
                                🎁 2 dias grátis — sem cobrança imediata
                            </span>
                        </div>
                        <button
                            onClick={onCancel}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            disabled={loading}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="p-6">
                        {!showCardForm ? (
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                                    Criar sua conta
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                    Passo 1 de 2 — Crie sua conta para continuar para o pagamento.<br />
                                    <span className="text-green-600 dark:text-green-400 font-medium">✅ Seus primeiros 2 dias são grátis. A cobrança começa somente no 3º dia.</span>
                                </p>

                                {accountError && (
                                    <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 text-sm font-semibold rounded-lg border border-red-100 dark:border-red-800 flex items-center gap-2">
                                        <span>⚠️</span> {accountError}
                                    </div>
                                )}
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Nome Completo
                                    </label>
                                    <input
                                        type="text"
                                        value={userName}
                                        onChange={(e) => { setUserName(e.target.value); setAccountError(''); }}
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                                        placeholder="Seu nome completo"
                                        disabled={loading}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={userEmail}
                                        onChange={(e) => { setUserEmail(e.target.value); setAccountError(''); }}
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                                        placeholder="seu@email.com"
                                        disabled={loading}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Senha
                                    </label>
                                    <input
                                        type="password"
                                        value={userPassword}
                                        onChange={(e) => { setUserPassword(e.target.value); setAccountError(''); }}
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                                        placeholder="Mínimo 5 caracteres + símbolo (!@#$)"
                                        disabled={loading}
                                    />
                                    <p className="text-xs text-gray-400 mt-1 ml-1">Mínimo 5 letras e um símbolo (!@#$%)</p>
                                </div>

                                <button
                                    onClick={handleProceed}
                                    disabled={loading || !userName || !userEmail || !userPassword}
                                    className="w-full mt-6 bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Criando conta...
                                        </>
                                    ) : (
                                        'Criar conta e continuar →'
                                    )}
                                </button>
                            </div>
                        ) : (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    Dados do Cartão
                                </h3>
                                
                                <div id="cardPaymentBrick_container"></div>

                                {loading && (
                                    <div className="mt-4 flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                        <span className="ml-3 text-gray-600 dark:text-gray-400">Processando assinatura...</span>
                                    </div>
                                )}

                                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                    <p className="text-sm text-blue-800 dark:text-blue-200">
                                        🔒 Pagamento seguro via Mercado Pago
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CardPaymentModal;