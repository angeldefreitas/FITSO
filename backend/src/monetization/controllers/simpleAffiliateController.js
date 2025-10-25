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
      
      // Debug: Listar todos los códigos existentes
      try {
        const allCodes = await AffiliateCode.findAllActive();
        console.log('📋 [DEBUG] Códigos activos en la base de datos:', allCodes.map(c => c.code));
      } catch (debugError) {
        console.log('⚠️ [DEBUG] Error listando códigos:', debugError.message);
      }
      
      // Buscar el código de afiliado
      const affiliateCode = await AffiliateCode.findByCode(code);
      console.log('🔍 [SIMPLE AFFILIATE] Resultado de búsqueda:', affiliateCode ? 'Encontrado' : 'No encontrado');
      
      if (!affiliateCode) {
        return res.status(404).json({
          success: false,
          message: 'Código de afiliado no encontrado'
        });
      }

      // Obtener información del afiliado
      console.log('🔍 [SIMPLE AFFILIATE] Buscando usuario con ID:', affiliateCode.created_by);
      const affiliate = await User.findById(affiliateCode.created_by);
      console.log('🔍 [SIMPLE AFFILIATE] Usuario encontrado:', affiliate ? 'Sí' : 'No');
      
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
  }

  /**
   * Debug: Listar todos los códigos de afiliados
   * GET /api/affiliates/debug-codes
   */
  async debugListCodes(req, res) {
    try {
      console.log('🔍 [DEBUG] Listando todos los códigos de afiliados...');
      
      const allCodes = await AffiliateCode.findAllActive();
      console.log('📋 [DEBUG] Códigos encontrados:', allCodes.length);
      
      const codesInfo = allCodes.map(code => ({
        id: code.id,
        code: code.code,
        created_by: code.created_by,
        is_active: code.is_active,
        created_at: code.created_at
      }));
      
      res.json({
        success: true,
        data: {
          total_codes: allCodes.length,
          codes: codesInfo
        }
      });
      
    } catch (error) {
      console.error('❌ [DEBUG] Error listando códigos:', error);
      res.status(500).json({
        success: false,
        message: 'Error listando códigos',
        error: error.message
      });
    }
  }

  /**
   * Debug: Verificar estado de la base de datos
   * GET /api/affiliates/debug-db
   */
  async debugDatabase(req, res) {
    try {
      console.log('🔍 [DEBUG] Verificando estado de la base de datos...');
      
      // Verificar si las tablas existen
      const tables = [
        'affiliate_codes',
        'user_referrals', 
        'affiliate_commissions',
        'affiliate_payments'
      ];
      
      const results = {};
      
      for (const table of tables) {
        try {
          const query = `SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = $1
          )`;
          const result = await query(query, [table]);
          results[table] = result.rows[0].exists;
          console.log(`📋 [DEBUG] Tabla ${table}: ${result.rows[0].exists ? 'EXISTE' : 'NO EXISTE'}`);
        } catch (error) {
          results[table] = false;
          console.log(`❌ [DEBUG] Error verificando tabla ${table}:`, error.message);
        }
      }
      
      res.json({
        success: true,
        data: {
          tables: results,
          message: 'Verificación de base de datos completada'
        }
      });
      
    } catch (error) {
      console.error('❌ [DEBUG] Error verificando base de datos:', error);
      res.status(500).json({
        success: false,
        message: 'Error verificando base de datos',
        error: error.message
      });
    }
  },

  /**
   * Debug: Inicializar tablas de afiliados
   * POST /api/affiliates/init-tables
   */
  async initAffiliateTables(req, res) {
    try {
      console.log('🔧 [DEBUG] Inicializando tablas de afiliados...');
      
      const { initAffiliateTables } = require('../../../scripts/init-affiliate-tables-production');
      await initAffiliateTables();
      
      res.json({
        success: true,
        message: 'Tablas de afiliados inicializadas exitosamente'
      });
      
    } catch (error) {
      console.error('❌ [DEBUG] Error inicializando tablas:', error);
      res.status(500).json({
        success: false,
        message: 'Error inicializando tablas de afiliados',
        error: error.message
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
