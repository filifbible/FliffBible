const axios = require('axios');

// Credenciais fornecidas pelo usuário
const ACCESS_TOKEN = 'APP_USR-5283715957739114-020717-6ed44c60cb642828a6006945a271277e-3170244321';
const MERCADOPAGO_API_URL = 'https://api.mercadopago.com';

// Usando URL HTTPS válida (ngrok ou google)
const BACK_URL = 'https://5f86ccc58c6c.ngrok-free.app'; 

const PLANS = [
  {
    title: 'Familia +',
    price: 29.90,
    frequency: 1,
    frequency_type: 'months',
    back_url: BACK_URL
  },
  {
    title: 'Anual',
    price: 299.00,
    frequency: 12, // Forçando 12 meses
    frequency_type: 'months',
    back_url: BACK_URL
  }
];

async function createPlan(planData) {
  try {
    const payload = {
      reason: planData.title,
      auto_recurring: {
        frequency: planData.frequency,
        frequency_type: planData.frequency_type,
        transaction_amount: planData.price,
        currency_id: 'BRL',
        free_trial: {
          frequency: 2,
          frequency_type: 'days'
        }
      },
      back_url: planData.back_url,
      payment_methods_allowed: {
        payment_types: [{ id: 'credit_card' }]
      }
    };

    console.log(`Criando plano: ${planData.title}...`);
    // console.log('Payload:', JSON.stringify(payload, null, 2));

    const response = await axios.post(
      `${MERCADOPAGO_API_URL}/preapproval_plan`,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(`✅ SUCESSO! Plano: ${planData.title}`);
    console.log(`ID: ${response.data.id}`);
    console.log('-----------------------------------');
    
    return { name: planData.title, id: response.data.id };

  } catch (error) {
    console.error(`❌ ERRO ao criar plano ${planData.title}`);
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Message: ${JSON.stringify(error.response.data)}`);
    } else {
      console.error(`Error: ${error.message}`);
    }
    console.log('-----------------------------------');
    return null;
  }
}

async function main() {
  console.log('🚀 Iniciando criação de planos de assinatura...');
  
  const results = [];

  for (const plan of PLANS) {
    const result = await createPlan(plan);
    if (result) results.push(result);
  }

  console.log('\n📋 RESUMO DOS IDS:');
  results.forEach(p => {
    console.log(`${p.name}: '${p.id}'`);
  });
}

main();
