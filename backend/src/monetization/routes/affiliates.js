const express = require('express');
const affiliateController = require('../controllers/affiliateController');
const simpleAffiliateController = require('../controllers/simpleAffiliateController');
const { authenticateToken } = require('../../middleware/auth');

const router = express.Router();

// Middleware de autenticación para todas las rutas EXCEPTO create-account
// router.use(authenticateToken);

/**
 * @route POST /api/affiliates/create-account
 * @desc Crear una cuenta de afiliado completa (Admin only)
 * @access Private (Admin)
 * @body {string} email - Email del afiliado
 * @body {string} name - Nombre del afiliado
 * @body {string} password - Contraseña del afiliado
 * @body {string} referralCode - Código de referido único
 * @body {number} commissionPercentage - Porcentaje de comisión (opcional, default 30)
 */
router.post('/create-account', authenticateToken, affiliateController.createAffiliateAccount);

/**
 * @route POST /api/affiliates/admin-create-credential
 * @desc Crear credenciales de afiliado directamente (Admin only)
 * @access Private (Admin)
 * @body {string} email - Email del afiliado
 * @body {string} name - Nombre del afiliado
 * @body {string} password - Contraseña del afiliado
 * @body {string} referralCode - Código de referido único
 * @body {number} commissionPercentage - Porcentaje de comisión (opcional, default 30)
 */
router.post('/admin-create-credential', authenticateToken, affiliateController.adminCreateCredential);

/**
 * @route POST /api/affiliates/change-password
 * @desc Cambiar contraseña del afiliado
 * @access Private
 * @body {string} currentPassword - Contraseña actual
 * @body {string} newPassword - Nueva contraseña
 */
router.post('/change-password', authenticateToken, affiliateController.changeAffiliatePassword);

/**
 * @route POST /api/affiliates/codes
 * @desc Crear un nuevo código de afiliado
 * @access Private (Admin)
 * @body {string} affiliate_name - Nombre del afiliado
 * @body {string} email - Email del afiliado (opcional)
 * @body {number} commission_percentage - Porcentaje de comisión (opcional, default 30)
 */
router.post('/codes', authenticateToken, affiliateController.createAffiliateCode);

/**
 * @route GET /api/affiliates/codes
 * @desc Obtener todos los códigos de afiliado activos
 * @access Private (Admin)
 */
router.get('/codes', authenticateToken, affiliateController.getAllAffiliateCodes);

/**
 * @route DELETE /api/affiliates/codes/:id
 * @desc Desactivar un código de afiliado
 * @access Private (Admin)
 * @param {string} id - ID del código de afiliado
 */
router.delete('/codes/:id', authenticateToken, affiliateController.deactivateAffiliateCode);

/**
 * @route POST /api/affiliates/referral
 * @desc Registrar código de referencia para el usuario autenticado
 * @access Private
 * @body {string} referral_code - Código de referencia del afiliado
 */
router.post('/referral', authenticateToken, affiliateController.registerReferralCode);

/**
 * @route GET /api/affiliates/my-referral
 * @desc Obtener información de referencia del usuario autenticado
 * @access Private
 */
router.get('/my-referral', authenticateToken, affiliateController.getMyReferral);

/**
 * @route GET /api/affiliates/dashboard
 * @desc Obtener dashboard de afiliado para el usuario autenticado
 * @access Private (Affiliate)
 */
router.get('/dashboard', authenticateToken, affiliateController.getAffiliateDashboard);

// Ruta movida más abajo para evitar conflicto con la ruta pública

/**
 * @route GET /api/affiliates/referrals/:code
 * @desc Obtener lista de referidos de un afiliado
 * @access Private (Admin)
 * @param {string} code - Código del afiliado
 * @query {number} limit - Límite de resultados (default 50)
 * @query {number} offset - Offset para paginación (default 0)
 * @query {boolean} premium_only - Solo usuarios premium (default false)
 */
router.get('/referrals/:code', authenticateToken, affiliateController.getAffiliateReferrals);

