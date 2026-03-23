const express = require('express');
const router = express.Router();
const mercadoPagoController = require('./mercadoPagoController');

/**
 * Rotas da API de Assinaturas do Mercado Pago
 */

// Listar todos os planos disponíveis
router.get('/plans', mercadoPagoController.listPlans);

// Criar um novo plano de assinatura
router.post('/plans', mercadoPagoController.createPlan);

// Criar uma nova assinatura
router.post('/subscriptions', mercadoPagoController.createSubscription);

// Buscar detalhes de uma assinatura específica
router.get('/subscriptions/:subscription_id', mercadoPagoController.getSubscriptionDetails);

// Webhook para notificações do Mercado Pago
router.post('/webhook', mercadoPagoController.handleWebhook);

// Processar pagamento (Brick)
router.post('/process_payment', mercadoPagoController.processPayment);

module.exports = router;
