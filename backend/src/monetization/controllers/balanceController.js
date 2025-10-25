const stripeService = require('../../services/stripeService');
const { query } = require('../../config/database');

class BalanceController {
  /**
   * Obtener balance y estadísticas financieras
   * GET /api/affiliates/balance
   */
  async getBalance(req, res) {
    try {
      const { user_id } = req.user;

      console.log('💰 [BALANCE] Obteniendo balance para usuario:', user_id);

      // Verificar si es admin
      const userQuery = 'SELECT is_admin FROM users WHERE id = $1';
      const userResult = await query(userQuery, [user_id]);
      
      if (userResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      const isAdmin = userResult.rows[0].is_admin;

      if (!isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Solo administradores pueden ver el balance'
        });
      }

      // Obtener estadísticas de comisiones
      const commissionStatsQuery = `
        SELECT 
          COALESCE(SUM(ac.commission_amount), 0) as total_commissions_paid,
          COALESCE(SUM(CASE WHEN ac.is_paid = true THEN ac.commission_amount ELSE 0 END), 0) as paid_commissions,
          COALESCE(SUM(CASE WHEN ac.is_paid = false AND (ac.is_cancelled = false OR ac.is_cancelled IS NULL) THEN ac.commission_amount ELSE 0 END), 0) as pending_commissions,
          COUNT(CASE WHEN ac.is_paid = true THEN 1 END) as total_payments_made
        FROM affiliate_commissions ac
      `;
      
      const commissionResult = await query(commissionStatsQuery);
      const commissionStats = commissionResult.rows[0];

      // Obtener estadísticas de suscripciones (simulado - necesitarías integrar con tu sistema de suscripciones)
      const subscriptionStatsQuery = `
        SELECT 
          COUNT(*) as total_subscriptions,
          COALESCE(SUM(amount), 0) as total_revenue
        FROM subscriptions 
        WHERE status = 'active'
      `;
      
      let subscriptionStats = { total_subscriptions: 0, total_revenue: 0 };
      try {
        const subscriptionResult = await query(subscriptionStatsQuery);
        subscriptionStats = subscriptionResult.rows[0];
      } catch (error) {
        console.log('⚠️ [BALANCE] Tabla de suscripciones no encontrada, usando valores por defecto');
      }

      // Calcular estimaciones
      const estimatedAppleCut = subscriptionStats.total_revenue * 0.30; // 30% para Apple
      const estimatedNetRevenue = subscriptionStats.total_revenue * 0.70; // 70% para ti
      const estimatedProfit = estimatedNetRevenue - commissionStats.total_commissions_paid;

      // Obtener balance de Stripe si está configurado
      let stripeBalance = null;
      if (stripeService.isConfigured) {
        try {
          const balance = await stripeService.stripe.balance.retrieve();
          stripeBalance = {
            available: balance.available[0]?.amount || 0,
            pending: balance.pending[0]?.amount || 0,
            currency: balance.available[0]?.currency || 'usd'
          };
        } catch (error) {
          console.error('❌ [BALANCE] Error obteniendo balance de Stripe:', error);
        }
      }

      console.log('✅ [BALANCE] Balance obtenido exitosamente');

      res.json({
        success: true,
        data: {
          stripe: stripeBalance,
          commissions: {
            total_paid: parseFloat(commissionStats.total_commissions_paid),
            pending: parseFloat(commissionStats.pending_commissions),
            total_payments_made: parseInt(commissionStats.total_payments_made)
          },
          subscriptions: {
            total: parseInt(subscriptionStats.total_subscriptions),
            total_revenue: parseFloat(subscriptionStats.total_revenue),
            apple_cut: estimatedAppleCut,
            net_revenue: estimatedNetRevenue
          },
          profit: {
            estimated: estimatedProfit,
            margin_percentage: subscriptionStats.total_revenue > 0 
              ? ((estimatedProfit / subscriptionStats.total_revenue) * 100).toFixed(2)
              : 0
          },
          stripe_configured: stripeService.isConfigured
        }
      });

    } catch (error) {
      console.error('❌ [BALANCE] Error obteniendo balance:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo balance',
        error: error.message
      });
    }
  }

  /**
   * Obtener historial de transferencias
   * GET /api/affiliates/transfer-history
   */
  async getTransferHistory(req, res) {
    try {
      const { user_id } = req.user;
      const { limit = 50, offset = 0 } = req.query;

      console.log('📊 [BALANCE] Obteniendo historial de transferencias para usuario:', user_id);

      // Verificar si es admin
      const userQuery = 'SELECT is_admin FROM users WHERE id = $1';
      const userResult = await query(userQuery, [user_id]);
      
      if (userResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      const isAdmin = userResult.rows[0].is_admin;

      if (!isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Solo administradores pueden ver el historial de transferencias'
        });
      }

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
          u.name as affiliate_name,
          u.email as affiliate_email,
          ac.code as affiliate_code
        FROM affiliate_payments ap
        JOIN users u ON ap.user_id = u.id
        JOIN affiliate_codes ac ON ap.affiliate_code = ac.code
        ORDER BY ap.created_at DESC
        LIMIT $1 OFFSET $2
      `;
      
      const historyResult = await query(historyQuery, [limit, offset]);
      
      console.log('✅ [BALANCE] Historial obtenido:', historyResult.rows.length, 'transferencias');

      res.json({
        success: true,
        data: {
          transfers: historyResult.rows,
          total: historyResult.rows.length
        }
      });

    } catch (error) {
      console.error('❌ [BALANCE] Error obteniendo historial:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo historial de transferencias',
        error: error.message
      });
    }
  }
}

module.exports = new BalanceController();