/**
 * @route GET /api/affiliates/commissions/:code
 * @desc Obtener comisiones de un afiliado
 * @access Private (Admin)
 * @param {string} code - Código del afiliado
 * @query {number} limit - Límite de resultados (default 50)
 * @query {number} offset - Offset para paginación (default 0)
 * @query {boolean} paid_only - Solo comisiones pagadas (default false)
 * @query {boolean} unpaid_only - Solo comisiones pendientes (default false)
 * @query {string} date_from - Fecha de inicio (YYYY-MM-DD)
 * @query {string} date_to - Fecha de fin (YYYY-MM-DD)
 */
router.get('/commissions/:code', authenticateToken, affiliateController.getAffiliateCommissions);

/**
 * @route POST /api/affiliates/payments
 * @desc Procesar pago de comisiones
 * @access Private (Admin)
 * @body {string} affiliate_code - Código del afiliado
 * @body {array} commission_ids - Array de IDs de comisiones a pagar
 * @body {string} payment_method - Método de pago (paypal, transferencia, etc.)
 * @body {string} payment_reference - Referencia del pago
 */
router.post('/payments', authenticateToken, affiliateController.processCommissionPayment);

/**
 * @route GET /api/affiliates/pending-payments
 * @desc Obtener comisiones pendientes de pago
 * @access Private (Admin)
 * @query {string} affiliate_code - Código del afiliado (opcional)
 */
router.get('/pending-payments', authenticateToken, affiliateController.getPendingPayments);

/**
 * @route GET /api/affiliates/simple-dashboard
 * @desc Obtener dashboard simplificado de afiliado
 * @access Private (Affiliate)
 */
router.get('/simple-dashboard', authenticateToken, simpleAffiliateController.getSimpleAffiliateDashboard);

/**
 * @route GET /api/affiliates/my-info
 * @desc Obtener información básica del afiliado
 * @access Private (Affiliate)
 */
router.get('/my-info', authenticateToken, simpleAffiliateController.getMyAffiliateInfo);

/**
 * @route GET /api/affiliates/stats/:code
 * @desc Obtener estadísticas de un código de afiliado específico
 * @access Public (para validación de códigos)
 */
router.get('/stats/:code', simpleAffiliateController.getAffiliateStats);

/**
 * @route GET /api/affiliates/debug-codes
 * @desc Debug: Listar todos los códigos de afiliados
 * @access Public (para debugging)
 */
router.get('/debug-codes', simpleAffiliateController.debugListCodes);

/**
 * @route GET /api/affiliates/debug-db
 * @desc Debug: Verificar estado de la base de datos
 * @access Public (para debugging)
 */
router.get('/debug-db', simpleAffiliateController.debugDatabase);

/**
 * @route POST /api/affiliates/init-tables
 * @desc Debug: Inicializar tablas de afiliados
 * @access Public (para debugging)
 */
router.post('/init-tables', simpleAffiliateController.initAffiliateTables);

/**
 * @route GET /api/affiliates/debug-code/:code
 * @desc Debug: Probar validación de código específico
 * @access Public (para debugging)
 */
router.get('/debug-code/:code', simpleAffiliateController.debugCode);

/**
 * @route POST /api/affiliates/fix-codes
 * @desc Debug: Arreglar códigos con affiliate_id en lugar de created_by
 * @access Public (para debugging)
 */
router.post('/fix-codes', simpleAffiliateController.fixCodes);

/**
 * @route POST /api/affiliates/update-premium-status
 * @desc Actualizar referido a premium y crear comisión
 * @access Private (Admin)
 */
router.post('/update-premium-status', authenticateToken, simpleAffiliateController.updatePremiumStatus);

/**
 * @route POST /api/affiliates/simulate-premium-conversion
 * @desc Simular conversión a premium (para testing)
 * @access Public (para testing)
 */
router.post('/simulate-premium-conversion', simpleAffiliateController.simulatePremiumConversion);

/**
 * @route GET /api/affiliates/admin-dashboard
 * @desc Obtener dashboard de administración con datos reales
 * @access Private (Admin)
 */
router.get('/admin-dashboard', authenticateToken, simpleAffiliateController.getAdminDashboard);

// Ruta privada eliminada - los códigos de afiliados son públicos

module.exports = router;
