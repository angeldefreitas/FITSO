const { stripeService } = require('../services/payment');
const { query } = require('../../config/database');

class BalanceController {
  /**
   * Obtener balance y estadísticas financieras
   * GET /api/affiliates/balance
   */
  async getBalance(req, res) {
    try {
      const userId = req.user.id;

      console.log('💰 [BALANCE] Obteniendo balance para usuario:', userId);

      // Obtener estadísticas de comisiones
      const commissionStatsQuery = `
        SELECT 
          COALESCE(SUM(ac.commission_amount), 0) as total_commissions_paid,
          COALESCE(SUM(CASE WHEN ac.is_paid = true THEN ac.commission_amount ELSE 0 END), 0) as paid_commissions,
          COALESCE(SUM(CASE WHEN ac.is_paid = false THEN ac.commission_amount ELSE 0 END), 0) as pending_commissions,
          COUNT(CASE WHEN ac.is_paid = true THEN 1 END) as total_payments_made
        FROM affiliate_commissions ac
      `;
      
      const commissionResult = await query(commissionStatsQuery);
      const commissionStats = commissionResult.rows[0];

      // Obtener estadísticas de suscripciones:
      // 1. Usuarios premium CON referral (generan comisiones para afiliados)
      // 2. Usuarios premium SIN referral (100% de la app)
      
      let subscriptionStats = { 
        total_subscriptions: 0, 
        total_revenue: 0,
        premium_with_referral: 0,
        premium_without_referral: 0,
        total_with_referral: 0,
        total_without_referral: 0
      };
      
      try {
        // Contar TODOS los usuarios con código de referral
        const totalWithReferralQuery = `
          SELECT COUNT(*) as count
          FROM user_referrals
        `;
        
        const totalWithReferralResult = await query(totalWithReferralQuery);
        subscriptionStats.total_with_referral = parseInt(totalWithReferralResult.rows[0].count) || 0;
        
        // Contar usuarios premium CON referral (is_premium = true en user_referrals)
        const premiumWithReferralQuery = `
          SELECT COUNT(*) as count
          FROM user_referrals
          WHERE is_premium = true
        `;
        
        const premiumWithReferralResult = await query(premiumWithReferralQuery);
        subscriptionStats.premium_with_referral = parseInt(premiumWithReferralResult.rows[0].count) || 0;
        
        // Contar usuarios premium SIN referral (con subscripción activa pero sin user_referral)
        const premiumWithoutReferralQuery = `
          SELECT COUNT(DISTINCT s.user_id) as count
          FROM subscriptions s
          WHERE s.is_active = true 
            AND s.expires_date > CURRENT_TIMESTAMP
            AND NOT EXISTS (
              SELECT 1 FROM user_referrals ur 
              WHERE ur.user_id = s.user_id
            )
        `;
        
        const premiumWithoutReferralResult = await query(premiumWithoutReferralQuery);
        subscriptionStats.premium_without_referral = parseInt(premiumWithoutReferralResult.rows[0].count) || 0;
        
        subscriptionStats.total_subscriptions = subscriptionStats.premium_with_referral + subscriptionStats.premium_without_referral;
        
        // Contar TOTAL de usuarios premium (referidos + normales)
        const totalPremiumQuery = `
          SELECT COUNT(DISTINCT s.user_id) as count
          FROM subscriptions s
          WHERE s.is_active = true 
            AND s.expires_date > CURRENT_TIMESTAMP
        `;
        
        const totalPremiumResult = await query(totalPremiumQuery);
        subscriptionStats.total_without_referral = parseInt(totalPremiumResult.rows[0].count) || subscriptionStats.premium_without_referral;
        
        // Calcular ingresos estimados:
        // Solo usuarios premium generan ingresos
        // Usuarios referidos que NO son premium: NO generan ingresos todavía
        const monthlyRevenuePerUser = 9.99;
        
        const revenueFromReferrals = subscriptionStats.premium_with_referral * monthlyRevenuePerUser;
        const revenueFromNormal = subscriptionStats.premium_without_referral * monthlyRevenuePerUser;
        
        subscriptionStats.total_revenue = revenueFromReferrals + revenueFromNormal;
        
        console.log(`📊 [BALANCE] Usuarios con referral: ${subscriptionStats.total_with_referral} total, ${subscriptionStats.premium_with_referral} premium`);
        console.log(`📊 [BALANCE] Usuarios premium: ${subscriptionStats.total_subscriptions} total (${subscriptionStats.premium_with_referral} con referral, ${subscriptionStats.premium_without_referral} normales)`);
        console.log(`💰 [BALANCE] Ingresos estimados: $${subscriptionStats.total_revenue.toFixed(2)}`);
        
      } catch (error) {
        console.log('⚠️ [BALANCE] Error obteniendo estadísticas de suscripciones:', error.message);
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
            net_revenue: estimatedNetRevenue,
            premium_with_referral: subscriptionStats.premium_with_referral,
            premium_without_referral: subscriptionStats.premium_without_referral,
            total_with_referral: subscriptionStats.total_with_referral,
            total_without_referral: subscriptionStats.total_without_referral
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
      const userId = req.user.id;
      const { limit = 50, offset = 0 } = req.query;

      console.log('📊 [BALANCE] Obteniendo historial de transferencias para usuario:', userId);

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
