const axios = require('axios');
const { MercadoPagoConfig, Payment } = require('mercadopago');

/**
 * Mercado Pago Subscriptions Controller
 * Gerencia criação de planos e assinaturas
 */

const MERCADOPAGO_API_URL = 'https://api.mercadopago.com';
const ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN;

// Configuração do SDK
const client = new MercadoPagoConfig({ accessToken: ACCESS_TOKEN });

/**
 * Cria um plano de assinatura no Mercado Pago
 */
async function createPlan(req, res) {
  try {
    const { title, price, frequency, frequency_type, description } = req.body;

    // Validação básica
    if (!title || !price || !frequency || !frequency_type) {
      return res.status(400).json({
        success: false,
        error: 'Campos obrigatórios: title, price, frequency, frequency_type'
      });
    }

    // Criar plano no Mercado Pago
    const planData = {
      reason: title,
      auto_recurring: {
        frequency: frequency,
        frequency_type: frequency_type, // 'months' ou 'days'
        transaction_amount: price,
        currency_id: 'BRL'
      },
      back_url: process.env.FRONTEND_URL || 'http://localhost:5173'
    };

    console.log('📝 Criando plano:', planData);

    const response = await axios.post(
      `${MERCADOPAGO_API_URL}/preapproval_plan`,
      planData,
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Plano criado:', response.data);

    res.json({
      success: true,
      plan: {
        id: response.data.id,
        title: response.data.reason,
        price: response.data.auto_recurring.transaction_amount,
        frequency: response.data.auto_recurring.frequency,
        frequency_type: response.data.auto_recurring.frequency_type,
        status: response.data.status
      }
    });

  } catch (error) {
    console.error('❌ Erro ao criar plano:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: error.response?.data || error.message
    });
  }
}

/**
 * Cria uma assinatura vinculada a um plano
 */
async function createSubscription(req, res) {
  try {
    const { plan_id, card_token_id, payer_email, user_id } = req.body;

    // Validação
    if (!plan_id || !card_token_id || !payer_email) {
      return res.status(400).json({
        success: false,
        error: 'Campos obrigatórios: plan_id, card_token_id, payer_email'
      });
    }

    // Debug: Verificar Access Token (segurança: mostrar apenas 4 primeiros caracteres)
    console.log('🔑 Access Token usado (inicio):', ACCESS_TOKEN.substring(0, 4) + '...');
    console.log('🔑 Access Token usado (TEST/APP?):', ACCESS_TOKEN.startsWith('TEST') ? 'TEST' : 'PROD');
    
    // Debug completa do payload
    const tokenDebug = card_token_id ? `${card_token_id.substring(0, 6)}...` : 'undefined';
    console.log('📦 Payload Subscription:', {
       plan_id,
       payer_email,
       card_token_id: tokenDebug
    });

    // 1. Buscar ou Criar Cliente (Customer)
    console.log('👤 Buscando/Criando cliente para:', payer_email);
    
    let customerId;
    
    // Buscar se já existe
    const customerSearch = await axios.get(
      `${MERCADOPAGO_API_URL}/v1/customers/search?email=${payer_email}`,
      { headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}` } }
    );
    
    if (customerSearch.data.results && customerSearch.data.results.length > 0) {
      customerId = customerSearch.data.results[0].id;
      console.log('✅ Cliente encontrado:', customerId);
    } else {
      // Criar novo cliente
      const newCustomer = await axios.post(
        `${MERCADOPAGO_API_URL}/v1/customers`,
        { email: payer_email },
        { headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}` } }
      );
      customerId = newCustomer.data.id;
      console.log('✅ Novo cliente criado:', customerId);
    }

    // 2. Criar Assinatura diretamente com card_token_id (Obrigatório para planos)
    console.log('📝 Criando assinatura via token (conforme documentação)...');

    const subscriptionData = {
      preapproval_plan_id: plan_id,
      payer_email: payer_email,
      card_token_id: card_token_id, // Usar token diretamente
      back_url: process.env.FRONTEND_URL || 'http://localhost:5173',
      status: 'authorized'
    };

    const response = await axios.post(
      `${MERCADOPAGO_API_URL}/preapproval`,
      subscriptionData,
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Assinatura criada com sucesso:', response.data.id);

    res.json({
      success: true,
      subscription: {
        id: response.data.id,
        status: response.data.status,
        payer_email: response.data.payer_email,
        init_point: response.data.init_point
      }
    });

  } catch (error) {
    console.error('❌ Erro detalhado na criação de assinatura:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
      
      if (error.response.status === 400 && error.response.data.message?.includes('email')) {
         console.warn('\n💡 DICA: Use um e-mail de teste oficial criado no painel do Mercado Pago:');
         console.warn('https://www.mercadopago.com.br/developers/panel/test-users\n');
      }
    } else {
      console.error('Erro:', error.message);
    }
    
    res.status(500).json({
      success: false,
      error: error.response?.data?.message || error.message
    });
  }
}

/**
 * Busca detalhes de uma assinatura
 */
async function getSubscriptionDetails(req, res) {
  try {
    const { subscription_id } = req.params;

    const response = await axios.get(
      `${MERCADOPAGO_API_URL}/preapproval/${subscription_id}`,
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json({
      success: true,
      subscription: response.data
    });

  } catch (error) {
    console.error('❌ Erro ao buscar assinatura:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: error.response?.data || error.message
    });
  }
}

/**
 * Webhook do Mercado Pago para notificações de assinatura
 */
async function handleWebhook(req, res) {
  try {
    console.log('🔔 Webhook recebido:', req.body);

    const { type, data } = req.body;

    // Responder rapidamente ao Mercado Pago
    res.status(200).send('OK');

    // Processar webhook de forma assíncrona
    if (type === 'subscription_preapproval' || type === 'subscription_authorized_payment') {
      const subscriptionId = data.id;

      console.log('📊 Processando evento de assinatura:', subscriptionId);

      // TODO: Buscar detalhes da assinatura e atualizar no Supabase
      // const details = await axios.get(`${MERCADOPAGO_API_URL}/preapproval/${subscriptionId}`, ...);
      // Atualizar status no banco de dados
    }

  } catch (error) {
    console.error('❌ Erro no webhook:', error);
  }
}

/**
 * Processa um pagamento (Checkout Bricks)
 */
async function processPayment(req, res) {
  try {
    const { formData } = req.body;
    
    // O SDK espera o body com transaction_amount, token, etc.
    // O Payment Brick envia isso dentro de formData mas precisamos adaptar se necessário
    // Normalmente o formData do Brick já vem no formato correto, mas vamos garantir
    
    console.log('💳 Processando pagamento:', formData.transaction_amount);

    const payment = new Payment(client);

    const requestOptions = {
      idempotencyKey: req.headers['x-idempotency-key']
    };

    const result = await payment.create({
      body: formData,
      requestOptions
    });

    console.log('✅ Pagamento criado:', result.id);

    res.json({
      success: true,
      payment: result
    });

  } catch (error) {
    console.error('❌ Erro ao processar pagamento:', error);
    res.status(500).json({
      success: false,
      error: error.message || error
    });
  }
}

/**
 * Lista todos os planos disponíveis
 */
async function listPlans(req, res) {
  try {
    const response = await axios.get(
      `${MERCADOPAGO_API_URL}/preapproval_plan/search`,
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json({
      success: true,
      plans: response.data.results || []
    });

  } catch (error) {
    console.error('❌ Erro ao listar planos:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: error.response?.data || error.message
    });
  }
}

module.exports = {
  createPlan,
  createSubscription,
  getSubscriptionDetails,
  handleWebhook,
  listPlans,
  processPayment
};
