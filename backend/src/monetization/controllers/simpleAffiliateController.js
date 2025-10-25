const User = require('../../models/User');
const AffiliateCode = require('../models/AffiliateCode');

class SimpleAffiliateController {
  /**
   * Obtener dashboard de afiliado simplificado
   * GET /api/affiliates/simple-dashboard
   */
  async getSimpleAffiliateDashboard(req, res) {
    try {
      const user_id = req.user.id;
      
      console.log('🔍 [SIMPLE AFFILIATE] Obteniendo dashboard para usuario:', user_id);
      
      // Verificar si el usuario es afiliado
      const user = await User.findById(user_id);
      if (!user || !user.is_affiliate) {
        return res.status(403).json({
          success: false,
          message: 'Solo los afiliados pueden acceder al dashboard'
        });
      }

      // Buscar el código de afiliado real del usuario
      let affiliateCode = `AFF_${user.name.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 8)}`;
      try {
        const realCode = await AffiliateCode.findByAffiliateId(user_id);
        if (realCode) {
          affiliateCode = realCode.code;
          console.log('✅ [SIMPLE AFFILIATE] Código real encontrado:', affiliateCode);
        } else {
          console.log('⚠️ [SIMPLE AFFILIATE] No se encontró código real, usando generado:', affiliateCode);
        }
      } catch (codeError) {
        console.log('⚠️ [SIMPLE AFFILIATE] Error buscando código real:', codeError.message);
      }

      // Crear estadísticas básicas para el dashboard
      const dashboardStats = {
        total_referrals: 0, // Por ahora 0, se puede implementar después
        premium_referrals: 0,
        total_commissions: 0.00,
        pending_commissions: 0.00,
        paid_commissions: 0.00,
        conversion_rate: 0.00,
        affiliate_code: affiliateCode,
        user_info: {
          name: user.name,
          email: user.email,
          member_since: user.created_at
        }
      };

      console.log('✅ [SIMPLE AFFILIATE] Dashboard generado:', dashboardStats);

      res.json({
        success: true,
        data: dashboardStats
      });

    } catch (error) {
      console.error('❌ Error obteniendo dashboard simple de afiliado:', error.message);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo dashboard de afiliado'
      });
    }
  }

  /**
   * Obtener estadísticas de un código de afiliado específico
   * GET /api/affiliates/stats/:code
   */
  async getAffiliateStats(req, res) {
    try {
      const { code } = req.params;
      
      console.log('🔍 [SIMPLE AFFILIATE] Buscando estadísticas para código:', code);
      
      // Buscar el código de afiliado
      const affiliateCode = await AffiliateCode.findByCode(code);
      if (!affiliateCode) {
        return res.status(404).json({
          success: false,
          message: 'Código de afiliado no encontrado'
        });
      }

      // Obtener información del afiliado
      const affiliate = await User.findById(affiliateCode.created_by);
      if (!affiliate) {
        return res.status(404).json({
          success: false,
          message: 'Afiliado no encontrado'
        });
      }

      const stats = {
        affiliate: {
          affiliate_name: affiliate.name,
          email: affiliate.email,
          code: affiliateCode.code,
          commission_percentage: affiliateCode.commission_percentage
        },
        total_referrals: 0, // Por ahora 0, se implementará después
        premium_referrals: 0,
        total_commissions: 0.00
      };

      console.log('✅ [SIMPLE AFFILIATE] Estadísticas encontradas:', stats);

      res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      console.error('❌ Error obteniendo estadísticas de afiliado:', error.message);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo estadísticas de afiliado'
      });
    }
  },

  /**
   * Obtener información básica del afiliado
   * GET /api/affiliates/my-info
   */
  async getMyAffiliateInfo(req, res) {
    try {
      const user_id = req.user.id;
      
      // Verificar si el usuario es afiliado
      const user = await User.findById(user_id);
      if (!user || !user.is_affiliate) {
        return res.status(403).json({
          success: false,
          message: 'Solo los afiliados pueden acceder a esta información'
        });
      }

      // Buscar el código de afiliado real del usuario
      let affiliateCode = `AFF_${user.name.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 8)}`;
      try {
        const realCode = await AffiliateCode.findByAffiliateId(user_id);
        if (realCode) {
          affiliateCode = realCode.code;
        }
      } catch (codeError) {
        console.log('⚠️ [SIMPLE AFFILIATE] Error buscando código real:', codeError.message);
      }

      const affiliateInfo = {
        name: user.name,
        email: user.email,
        affiliate_code: affiliateCode,
        member_since: user.created_at,
        is_active: true
      };

      res.json({
        success: true,
        data: affiliateInfo
      });

    } catch (error) {
      console.error('❌ Error obteniendo información de afiliado:', error.message);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo información de afiliado'
      });
    }
  }
}

module.exports = new SimpleAffiliateController();
