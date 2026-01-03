
import React from 'react';

const PremiumView: React.FC<{onUpgrade: () => void}> = ({ onUpgrade }) => {
  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto mb-20">
      <div className="text-center mb-12">
        <span className="bg-yellow-100 text-yellow-700 px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider mb-4 inline-block">
          Seja Premium
        </span>
        <h2 className="text-4xl font-bold font-outfit text-gray-900 mb-4">Escolha o plano ideal para sua família</h2>
        <p className="text-gray-600 max-w-xl mx-auto">Acesse todos os livros, jogos ilimitados e conteúdos exclusivos para cada fase da vida.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Monthly Plan */}
        <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm flex flex-col">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Plano Mensal</h3>
          <p className="text-gray-500 mb-6">Acesso total mês a mês.</p>
          <div className="mb-8">
            <span className="text-4xl font-bold text-gray-900">R$ 9,90</span>
            <span className="text-gray-500">/mês</span>
          </div>
          <button 
            onClick={onUpgrade}
            className="w-full py-4 rounded-2xl border-2 border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-colors mt-auto"
          >
            Assinar Agora
          </button>
        </div>

        {/* Annual Plan */}
        <div className="bg-indigo-600 rounded-3xl p-8 shadow-xl shadow-indigo-200 flex flex-col relative overflow-hidden">
          <div className="absolute top-5 right-5 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-3 py-1 rounded-full uppercase">
            Melhor Valor
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Plano Anual</h3>
          <p className="text-indigo-100 mb-6">Equivale a apenas R$ 6,99 por mês.</p>
          <div className="mb-8">
            <span className="text-4xl font-bold text-white">R$ 83,88</span>
            <span className="text-indigo-200">/ano</span>
          </div>
          <div className="space-y-4 mb-8">
            {[
              "Economize mais de 2 meses",
              "Bíblia Completa Offline",
              "Jogos & Quizzes Diários",
              "Perfil para toda família",
              "Sem anúncios"
            ].map((feature, i) => (
              <div key={i} className="flex items-center text-indigo-100 text-sm">
                <span className="mr-2 text-yellow-400">✓</span>
                {feature}
              </div>
            ))}
          </div>
          <button 
            onClick={onUpgrade}
            className="w-full py-4 rounded-2xl bg-white text-indigo-600 font-bold hover:scale-[1.02] transition-transform"
          >
            Começar Agora
          </button>
        </div>
      </div>

      <div className="bg-indigo-50 rounded-3xl p-8 text-center border-2 border-dashed border-indigo-200">
        <p className="text-indigo-700 font-medium">Garantia de 7 dias ou seu dinheiro de volta.</p>
      </div>
    </div>
  );
};

export default PremiumView;
