const express = require('express');
const subscriptionController = require('../controllers/subscriptionController');
const { authenticateToken } = require('../../middleware/auth');

const router = express.Router();

// Middleware de autenticación para todas las rutas
router.use(authenticateToken);

/**
 * @route POST /api/subscriptions/verify-receipt
 * @desc Verifica un recibo de compra de Apple Store
 * @access Private
 * @body {string} userId - ID del usuario
 * @body {string} receiptData - Datos del recibo en base64
 */
router.post('/verify-receipt', subscriptionController.verifyReceipt);

/**
 * @route GET /api/subscriptions/status/:userId
 * @desc Obtiene el estado de suscripción de un usuario
 * @access Private
 * @param {string} userId - ID del usuario
 */
router.get('/status/:userId', subscriptionController.getSubscriptionStatus);

/**
 * @route GET /api/subscriptions/check-premium/:userId
 * @desc Verifica el estado premium de un usuario (incluye afiliados/admins)
 * @access Public
 * @param {string} userId - ID del usuario
 */
router.get('/check-premium/:userId', subscriptionController.checkUserPremium);

/**
 * @route POST /api/subscriptions/cancel
 * @desc Cancela la suscripción de un usuario
 * @access Private
 * @body {string} userId - ID del usuario
 */
router.post('/cancel', subscriptionController.cancelSubscription);

/**
 * @route GET /api/subscriptions/history/:userId
 * @desc Obtiene el historial de suscripciones de un usuario
 * @access Private
 * @param {string} userId - ID del usuario
 */
router.get('/history/:userId', subscriptionController.getSubscriptionHistory);

/**
 * @route POST /api/subscriptions/purchase
 * @desc Procesa una compra y genera comisión de afiliado inmediatamente
 * @access Private
 * @body {string} userId - ID del usuario que compró
 * @body {string} productId - ID del producto (Fitso_Premium_Monthly/Yearly)
 * @body {string} subscriptionType - Tipo de suscripción (monthly/yearly)
 * @body {string} transactionId - ID de la transacción
 * @body {number} price - Precio de la suscripción
 * @body {string} purchaseDate - Fecha de compra
 * @body {string} expiresAt - Fecha de expiración
 */
router.post('/purchase', subscriptionController.processPurchase);

module.exports = router;
