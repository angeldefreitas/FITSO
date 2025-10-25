const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticateToken } = require('../../middleware/auth');

/**
 * @route POST /api/affiliates/create-stripe-account
 * @desc Crear cuenta de Stripe para afiliado
 * @access Private (Affiliate)
 * @body {string} country - País (default: 'US')
 * @body {string} type - Tipo de cuenta (default: 'express')
 */
router.post('/create-stripe-account', authenticateToken, paymentController.createStripeAccount);

/**
 * @route GET /api/affiliates/stripe-account-status
 * @desc Obtener estado de cuenta Stripe del afiliado
 * @access Private (Affiliate)
 */
router.get('/stripe-account-status', authenticateToken, paymentController.getStripeAccountStatus);

/**
 * @route POST /api/affiliates/process-payout
 * @desc Procesar pago de comisión a afiliado
 * @access Private (Admin)
 * @body {string} affiliate_code - Código del afiliado
 * @body {number} amount - Monto a pagar
 * @body {string} description - Descripción del pago
 */
router.post('/process-payout', authenticateToken, paymentController.processPayout);

/**
 * @route GET /api/affiliates/payment-history
 * @desc Obtener historial de pagos del afiliado
 * @access Private (Affiliate)
 * @query {number} limit - Límite de resultados (default: 50)
 * @query {number} offset - Offset para paginación (default: 0)
 */
router.get('/payment-history', authenticateToken, paymentController.getPaymentHistory);

/**
 * @route POST /api/affiliates/stripe-webhook
 * @desc Webhook de Stripe para eventos de pago
 * @access Public (Stripe)
 */
router.post('/stripe-webhook', paymentController.handleStripeWebhook);

module.exports = router;
