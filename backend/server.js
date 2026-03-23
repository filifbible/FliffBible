/**
 * Backend para assinaturas recorrentes do Mercado Pago
 * Usa API de Preapproval Plans para renovação automática
 */

const express = require('express');
const cors = require('cors');
const { MercadoPagoConfig, PreApprovalPlan, PreApproval, Payment } = require('mercadopago');
require('dotenv').config({ path: '.env.backend' });

const app = express();
const PORT = process.env.PORT || 4000;

// Configurar Mercado Pago
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN 
});

const preApprovalPlanClient = new PreApprovalPlan(client);
const preApprovalClient = new PreApproval(client);
const paymentClient = new Payment(client);

// Middlewares
app.use(cors({
  origin: true, // Allow all origins (ngrok changes URL frequently)
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import Mercado Pago Routes
const mercadoPagoRoutes = require('./mercadoPagoRoutes');
app.use('/api/mercadopago', mercadoPagoRoutes);


// IDs dos planos (serão preenchidos ao criar os planos)
let PLAN_IDS = {
  familia: null,
  anual: null
};

/**
 * Criar planos de assinatura no Mercado Pago
 */
async function initializePlans() {
  try {
    console.log('📋 Verificando planos de assinatura...');

    // Plano Família - Mensal
    const familiaExternalRef = 'filif-bible-familia-monthly-v4';
    const anualExternalRef = 'filif-bible-anual-yearly-v4';

    // Buscar planos existentes
    try {
      const existingPlans = await preApprovalPlanClient.search({
        options: { limit: 100 }
      });

      const familiaExisting = existingPlans.results?.find(
        p => p.external_reference === familiaExternalRef
      );
      const anualExisting = existingPlans.results?.find(
        p => p.external_reference === anualExternalRef
      );

      if (familiaExisting) {
        PLAN_IDS.familia = familiaExisting.id;
        console.log('✅ Plano Família encontrado:', PLAN_IDS.familia);
      }
      if (anualExisting) {
        PLAN_IDS.anual = anualExisting.id;
        console.log('✅ Plano Anual encontrado:', PLAN_IDS.anual);
      }
    } catch (error) {
      console.log('ℹ️ Nenhum plano existente encontrado');
    }

    // Criar Plano Família se não existir
    if (!PLAN_IDS.familia) {
      const familiaPlan = await preApprovalPlanClient.create({
        body: {
          reason: 'Filif Bible+ Família',
          external_reference: familiaExternalRef,
          back_url: process.env.FRONTEND_URL || 'http://localhost:5173',
          auto_recurring: {
            frequency: 1,
            frequency_type: 'months',
            transaction_amount: 29.90,
            currency_id: 'BRL',
            free_trial: {
              frequency: 2,
              frequency_type: 'days'
            }
          },
          payment_methods_allowed: {
             payment_types: [{ id: "credit_card" }]
          }
        }
      });
      
      PLAN_IDS.familia = familiaPlan.id;
      console.log('✅ Plano Família criado:', PLAN_IDS.familia);
    }

    // Criar Plano Anual se não existir
    if (!PLAN_IDS.anual) {
      const anualPlan = await preApprovalPlanClient.create({
        body: {
          reason: 'Filif Bible+ Anual',
          external_reference: anualExternalRef,
          back_url: process.env.FRONTEND_URL || 'http://localhost:5173',
          auto_recurring: {
            frequency: 12,
            frequency_type: 'months',
            transaction_amount: 299.00,
            currency_id: 'BRL',
            free_trial: {
              frequency: 2,
              frequency_type: 'days'
            }
          },
          payment_methods_allowed: {
             payment_types: [{ id: "credit_card" }]
          }
        }
      });

      PLAN_IDS.anual = anualPlan.id;
      console.log('✅ Plano Anual criado:', PLAN_IDS.anual);
    }

    console.log('🎯 Planos prontos:', PLAN_IDS);
  } catch (error) {
    console.error('❌ Erro ao inicializar planos:', error.message);
  }
}

/**
 * Root route
 */
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Mercado Pago Subscriptions API',
    version: '2.0.0',
    subscriptionType: 'Recurring (Preapproval)',
    plans: PLAN_IDS,
    endpoints: {
      health: 'GET /health',
      getPlans: 'GET /api/subscription/plans',
      createSubscription: 'POST /api/subscription/create',
      webhook: 'POST /api/subscription/webhook',
      checkStatus: 'GET /api/subscription/status/:userId'
    }
  });
});

/**
 * Health check
 */
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Mercado Pago Subscription Server',
    plans: PLAN_IDS,
    timestamp: new Date().toISOString()
  });
});

