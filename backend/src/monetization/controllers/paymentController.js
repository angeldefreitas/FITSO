const stripeService = require('../../services/stripeService');
const { query } = require('../../config/database');

class PaymentController {
  /**
   * Crear cuenta de Stripe para afiliado
   * POST /api/affiliates/create-stripe-account
   */
  async createStripeAccount(req, res) {
    try {
      const { user_id } = req.user;
      const { country = 'US', type = 'express' } = req.body;

      console.log('🏦 [PAYMENT] Creando cuenta Stripe para usuario:', user_id);

      // Obtener datos del usuario
      const userQuery = 'SELECT email, name FROM users WHERE id = $1';
      const userResult = await query(userQuery, [user_id]);
      
      if (userResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      const user = userResult.rows[0];

      // Crear cuenta conectada en Stripe
      const accountResult = await stripeService.createConnectedAccount({
        email: user.email,
        country: country,
        type: type
      });

      // Guardar account_id en la base de datos
      const updateQuery = `
        UPDATE users 
        SET stripe_account_id = $1, updated_at = CURRENT_TIMESTAMP 
        WHERE id = $2
      `;
      await query(updateQuery, [accountResult.accountId, user_id]);

      // Crear enlace de onboarding
      const onboardingResult = await stripeService.createOnboardingLink(
        accountResult.accountId,
        `${process.env.FRONTEND_URL}/affiliate/onboarding-complete`
      );

      console.log('✅ [PAYMENT] Cuenta Stripe creada exitosamente');

      res.json({
        success: true,
        message: 'Cuenta Stripe creada exitosamente',
        data: {
          account_id: accountResult.accountId,
          onboarding_url: onboardingResult.url,
          expires_at: onboardingResult.expires_at
        }
      });

    } catch (error) {
      console.error('❌ [PAYMENT] Error creando cuenta Stripe:', error);
      res.status(500).json({
        success: false,
        message: 'Error creando cuenta Stripe',
        error: error.message
      });
    }
  }

  /**
   * Obtener estado de cuenta Stripe
   * GET /api/affiliates/stripe-account-status
   */
  async getStripeAccountStatus(req, res) {
    try {
      const { user_id } = req.user;

      console.log('🔍 [PAYMENT] Verificando estado de cuenta para usuario:', user_id);

      // Obtener account_id del usuario
      const userQuery = 'SELECT stripe_account_id FROM users WHERE id = $1';
      const userResult = await query(userQuery, [user_id]);
      
      if (userResult.rows.length === 0 || !userResult.rows[0].stripe_account_id) {
        return res.json({
          success: true,
          message: 'Usuario no tiene cuenta Stripe configurada',
          data: {
            has_account: false
          }
        });
      }

      const accountId = userResult.rows[0].stripe_account_id;

      // Verificar estado en Stripe
      const statusResult = await stripeService.getAccountStatus(accountId);

      console.log('✅ [PAYMENT] Estado de cuenta obtenido');

      res.json({
        success: true,
        data: {
          has_account: true,
          account_id: accountId,
          ...statusResult
        }
      });

    } catch (error) {
      console.error('❌ [PAYMENT] Error verificando cuenta:', error);
      res.status(500).json({
        success: false,
        message: 'Error verificando cuenta Stripe',
        error: error.message
      });
    }
  }

  /**
   * Procesar pago de comisión
   * POST /api/affiliates/process-payout
   */
  async processPayout(req, res) {
    try {
      const { affiliate_code, amount, description } = req.body;

      console.log('💰 [PAYMENT] Procesando pago de comisión:', {
        affiliate_code,
        amount,
        description
      });

      if (!affiliate_code || !amount) {
        return res.status(400).json({
          success: false,
          message: 'affiliate_code y amount son requeridos'
        });
      }

      // Obtener datos del afiliado
      const affiliateQuery = `
        SELECT u.id, u.email, u.name, u.stripe_account_id, ac.commission_percentage
        FROM users u
        JOIN affiliate_codes ac ON u.id = ac.created_by
        WHERE ac.code = $1
      `;
      
      const affiliateResult = await query(affiliateQuery, [affiliate_code]);
      
      if (affiliateResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Afiliado no encontrado'
        });
      }

      const affiliate = affiliateResult.rows[0];

      if (!affiliate.stripe_account_id) {
        return res.status(400).json({
          success: false,
          message: 'Afiliado no tiene cuenta Stripe configurada'
        });
      }

      // Verificar estado de la cuenta
      const accountStatus = await stripeService.getAccountStatus(affiliate.stripe_account_id);
      
      if (!accountStatus.payoutsEnabled) {
        return res.status(400).json({
          success: false,
          message: 'Cuenta del afiliado no está habilitada para pagos'
        });
      }

      // Procesar pago
      const payoutResult = await stripeService.createPayout({
        affiliateId: affiliate.stripe_account_id,
        email: affiliate.email,
        amount: parseFloat(amount),
        description: description || `Comisión de afiliado - ${affiliate.name}`
      });

      // Registrar pago en la base de datos
      const paymentQuery = `
        INSERT INTO affiliate_payments (
          id, affiliate_code, user_id, amount, stripe_transfer_id, 
          status, description, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `;
      
      const { v4: uuidv4 } = require('uuid');
      await query(paymentQuery, [
        uuidv4(),
        affiliate_code,
        affiliate.id,
        amount,
        payoutResult.transferId,
        payoutResult.status,
        description || `Comisión de afiliado - ${affiliate.name}`
      ]);

      // Marcar comisiones como pagadas
      const updateCommissionsQuery = `
        UPDATE affiliate_commissions 
        SET is_paid = true, paid_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE affiliate_code = $1 AND is_paid = false
      `;
      await query(updateCommissionsQuery, [affiliate_code]);

      console.log('✅ [PAYMENT] Pago procesado exitosamente');

      res.json({
        success: true,
        message: 'Pago procesado exitosamente',
        data: {
          transfer_id: payoutResult.transferId,
          amount: amount,
          status: payoutResult.status
        }
      });

    } catch (error) {
      console.error('❌ [PAYMENT] Error procesando pago:', error);
      res.status(500).json({
        success: false,
        message: 'Error procesando pago',
        error: error.message
      });
    }
  }

  /**
   * Obtener historial de pagos
   * GET /api/affiliates/payment-history
   */
  async getPaymentHistory(req, res) {
    try {
      const { user_id } = req.user;
      const { limit = 50, offset = 0 } = req.query;

      console.log('📊 [PAYMENT] Obteniendo historial de pagos para usuario:', user_id);

      // Obtener historial de pagos
      const historyQuery = `
        SELECT 
          ap.id,
          ap.amount,
          ap.stripe_transfer_id,
          ap.status,
          ap.description,
          ap.created_at,
          ap.paid_at,
          ac.code as affiliate_code
        FROM affiliate_payments ap
        JOIN affiliate_codes ac ON ap.affiliate_code = ac.code
        WHERE ap.user_id = $1
        ORDER BY ap.created_at DESC
        LIMIT $2 OFFSET $3
      `;
      
      const historyResult = await query(historyQuery, [user_id, limit, offset]);
      
      console.log('✅ [PAYMENT] Historial obtenido:', historyResult.rows.length, 'pagos');

      res.json({
        success: true,
        data: {
          payments: historyResult.rows,
          total: historyResult.rows.length
        }
      });

    } catch (error) {
      console.error('❌ [PAYMENT] Error obteniendo historial:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo historial de pagos',
        error: error.message
      });
    }
  }

  /**
   * Webhook de Stripe
   * POST /api/affiliates/stripe-webhook
   */
  async handleStripeWebhook(req, res) {
    try {
      const signature = req.headers['stripe-signature'];
      const payload = req.body;

      console.log('📨 [PAYMENT] Webhook de Stripe recibido');

      const result = await stripeService.processWebhook(payload, signature);

      res.json({
        success: true,
        message: 'Webhook procesado exitosamente',
        data: result
      });

    } catch (error) {
      console.error('❌ [PAYMENT] Error procesando webhook:', error);
      res.status(400).json({
        success: false,
        message: 'Error procesando webhook',
        error: error.message
      });
    }
  }
}

module.exports = new PaymentController();
