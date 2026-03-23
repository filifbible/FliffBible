import React, { useState } from 'react';

interface CardFormProps {
  planId: 'familia' | 'anual';
  planName: string;
  planPrice: number;
  onSubmit: (cardData: any) => void;
  onCancel: () => void;
  loading: boolean;
}

const CardForm: React.FC<CardFormProps> = ({
  planId,
  planName,
  planPrice,
  onSubmit,
  onCancel,
  loading
}) => {
  // Dados do usuário
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  
  // Dados do cartão
  const [cardNumber, setCardNumber] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [expirationMonth, setExpirationMonth] = useState('');
  const [expirationYear, setExpirationYear] = useState('');
  const [securityCode, setSecurityCode] = useState('');
  const [identificationNumber, setIdentificationNumber] = useState('');

  const formatCardNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    const formatted = numbers.match(/.{1,4}/g)?.join(' ') || numbers;
    return formatted.substring(0, 19); // 16 dígitos + 3 espaços
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSubmit({
      // Dados do usuário
      userName,
      userEmail,
      userPassword,
      // Dados do cartão
      cardNumber,
      cardholderName,
      expirationMonth,
      expirationYear,
      securityCode,
      identificationType: 'CPF',
      identificationNumber
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
            Assinar {planName}
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Renovação automática por R$ {planPrice.toFixed(2)}/{planId === 'familia' ? 'mês' : 'ano'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Seção: Dados da Conta */}
          <div className="pb-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
              📋 Criar Conta
            </h3>
            
            {/* Nome Completo */}
            <div className="mb-3">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Nome Completo
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="João da Silva"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors"
                required
              />
            </div>

            {/* Email */}
            <div className="mb-3">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors"
                required
              />
            </div>

            {/* Senha */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Senha
              </label>
              <input
                type="password"
                value={userPassword}
                onChange={(e) => setUserPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors"
                required
                minLength={6}
              />
            </div>
          </div>

          {/* Seção: Dados do Pagamento */}
          <div>
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
              💳 Dados do Pagamento
            </h3>
          </div>
          {/* Número do Cartão */}
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              Número do Cartão
            </label>
            <input
              type="text"
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              placeholder="1234 5678 9012 3456"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors"
              required
              maxLength={19}
            />
          </div>

          {/* Nome no Cartão */}
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              Nome no Cartão
            </label>
            <input
              type="text"
              value={cardholderName}
              onChange={(e) => setCardholderName(e.target.value.toUpperCase())}
              placeholder="JOÃO DA SILVA"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors"
              required
            />
          </div>

          {/* Validade e CVV */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Mês
              </label>
              <input
                type="text"
                value={expirationMonth}
                onChange={(e) => setExpirationMonth(e.target.value.replace(/\D/g, '').substring(0, 2))}
                placeholder="MM"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors"
                required
                maxLength={2}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Ano
              </label>
              <input
                type="text"
                value={expirationYear}
                onChange={(e) => setExpirationYear(e.target.value.replace(/\D/g, '').substring(0, 2))}
                placeholder="AA"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors"
                required
                maxLength={2}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                CVV
              </label>
              <input
                type="text"
                value={securityCode}
                onChange={(e) => setSecurityCode(e.target.value.replace(/\D/g, '').substring(0, 4))}
                placeholder="123"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors"
                required
                maxLength={4}
              />
            </div>
          </div>

          {/* CPF */}
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              CPF do Titular
            </label>
            <input
              type="text"
              value={identificationNumber}
              onChange={(e) => setIdentificationNumber(e.target.value.replace(/\D/g, '').substring(0, 11))}
              placeholder="12345678909"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors"
              required
              maxLength={11}
            />
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 py-3 rounded-xl font-bold border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Processando...
                </>
              ) : (
                'Confirmar Assinatura'
              )}
            </button>
          </div>
        </form>

        {/* Aviso */}
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
          🔒 Pagamento seguro com criptografia. Você pode cancelar a qualquer momento.
        </p>
      </div>
    </div>
  );
};

export default CardForm;
