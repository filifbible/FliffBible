import React from 'react';

interface PremiumGateModalProps {
    reason: 'no_plan' | 'trial_expired' | 'cancelled';
    onGoToPlans: () => void;
}

const REASON_CONFIG = {
    no_plan: {
        icon: '🔒',
        title: 'Acesso Premium Necessário',
        subtitle: 'Você não possui um plano ativo.',
        description: 'Para acessar o Filif Bible+, assine um de nossos planos. Aproveite 2 dias grátis para começar!',
        highlight: '🎁 2 dias grátis — sem cobrança hoje',
        highlightColor: 'from-emerald-500 to-teal-500',
    },
    trial_expired: {
        icon: '⏰',
        title: 'Período de Teste Encerrado',
        subtitle: 'Seu teste gratuito de 2 dias expirou.',
        description: 'Esperamos que tenha aproveitado! Assine agora para continuar sua jornada bíblica sem interrupções.',
        highlight: '✨ Continue de onde parou — assine agora',
        highlightColor: 'from-amber-500 to-orange-500',
    },
    cancelled: {
        icon: '💔',
        title: 'Assinatura Cancelada',
        subtitle: 'Sua assinatura foi cancelada ou está pausada.',
        description: 'Sentimos sua falta! Reative seu plano para voltar a acessar todos os recursos do Filif Bible+.',
        highlight: '🔄 Reative sua assinatura',
        highlightColor: 'from-rose-500 to-pink-500',
    },
};

export const PremiumGateModal: React.FC<PremiumGateModalProps> = ({ reason, onGoToPlans }) => {
    const config = REASON_CONFIG[reason];

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Overlay escuro com blur */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />

            {/* Card central */}
            <div className="relative w-full max-w-md animate-in fade-in zoom-in duration-300">

                {/* Brilho decorativo no topo */}
                <div className={`absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-gradient-to-br ${config.highlightColor} opacity-20 rounded-full blur-3xl pointer-events-none`} />

                <div className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">

                    {/* Faixa colorida no topo */}
                    <div className={`h-1.5 w-full bg-gradient-to-r ${config.highlightColor}`} />

                    <div className="p-8 text-center">

                        {/* Ícone */}
                        <div className="mx-auto mb-5 w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center shadow-inner">
                            <span className="text-4xl">{config.icon}</span>
                        </div>

                        {/* Título */}
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-1 font-outfit">
                            {config.title}
                        </h2>

                        {/* Subtítulo */}
                        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-4">
                            {config.subtitle}
                        </p>

                        {/* Descrição */}
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6 text-sm">
                            {config.description}
                        </p>

                        {/* Badge de destaque */}
                        <div className={`inline-block px-4 py-2 rounded-full bg-gradient-to-r ${config.highlightColor} text-white text-sm font-bold mb-8 shadow-lg`}>
                            {config.highlight}
                        </div>

                        {/* Botão principal */}
                        <button
                            onClick={onGoToPlans}
                            className={`w-full py-4 px-6 rounded-2xl bg-gradient-to-r ${config.highlightColor} text-white font-black text-base shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200`}
                        >
                            Ver Planos Premium →
                        </button>

                        {/* Garantias */}
                        <div className="mt-6 flex items-center justify-center gap-6 text-xs text-gray-400 dark:text-gray-500">
                            <span>🔒 Pagamento seguro</span>
                            <span>❌ Cancele quando quiser</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PremiumGateModal;
