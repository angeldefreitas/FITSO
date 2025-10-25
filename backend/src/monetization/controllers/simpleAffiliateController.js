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

      // Obtener estadísticas reales de la base de datos
      const { query } = require('../../config/database');
      
      let dashboardStats = {
        total_referrals: 0,
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

      try {
        // Obtener estadísticas reales
        const statsQuery = `
          SELECT 
            COUNT(ur.id) as total_referrals,
            COUNT(CASE WHEN ur.is_premium = true THEN 1 END) as premium_referrals,
            COALESCE(SUM(ac.commission_amount), 0) as total_commissions,
            COALESCE(SUM(CASE WHEN ac.is_paid = false THEN ac.commission_amount ELSE 0 END), 0) as pending_commissions,
            COALESCE(SUM(CASE WHEN ac.is_paid = true THEN ac.commission_amount ELSE 0 END), 0) as paid_commissions
          FROM user_referrals ur
          LEFT JOIN affiliate_commissions ac ON ur.affiliate_code = ac.affiliate_code AND ur.user_id = ac.user_id
          WHERE ur.affiliate_code = $1
        `;
        
        const statsResult = await query(statsQuery, [affiliateCode]);
        const stats = statsResult.rows[0];
        
        const totalReferrals = parseInt(stats.total_referrals) || 0;
        const premiumReferrals = parseInt(stats.premium_referrals) || 0;
        const conversionRate = totalReferrals > 0 ? (premiumReferrals / totalReferrals) * 100 : 0;

        dashboardStats = {
          total_referrals: totalReferrals,
          premium_referrals: premiumReferrals,
          total_commissions: parseFloat(stats.total_commissions) || 0,
          pending_commissions: parseFloat(stats.pending_commissions) || 0,
          paid_commissions: parseFloat(stats.paid_commissions) || 0,
          conversion_rate: Math.round(conversionRate * 100) / 100,
          affiliate_code: affiliateCode,
          user_info: {
            name: user.name,
            email: user.email,
            member_since: user.created_at
          }
        };
        
        console.log('📊 [SIMPLE AFFILIATE] Estadísticas reales obtenidas:', dashboardStats);
      } catch (statsError) {
        console.log('⚠️ [SIMPLE AFFILIATE] Error obteniendo estadísticas reales:', statsError.message);
        console.log('📊 [SIMPLE AFFILIATE] Usando estadísticas por defecto');
      }

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
   * Obtener estadísticas de un código de afiliado específico (PÚBLICO para validación)
   * GET /api/affiliates/stats/:code
   */
  async getAffiliateStats(req, res) {
    try {
      const { code } = req.params;
      
      console.log('🔍 [SIMPLE AFFILIATE] Buscando estadísticas para código:', code);
      
      // Buscar el código de afiliado
      const affiliateCode = await AffiliateCode.findByCode(code);
      console.log('🔍 [SIMPLE AFFILIATE] Resultado de búsqueda:', affiliateCode ? 'Encontrado' : 'No encontrado');
      console.log('🔍 [SIMPLE AFFILIATE] Código encontrado:', affiliateCode);
      
      if (!affiliateCode) {
        return res.status(404).json({
          success: false,
          message: 'Código de afiliado no encontrado'
        });
      }

      // Obtener información del afiliado
      console.log('🔍 [SIMPLE AFFILIATE] Buscando usuario con ID:', affiliateCode.created_by);
      console.log('🔍 [SIMPLE AFFILIATE] Tipo de created_by:', typeof affiliateCode.created_by);
      const affiliate = await User.findById(affiliateCode.created_by);
      console.log('🔍 [SIMPLE AFFILIATE] Usuario encontrado:', affiliate ? 'Sí' : 'No');
      console.log('🔍 [SIMPLE AFFILIATE] Usuario data:', affiliate);
      
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
  }

  /**
   * Debug: Inicializar tablas de afiliados
   * POST /api/affiliates/init-tables
   */
  async initAffiliateTables(req, res) {
    try {
      console.log('🔧 [DEBUG] Inicializando tablas de afiliados...');
      
      // Crear tablas directamente sin importar script externo
      const { query } = require('../../config/database');
      
      // 1. Crear tabla affiliate_codes
      console.log('📝 Creando tabla affiliate_codes...');
      await query(`
        CREATE TABLE IF NOT EXISTS affiliate_codes (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          code VARCHAR(50) UNIQUE NOT NULL,
          affiliate_name VARCHAR(255) NOT NULL,
          email VARCHAR(255),
          commission_percentage DECIMAL(5,2) NOT NULL DEFAULT 30.00,
          is_active BOOLEAN DEFAULT TRUE,
          created_by UUID REFERENCES users(id) ON DELETE SET NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // 2. Crear tabla user_referrals
      console.log('📝 Creando tabla user_referrals...');
      await query(`
        CREATE TABLE IF NOT EXISTS user_referrals (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          affiliate_code VARCHAR(50) REFERENCES affiliate_codes(code) ON DELETE SET NULL,
          referral_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          is_premium BOOLEAN DEFAULT FALSE,
          premium_conversion_date TIMESTAMP,
          UNIQUE(user_id)
        )
      `);
      
      // 3. Crear tabla affiliate_commissions (sin referencia a subscriptions por ahora)
      console.log('📝 Creando tabla affiliate_commissions...');
      await query(`
        CREATE TABLE IF NOT EXISTS affiliate_commissions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          affiliate_code VARCHAR(50) REFERENCES affiliate_codes(code) ON DELETE CASCADE,
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          subscription_id UUID, -- Sin referencia por ahora
          commission_amount DECIMAL(10,2) NOT NULL,
          commission_percentage DECIMAL(5,2) NOT NULL,
          subscription_amount DECIMAL(10,2) NOT NULL,
          payment_period_start DATE NOT NULL,
          payment_period_end DATE NOT NULL,
          is_paid BOOLEAN DEFAULT FALSE,
          paid_date TIMESTAMP,
          payment_method VARCHAR(50),
          payment_reference VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // 4. Crear tabla affiliate_payments
      console.log('📝 Creando tabla affiliate_payments...');
      await query(`
        CREATE TABLE IF NOT EXISTS affiliate_payments (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          affiliate_code VARCHAR(50) REFERENCES affiliate_codes(code) ON DELETE CASCADE,
          total_amount DECIMAL(10,2) NOT NULL,
          commission_count INTEGER NOT NULL,
          payment_method VARCHAR(50) NOT NULL,
          payment_reference VARCHAR(255),
          payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // 5. Crear índices
      console.log('📝 Creando índices...');
      await query(`
        CREATE INDEX IF NOT EXISTS idx_affiliate_codes_code ON affiliate_codes(code);
        CREATE INDEX IF NOT EXISTS idx_affiliate_codes_active ON affiliate_codes(is_active);
        CREATE INDEX IF NOT EXISTS idx_user_referrals_user_id ON user_referrals(user_id);
        CREATE INDEX IF NOT EXISTS idx_user_referrals_affiliate_code ON user_referrals(affiliate_code);
        CREATE INDEX IF NOT EXISTS idx_affiliate_commissions_affiliate_code ON affiliate_commissions(affiliate_code);
        CREATE INDEX IF NOT EXISTS idx_affiliate_commissions_user_id ON affiliate_commissions(user_id);
        CREATE INDEX IF NOT EXISTS idx_affiliate_commissions_is_paid ON affiliate_commissions(is_paid);
        CREATE INDEX IF NOT EXISTS idx_affiliate_payments_affiliate_code ON affiliate_payments(affiliate_code);
      `);
      
      console.log('✅ Tablas de afiliados creadas exitosamente');
      
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
  }

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

  /**
   * Debug: Probar validación de código específico
   * GET /api/affiliates/debug-code/:code
   */
  async debugCode(req, res) {
    try {
      const { code } = req.params;
      console.log('🔍 [DEBUG] Probando código:', code);
      
      // Buscar el código directamente
      const { query } = require('../../config/database');
      const result = await query('SELECT * FROM affiliate_codes WHERE code = $1 AND is_active = true', [code]);
      
      console.log('🔍 [DEBUG] Resultado directo:', result.rows);
      
      if (result.rows.length === 0) {
        return res.json({
          success: false,
          message: 'Código no encontrado en base de datos',
          code: code,
          query: 'SELECT * FROM affiliate_codes WHERE code = $1 AND is_active = true'
        });
      }
      
      const affiliateCode = result.rows[0];
      console.log('🔍 [DEBUG] Código encontrado:', affiliateCode);
      
      // Buscar el usuario
      const userResult = await query('SELECT * FROM users WHERE id = $1', [affiliateCode.created_by]);
      console.log('🔍 [DEBUG] Usuario encontrado:', userResult.rows);
      
      res.json({
        success: true,
        data: {
          code: affiliateCode,
          user: userResult.rows[0] || null,
          message: 'Debug completado'
        }
      });
      
    } catch (error) {
      console.error('❌ [DEBUG] Error en debug de código:', error);
      res.status(500).json({
        success: false,
        message: 'Error en debug de código',
        error: error.message
      });
    }
  }

  /**
   * Debug: Arreglar códigos con affiliate_id en lugar de created_by
   * POST /api/affiliates/fix-codes
   */
  async fixCodes(req, res) {
    try {
      console.log('🔧 [DEBUG] Arreglando códigos con affiliate_id...');
      
      const { query } = require('../../config/database');
      
      // Buscar códigos que tienen affiliate_id pero no created_by
      const result = await query(`
        SELECT * FROM affiliate_codes 
        WHERE affiliate_id IS NOT NULL 
        AND (created_by IS NULL OR created_by = '')
      `);
      
      console.log('🔍 [DEBUG] Códigos encontrados para arreglar:', result.rows.length);
      
      let fixed = 0;
      for (const code of result.rows) {
        console.log('🔧 [DEBUG] Arreglando código:', code.code, 'affiliate_id:', code.affiliate_id);
        
        // Actualizar created_by con el valor de affiliate_id
        await query(`
          UPDATE affiliate_codes 
          SET created_by = $1 
          WHERE id = $2
        `, [code.affiliate_id, code.id]);
        
        fixed++;
      }
      
      res.json({
        success: true,
        message: `Se arreglaron ${fixed} códigos`,
        fixed: fixed
      });
      
    } catch (error) {
      console.error('❌ [DEBUG] Error arreglando códigos:', error);
      res.status(500).json({
        success: false,
        message: 'Error arreglando códigos',
        error: error.message
      });
    }
  }

  /**
   * Actualizar referido a premium
   * POST /api/affiliates/update-premium-status
   */
  async updatePremiumStatus(req, res) {
    try {
      const { user_id, is_premium } = req.body;
      
      console.log('🔄 [AFFILIATE] Actualizando estado premium para usuario:', user_id, 'is_premium:', is_premium);
      
      const { query } = require('../../config/database');
      
      // Actualizar el referido
      const updateResult = await query(`
        UPDATE user_referrals 
        SET is_premium = $1, premium_conversion_date = $2
        WHERE user_id = $3
        RETURNING *
      `, [is_premium, is_premium ? new Date() : null, user_id]);
      
      if (updateResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Referido no encontrado'
        });
      }
      
      const referral = updateResult.rows[0];
      console.log('✅ [AFFILIATE] Referido actualizado:', referral);
      
      // Si se convirtió a premium, crear comisión
      if (is_premium) {
        console.log('💰 [AFFILIATE] Creando comisión para conversión premium...');
        
        // Obtener el código de afiliado
        const affiliateCode = await query(`
          SELECT * FROM affiliate_codes 
          WHERE code = $1
        `, [referral.affiliate_code]);
        
        if (affiliateCode.rows.length > 0) {
          const code = affiliateCode.rows[0];
          const commissionPercentage = parseFloat(code.commission_percentage);
          const subscriptionAmount = 9.99; // Precio de suscripción mensual
          const commissionAmount = (subscriptionAmount * commissionPercentage) / 100;
          
          // Crear comisión
          await query(`
            INSERT INTO affiliate_commissions (
              affiliate_code, user_id, commission_amount, 
              commission_percentage, subscription_amount,
              payment_period_start, payment_period_end
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
          `, [
            referral.affiliate_code,
            user_id,
            commissionAmount,
            commissionPercentage,
            subscriptionAmount,
            new Date(), // Inicio del período
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 días después
          ]);
          
          console.log('💰 [AFFILIATE] Comisión creada:', {
            affiliate_code: referral.affiliate_code,
            user_id,
            commission_amount: commissionAmount,
            commission_percentage: commissionPercentage
          });
        }
      }
      
      res.json({
        success: true,
        message: 'Estado premium actualizado exitosamente',
        data: referral
      });
      
    } catch (error) {
      console.error('❌ [AFFILIATE] Error actualizando estado premium:', error);
      res.status(500).json({
        success: false,
        message: 'Error actualizando estado premium',
        error: error.message
      });
    }
  }

  /**
   * Simular conversión a premium (para testing)
   * POST /api/affiliates/simulate-premium-conversion
   */
  async simulatePremiumConversion(req, res) {
    try {
      const { user_id } = req.body;
      
      console.log('🧪 [AFFILIATE] Simulando conversión premium para usuario:', user_id);
      
      // Llamar al método de actualización
      const result = await this.updatePremiumStatus({
        body: { user_id, is_premium: true }
      }, res);
      
      console.log('✅ [AFFILIATE] Conversión simulada exitosamente');
      
    } catch (error) {
      console.error('❌ [AFFILIATE] Error simulando conversión:', error);
      res.status(500).json({
        success: false,
        message: 'Error simulando conversión premium',
        error: error.message
      });
    }
  }
}

module.exports = new SimpleAffiliateController();
