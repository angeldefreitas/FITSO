const { query } = require('../../config/database');

/**
 * Obtener dashboard completo de administración con estadísticas de todos los afiliados
 */
const getAdminDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('📊 [ADMIN DASHBOARD] Obteniendo dashboard para admin:', userId);

    // 1. Obtener todos los códigos de afiliado
    const affiliatesQuery = `
      SELECT 
        ac.id,
        ac.code,
        ac.affiliate_name,
        ac.commission_percentage,
        ac.is_active,
        ac.created_at,
        ac.created_by
      FROM affiliate_codes ac
      ORDER BY ac.created_at DESC
    `;
    const affiliatesResult = await query(affiliatesQuery);
    const affiliates = affiliatesResult.rows;

    // 2. Para cada afiliado, obtener estadísticas
    const affiliatesWithStats = await Promise.all(
      affiliates.map(async (affiliate) => {
        // Contar referidos totales
        const referralsQuery = `
          SELECT COUNT(*) as total_referrals
          FROM user_referrals
          WHERE affiliate_code = $1
        `;
        const referralsResult = await query(referralsQuery, [affiliate.code]);
        const totalReferrals = parseInt(referralsResult.rows[0].total_referrals) || 0;

        // Contar referidos premium
        const premiumReferralsQuery = `
          SELECT COUNT(*) as premium_referrals
          FROM user_referrals
          WHERE affiliate_code = $1 AND is_premium = true
        `;
        const premiumReferralsResult = await query(premiumReferralsQuery, [affiliate.code]);
        const premiumReferrals = parseInt(premiumReferralsResult.rows[0].premium_referrals) || 0;

        // Obtener comisiones
        const commissionsQuery = `
          SELECT 
            COALESCE(SUM(commission_amount), 0) as total_commissions,
            COALESCE(SUM(CASE WHEN is_paid = false THEN commission_amount ELSE 0 END), 0) as pending_commissions,
            COALESCE(SUM(CASE WHEN is_paid = true THEN commission_amount ELSE 0 END), 0) as paid_commissions
          FROM affiliate_commissions
          WHERE affiliate_code = $1
        `;
        const commissionsResult = await query(commissionsQuery, [affiliate.code]);
        const commissions = commissionsResult.rows[0];

        // Calcular tasa de conversión
        const conversionRate = totalReferrals > 0 
          ? Math.round((premiumReferrals / totalReferrals) * 100 * 100) / 100 
          : 0;

        return {
          id: affiliate.id,
          code: affiliate.code,
          affiliate_name: affiliate.affiliate_name,
          commission_percentage: parseFloat(affiliate.commission_percentage),
          is_active: affiliate.is_active,
          created_at: affiliate.created_at,
          stats: {
            total_referrals: totalReferrals,
            premium_referrals: premiumReferrals,
            total_commissions: parseFloat(commissions.total_commissions),
            pending_commissions: parseFloat(commissions.pending_commissions),
            paid_commissions: parseFloat(commissions.paid_commissions),
            conversion_rate: conversionRate
          }
        };
      })
    );

    // 3. Calcular totales generales
    const totalReferrals = affiliatesWithStats.reduce((sum, a) => sum + a.stats.total_referrals, 0);
    const totalPremiumReferrals = affiliatesWithStats.reduce((sum, a) => sum + a.stats.premium_referrals, 0);
    const totalCommissions = affiliatesWithStats.reduce((sum, a) => sum + a.stats.total_commissions, 0);
    const totalPendingCommissions = affiliatesWithStats.reduce((sum, a) => sum + a.stats.pending_commissions, 0);
    const totalPaidCommissions = affiliatesWithStats.reduce((sum, a) => sum + a.stats.paid_commissions, 0);
    const overallConversion = totalReferrals > 0 
      ? Math.round((totalPremiumReferrals / totalReferrals) * 100 * 100) / 100 
      : 0;

    // 4. Respuesta final
    const dashboardData = {
      summary: {
        total_affiliates: affiliates.length,
        total_referrals: totalReferrals,
        total_premium_referrals: totalPremiumReferrals,
        total_commissions: totalCommissions,
        pending_commissions: totalPendingCommissions,
        paid_commissions: totalPaidCommissions,
        overall_conversion: overallConversion
      },
      affiliates: affiliatesWithStats
    };

    console.log('✅ [ADMIN DASHBOARD] Dashboard generado con', affiliates.length, 'afiliados');
    res.json({ success: true, data: dashboardData });

  } catch (error) {
    console.error('❌ Error obteniendo dashboard de administración:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error obteniendo dashboard de administración',
      error: error.message 
    });
  }
};

/**
 * Actualizar porcentaje de comisión de un afiliado
 */
const updateAffiliateCommission = async (req, res) => {
  try {
    const { code } = req.params;
    const { commission_percentage } = req.body;

    console.log('🔄 [ADMIN] Actualizando comisión de', code, 'a', commission_percentage);

    if (!commission_percentage || commission_percentage < 0 || commission_percentage > 100) {
      return res.status(400).json({
        success: false,
        message: 'El porcentaje de comisión debe estar entre 0 y 100'
      });
    }

    const updateQuery = `
      UPDATE affiliate_codes
      SET commission_percentage = $1, updated_at = CURRENT_TIMESTAMP
      WHERE code = $2
      RETURNING *
    `;

    const result = await query(updateQuery, [commission_percentage, code]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Código de afiliado no encontrado'
      });
    }

    console.log('✅ [ADMIN] Comisión actualizada:', result.rows[0]);
    res.json({ success: true, data: result.rows[0] });

  } catch (error) {
    console.error('❌ Error actualizando comisión:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error actualizando comisión',
      error: error.message 
    });
  }
};

/**
 * Activar/desactivar código de afiliado
 */
const toggleAffiliateStatus = async (req, res) => {
  try {
    const { code } = req.params;
    const { is_active } = req.body;

    console.log('🔄 [ADMIN] Cambiando estado de', code, 'a', is_active);

    const updateQuery = `
      UPDATE affiliate_codes
      SET is_active = $1, updated_at = CURRENT_TIMESTAMP
      WHERE code = $2
      RETURNING *
    `;

    const result = await query(updateQuery, [is_active, code]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Código de afiliado no encontrado'
      });
    }

    console.log('✅ [ADMIN] Estado actualizado:', result.rows[0]);
    res.json({ success: true, data: result.rows[0] });

  } catch (error) {
    console.error('❌ Error actualizando estado:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error actualizando estado',
      error: error.message 
    });
  }
};

module.exports = {
  getAdminDashboard,
  updateAffiliateCommission,
  toggleAffiliateStatus
};

