const { query } = require('../../config/database');

// Dashboard simple de afiliado - SIN CONSULTAS COMPLEJAS
const getSimpleAffiliateDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('🔍 [SIMPLE DASHBOARD] Obteniendo dashboard para usuario:', userId);

    // 1. Obtener información del usuario
    const userQuery = 'SELECT * FROM users WHERE id = $1';
    const userResult = await query(userQuery, [userId]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const user = userResult.rows[0];

    // 2. Obtener el código de afiliado del usuario
    const affiliateQuery = 'SELECT * FROM affiliate_codes WHERE created_by = $1 AND is_active = true';
    const affiliateResult = await query(affiliateQuery, [userId]);
    
    if (affiliateResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No se encontró código de afiliado activo'
      });
    }

    const affiliateCode = affiliateResult.rows[0];
    console.log('✅ [SIMPLE DASHBOARD] Código encontrado:', affiliateCode.code);

    // 3. Obtener estadísticas de referidos
    const referralsQuery = `
      SELECT 
        COALESCE(COUNT(ur.id), 0) as total_referrals,
        COALESCE(SUM(CASE WHEN ur.is_premium = true THEN 1 ELSE 0 END), 0) as premium_referrals
      FROM user_referrals ur
      WHERE ur.affiliate_code = $1
    `;
    
    const referralsResult = await query(referralsQuery, [affiliateCode.code]);
    const referralsStats = referralsResult.rows[0];
    
    // 4. Obtener estadísticas de comisiones
    const commissionsQuery = `
      SELECT 
        COALESCE(SUM(ac.commission_amount), 0) as total_commissions,
        COALESCE(SUM(CASE WHEN ac.is_paid = false THEN ac.commission_amount ELSE 0 END), 0) as pending_commissions,
        COALESCE(SUM(CASE WHEN ac.is_paid = true THEN ac.commission_amount ELSE 0 END), 0) as paid_commissions
      FROM affiliate_commissions ac
      WHERE ac.affiliate_code = $1
    `;
    
    const commissionsResult = await query(commissionsQuery, [affiliateCode.code]);
    const commissionsStats = commissionsResult.rows[0];
    
    // 5. Combinar estadísticas
    const stats = {
      total_referrals: referralsStats.total_referrals,
      premium_referrals: referralsStats.premium_referrals,
      total_commissions: commissionsStats.total_commissions,
      pending_commissions: commissionsStats.pending_commissions,
      paid_commissions: commissionsStats.paid_commissions
    };

    // 6. Calcular tasa de conversión
    const totalReferrals = parseInt(stats.total_referrals) || 0;
    const premiumReferrals = parseInt(stats.premium_referrals) || 0;
    const conversionRate = totalReferrals > 0 ? (premiumReferrals / totalReferrals) * 100 : 0;

    // 7. Preparar respuesta
    const dashboardData = {
      total_referrals: totalReferrals,
      premium_referrals: premiumReferrals,
      total_commissions: parseFloat(stats.total_commissions) || 0,
      pending_commissions: parseFloat(stats.pending_commissions) || 0,
      paid_commissions: parseFloat(stats.paid_commissions) || 0,
      conversion_rate: Math.round(conversionRate * 100) / 100,
      commission_percentage: parseFloat(affiliateCode.commission_percentage),
      affiliate_code: affiliateCode.code,
      user_info: {
        name: user.name,
        email: user.email,
        member_since: user.created_at
      }
    };

    console.log('✅ [SIMPLE DASHBOARD] Dashboard generado:', dashboardData);

    res.json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('❌ Error obteniendo dashboard simple de afiliado:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo dashboard de afiliado'
    });
  }
};

module.exports = {
  getSimpleAffiliateDashboard
};
