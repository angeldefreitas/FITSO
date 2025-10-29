const express = require('express');
const router = express.Router();
const balanceController = require('../controllers/balanceController');
const { authenticateToken } = require('../../middleware/auth');

/**
 * @route GET /api/affiliates/balance
 * @desc Obtener balance y estadísticas financieras
 * @access Private (Admin only)
 */
router.get('/balance', authenticateToken, balanceController.getBalance);

/**
 * @route GET /api/affiliates/transfer-history
 * @desc Obtener historial de transferencias
 * @access Private (Admin only)
 * @query {number} limit - Límite de resultados (default: 50)
 * @query {number} offset - Offset para paginación (default: 0)
 */
router.get('/transfer-history', authenticateToken, balanceController.getTransferHistory);

module.exports = router;