/**
 * Obter planos disponíveis
 */
app.get('/api/subscription/plans', (req, res) => {
  res.json({
    success: true,
    plans: {
      familia: {
        id: PLAN_IDS.familia,
        name: 'Família +',
        price: 29.90,
        frequency: 'monthly'
      },
      anual: {
        id: PLAN_IDS.anual,
        name: 'Anual',
        price: 299.00,
        frequency: 'yearly'
      }
    }
  });
});

/**
 * Criar assinatura recorrente
 * Suporta dois fluxos:
 * 1. Novo usuário: userName, userEmail, userPassword, planId (LandingPage)
 * 2. Usuário existente: user_id, payer_email, plan_id, card_token_id (SubscriptionCheckout)
 */
app.post('/api/subscription/create', async (req, res) => {
  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY
    );

    // Detectar qual payload foi enviado
    const isNewUserFlow = req.body.userName && req.body.userEmail && req.body.userPassword;
    const isExistingUserFlow = req.body.user_id && req.body.payer_email && req.body.card_token_id;

    // ==================== FLUXO 1: NOVO USUÁRIO (LandingPage) ====================
    if (isNewUserFlow) {
      const { userName, userEmail, userPassword, planId } = req.body;

      if (!userName || !userEmail || !userPassword || !planId) {
        return res.status(400).json({ 
          error: 'Missing required fields: userName, userEmail, userPassword, planId' 
        });
      }

      const planPreapprovalId = PLAN_IDS[planId];
      if (!planPreapprovalId) {
        return res.status(400).json({ error: 'Invalid plan ID' });
      }

      console.log('📦 [NEW USER] Criando conta + assinatura:', { userName, userEmail, planId });

      // 1. Criar usuário no Supabase
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userEmail,
        password: userPassword,
        email_confirm: true,
        user_metadata: {
          name: userName
        }
      });

      if (authError) {
        console.error('❌ Erro ao criar usuário:', authError);
        
        if (authError.message?.includes('already been registered') || authError.code === 'user_already_exists') {
          return res.status(400).json({ 
            error: 'Email já cadastrado',
            details: 'Este email já está registrado. Faça login ou use outro email.' 
          });
        }
        
        return res.status(500).json({ 
          error: 'Failed to create user account',
          details: authError.message 
        });
      }

      const userId = authData.user.id;
      console.log('✅ Usuário criado:', userId);

      // 2. Buscar init_point do plano
      const planResponse = await fetch(`https://api.mercadopago.com/preapproval_plan/${planPreapprovalId}`, {
        headers: {
          'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`
        }
      });
      
      if (!planResponse.ok) {
        throw new Error(`Failed to fetch plan: ${planResponse.status}`);
      }
      
      const planDetails = await planResponse.json();
      console.log('📋 Plano encontrado. Init point:', planDetails.init_point);

      // 3. Salvar usuário na tabela accounts
      const { error: updateError } = await supabase
        .from('accounts')
        .insert({
          id: userId,
          email: userEmail,
          full_name: userName,
          is_premium: false
        });

      if (updateError) {
        console.error('⚠️ Erro ao criar account:', updateError);
      } else {
        console.log('✅ Account criado na tabela');
      }
      
      // 4. Retornar init_point para checkout
      const checkoutUrl = `${planDetails.init_point}&payer_email=${encodeURIComponent(userEmail)}&external_reference=${userId}`;
      
      return res.json({
        success: true,
        user: {
          id: userId,
          email: userEmail,
          name: userName
        },
        checkout_url: checkoutUrl,
        message: 'User created. Redirect to checkout to complete subscription.'
      });
    }

    // ==================== FLUXO 2: USUÁRIO EXISTENTE (SubscriptionCheckout) ====================
    if (isExistingUserFlow) {
      const { user_id, payer_email, plan_id, card_token_id } = req.body;

      if (!user_id || !payer_email || !plan_id || !card_token_id) {
        return res.status(400).json({ 
          error: 'Missing required fields: user_id, payer_email, plan_id, card_token_id' 
        });
      }

      console.log('📦 [EXISTING USER] Criando assinatura:', { user_id, payer_email, plan_id });

      // Criar assinatura (preapproval) com o card token
      try {
        const subscriptionPayload = {
          preapproval_plan_id: plan_id,
          reason: 'Filif Bible+ Subscription',
          external_reference: user_id,
          payer_email: payer_email,
          card_token_id: card_token_id,
          back_url: process.env.FRONTEND_URL || 'http://localhost:5173',
          status: 'authorized'
        };

        console.log('📤 Enviando payload para Mercado Pago:', subscriptionPayload);

        const response = await preApprovalClient.create({
          body: subscriptionPayload
        });

        console.log('✅ Assinatura criada com sucesso:', response.id);

        // 1. Criar usuário no Supabase Auth (se não existir)
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          id: user_id,
          email: payer_email,
          email_confirm: true,
          user_metadata: { subscription_created: true }
        });

        if (authError && !authError.message?.includes('already been registered')) {
          console.error('⚠️ Erro ao criar usuário no Auth:', authError);
        } else if (authData?.user) {
          console.log('✅ Usuário criado no Auth:', authData.user.id);
        }

        // 2. Atualizar account como premium (UPDATE por id evita conflito de email)
        const trialEndDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();
        const { error: updateError } = await supabase
          .from('accounts')
          .update({
            is_premium: true,
            subscription_id: response.id,
            trial_end_date: trialEndDate,
            subscription_status: response.status || 'authorized'
          })
          .eq('id', user_id);

        if (updateError) {
          // Se não encontrou por id, tenta inserir a linha completa
          console.warn('⚠️ Update por id falhou, tentando insert:', updateError.message);
          const { error: insertError } = await supabase
            .from('accounts')
            .insert({
              id: user_id,
              email: payer_email,
              is_premium: true,
              subscription_id: response.id,
              trial_end_date: trialEndDate,
              subscription_status: response.status || 'authorized'
            });

          if (insertError) {
            console.error('⚠️ Erro ao inserir account:', insertError);
          } else {
            console.log('✅ Account criada como premium');
          }
        } else {
          console.log('✅ Account atualizada como premium');
        }

        // 3. Registrar assinatura em user_subscriptions (sem depender de subscription_plans)
        // user_subscriptions requer plan_id FK — registrar via webhook quando disponível
        console.log('ℹ️ Registro em user_subscriptions pendente (requer plan_id)');

        return res.json({
          success: true,
          subscription: {
            id: response.id,
            status: response.status,
            init_point: response.init_point
          }
        });

      } catch (error) {
        console.error('❌ Erro ao criar assinatura no Mercado Pago:', error);
        throw error;
      }
    }

    // Se nenhum fluxo foi detectado
    return res.status(400).json({ 
      error: 'Invalid request format',
      details: 'Expected either new user (userName, userEmail, userPassword, planId) or existing user (user_id, payer_email, plan_id, card_token_id)' 
    });

  } catch (error) {
    console.error('❌ Erro ao processar assinatura:', error);
    console.error('❌ Stack:', error.stack);
    
    let errorMessage = 'Failed to create subscription';
    let errorDetails = error.message;
    
    if (error.message?.includes('test users')) {
      errorMessage = 'Email inválido para modo de teste';
      errorDetails = 'Use um email de teste do Mercado Pago';
    }
    
    res.status(500).json({ 
      error: errorMessage,
      details: errorDetails
    });
  }
});

