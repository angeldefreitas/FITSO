const express = require('express');
const router = express.Router();
const revenuecatWebhookController = require('../monetization/controllers/revenuecatWebhookController');

/**
 * Webhook de RevenueCat
 * POST /api/webhooks/revenuecat
 * 
 * Este webhook recibe eventos de RevenueCat cuando:
 * - Un usuario hace una compra inicial
 * - Un usuario renueva su suscripción
 * - Un usuario cancela su suscripción
 * - Una suscripción expira
 * - Hay problemas de facturación
 */
router.post('/revenuecat', revenuecatWebhookController.handleWebhook.bind(revenuecatWebhookController));

/**
 * Test del webhook de RevenueCat
 * GET /api/webhooks/revenuecat/test
 */
router.get('/revenuecat/test', revenuecatWebhookController.testWebhook.bind(revenuecatWebhookController));

module.exports = router;