/**
 * Webhook para notificações
 */
app.post('/api/subscription/webhook', async (req, res) => {
  try {
    const { type, data } = req.body;
    console.log('📨 Webhook recebido:', { type, data });

    res.status(200).send('OK');

    if (type === 'subscription_preapproval') {
      // Assinatura criada/atualizada
      console.log('📝 Status da assinatura:', data);
    } else if (type === 'payment') {
      // Pagamento processado
      const payment = await paymentClient.get({ id: data.id });
      console.log('💳 Pagamento:', payment.status);
      
      if (payment.status === 'approved') {
        console.log('✅ Pagamento aprovado - Ativar/Renovar assinatura');
        // Aqui: atualizar Supabase
      }
    }
  } catch (error) {
    console.error('❌ Erro no webhook:', error);
    res.status(500).send('Error');
  }
});

/**
 * Verificar status de assinatura
 */
app.get('/api/subscription/status/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    // Consultar Supabase para obter subscription_id
    // Depois consultar Mercado Pago com preApprovalClient.get()
    res.json({
      isActive: false,
      plan: null,
      status: 'inactive'
    });
  } catch (error) {
    console.error('❌ Erro ao verificar status:', error);
    res.status(500).json({ error: 'Failed to check subscription status' });
  }
});

// Iniciar servidor
app.listen(PORT, async () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 Health check: http://localhost:${PORT}/health`);
  console.log(`💳 Mercado Pago configured: ${!!process.env.MERCADOPAGO_ACCESS_TOKEN}\n`);
  
  // Criar planos automaticamente ao iniciar
  await initializePlans();
  
  console.log('\n✅ Server ready to accept subscriptions!\n');
});

module.exports = app;
