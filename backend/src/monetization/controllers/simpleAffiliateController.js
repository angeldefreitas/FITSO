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
        commission_percentage: 30, // Porcentaje por defecto
        affiliate_code: affiliateCode,
        user_info: {
          name: user.name,
          email: user.email,
          member_since: user.created_at
        }
      };

      try {
        // Obtener estadísticas reales y porcentaje de comisión
            const statsQuery = `
              SELECT 
                COALESCE(COUNT(ur.id), 0) as total_referrals,
                0 as premium_referrals, -- Por ahora no tenemos tracking de premium en user_referrals
                COALESCE(SUM(CASE WHEN ac.status != 'cancelled' THEN ac.commission_amount ELSE 0 END), 0) as total_commissions,
                COALESCE(SUM(CASE WHEN (ac.status = 'pending' OR ac.status IS NULL) THEN ac.commission_amount ELSE 0 END), 0) as pending_commissions,
                COALESCE(SUM(CASE WHEN ac.status = 'paid' THEN ac.commission_amount ELSE 0 END), 0) as paid_commissions,
                ac_affiliate.commission_percentage
              FROM affiliate_codes ac_affiliate
              LEFT JOIN user_referrals ur ON ur.affiliate_code_id = ac_affiliate.id
              LEFT JOIN affiliate_commissions ac ON ac_affiliate.id = ac.affiliate_id AND ur.user_id = ac.user_id
              WHERE ac_affiliate.code = $1
              GROUP BY ac_affiliate.commission_percentage
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
          commission_percentage: parseFloat(stats.commission_percentage) || 30,
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

  /**
   * Obtener dashboard de administración con datos reales
   * GET /api/affiliates/admin-dashboard
   */
  async getAdminDashboard(req, res) {
    try {
      console.log('🔍 [ADMIN] Obteniendo dashboard de administración...');
      
      const { query } = require('../../config/database');
      
      // Obtener todos los afiliados con sus estadísticas
      const affiliatesQuery = `
        SELECT 
          u.id as user_id,
          u.name,
          u.email,
          u.created_at as member_since,
          u.is_affiliate,
          ac.code as affiliate_code,
          ac.commission_percentage,
          ac.is_active,
          ac.created_at as code_created_at,
          COUNT(ur.id) as total_referrals,
          COUNT(CASE WHEN ur.is_premium = true THEN 1 END) as premium_referrals,
          COALESCE(SUM(afc.commission_amount), 0) as total_commissions,
          COALESCE(SUM(CASE WHEN afc.is_paid = false THEN afc.commission_amount ELSE 0 END), 0) as pending_commissions,
          COALESCE(SUM(CASE WHEN afc.is_paid = true THEN afc.commission_amount ELSE 0 END), 0) as paid_commissions
        FROM users u
        LEFT JOIN affiliate_codes ac ON u.id = ac.created_by
        LEFT JOIN user_referrals ur ON ac.code = ur.affiliate_code
        LEFT JOIN affiliate_commissions afc ON ac.code = afc.affiliate_code AND ur.user_id = afc.user_id
        WHERE u.is_affiliate = true
        GROUP BY u.id, u.name, u.email, u.created_at, u.is_affiliate, ac.code, ac.commission_percentage, ac.is_active, ac.created_at
        ORDER BY u.created_at DESC
      `;
      
      const affiliatesResult = await query(affiliatesQuery);
      const affiliates = affiliatesResult.rows;
      
      console.log('📊 [ADMIN] Afiliados encontrados:', affiliates.length);
      
      // Calcular estadísticas generales
      const totalAffiliates = affiliates.length;
      const totalReferrals = affiliates.reduce((sum, aff) => sum + parseInt(aff.total_referrals), 0);
      const totalPremiumReferrals = affiliates.reduce((sum, aff) => sum + parseInt(aff.premium_referrals), 0);
      const totalCommissions = affiliates.reduce((sum, aff) => sum + parseFloat(aff.total_commissions), 0);
      const totalPendingCommissions = affiliates.reduce((sum, aff) => sum + parseFloat(aff.pending_commissions), 0);
      const totalPaidCommissions = affiliates.reduce((sum, aff) => sum + parseFloat(aff.paid_commissions), 0);
      const overallConversionRate = totalReferrals > 0 ? (totalPremiumReferrals / totalReferrals) * 100 : 0;
      
      // Formatear datos de afiliados
      const formattedAffiliates = affiliates.map(affiliate => {
        const totalRefs = parseInt(affiliate.total_referrals) || 0;
        const premiumRefs = parseInt(affiliate.premium_referrals) || 0;
        const conversionRate = totalRefs > 0 ? (premiumRefs / totalRefs) * 100 : 0;
        
        return {
          user_id: affiliate.user_id,
          name: affiliate.name,
          email: affiliate.email,
          member_since: affiliate.member_since,
          affiliate_code: affiliate.affiliate_code,
          commission_percentage: parseFloat(affiliate.commission_percentage) || 0,
          is_active: affiliate.is_active || false,
          code_created_at: affiliate.code_created_at,
          stats: {
            total_referrals: totalRefs,
            premium_referrals: premiumRefs,
            total_commissions: parseFloat(affiliate.total_commissions) || 0,
            pending_commissions: parseFloat(affiliate.pending_commissions) || 0,
            paid_commissions: parseFloat(affiliate.paid_commissions) || 0,
            conversion_rate: Math.round(conversionRate * 100) / 100
          }
        };
      });
      
      const adminDashboard = {
        summary: {
          total_affiliates: totalAffiliates,
          total_referrals: totalReferrals,
          total_premium_referrals: totalPremiumReferrals,
          total_commissions: Math.round(totalCommissions * 100) / 100,
          pending_commissions: Math.round(totalPendingCommissions * 100) / 100,
          paid_commissions: Math.round(totalPaidCommissions * 100) / 100,
          overall_conversion_rate: Math.round(overallConversionRate * 100) / 100
        },
        affiliates: formattedAffiliates
      };
      
      console.log('✅ [ADMIN] Dashboard generado:', {
        total_affiliates: totalAffiliates,
        total_referrals: totalReferrals,
        total_commissions: totalCommissions
      });
      
      res.json({
        success: true,
        data: adminDashboard
      });
      
    } catch (error) {
      console.error('❌ [ADMIN] Error obteniendo dashboard de administración:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo dashboard de administración',
        error: error.message
      });
    }
  }

  /**
   * Toggle estado del código de afiliado
   * PUT /api/affiliates/codes/:code/toggle
   */
  async toggleAffiliateCode(req, res) {
    try {
      const { code } = req.params;
      const { is_active } = req.body;

      console.log('🔄 [ADMIN] Cambiando estado del código:', code, 'a:', is_active);

      const { query } = require('../../config/database');

      // Verificar que el código existe
      const codeQuery = 'SELECT id, is_active FROM affiliate_codes WHERE code = $1';
      const codeResult = await query(codeQuery, [code]);

      if (codeResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Código de afiliado no encontrado'
        });
      }

      const currentCode = codeResult.rows[0];

      // Actualizar el estado
      const updateQuery = `
        UPDATE affiliate_codes 
        SET is_active = $1, updated_at = CURRENT_TIMESTAMP 
        WHERE code = $2
        RETURNING *
      `;

      const updateResult = await query(updateQuery, [is_active, code]);
      const updatedCode = updateResult.rows[0];

      console.log('✅ [ADMIN] Estado del código actualizado:', {
        code: code,
        old_status: currentCode.is_active,
        new_status: updatedCode.is_active
      });

      res.json({
        success: true,
        message: `Código ${is_active ? 'activado' : 'desactivado'} exitosamente`,
        data: {
          code: code,
          is_active: updatedCode.is_active,
          updated_at: updatedCode.updated_at
        }
      });

    } catch (error) {
      console.error('❌ [ADMIN] Error cambiando estado del código:', error);
      res.status(500).json({
        success: false,
        message: 'Error cambiando estado del código',
        error: error.message
      });
    }
  }

  /**
   * Actualizar porcentaje de comisión
   * PUT /api/affiliates/codes/:code/commission
   */
  async updateCommissionPercentage(req, res) {
    try {
      const { code } = req.params;
      const { commission_percentage } = req.body;

      console.log('💰 [ADMIN] Actualizando comisión para:', code, 'a:', commission_percentage + '%');

      const { query } = require('../../config/database');

      // Verificar que el código existe
      const codeQuery = 'SELECT id, commission_percentage FROM affiliate_codes WHERE code = $1';
      const codeResult = await query(codeQuery, [code]);

      if (codeResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Código de afiliado no encontrado'
        });
      }

      const currentCode = codeResult.rows[0];

      // Validar porcentaje
      if (commission_percentage < 0 || commission_percentage > 100) {
        return res.status(400).json({
          success: false,
          message: 'El porcentaje de comisión debe estar entre 0 y 100'
        });
      }

      // Actualizar el porcentaje
      const updateQuery = `
        UPDATE affiliate_codes 
        SET commission_percentage = $1, updated_at = CURRENT_TIMESTAMP 
        WHERE code = $2
        RETURNING *
      `;

      const updateResult = await query(updateQuery, [commission_percentage, code]);
      const updatedCode = updateResult.rows[0];

      console.log('✅ [ADMIN] Porcentaje de comisión actualizado:', {
        code: code,
        old_percentage: currentCode.commission_percentage,
        new_percentage: updatedCode.commission_percentage
      });

      res.json({
        success: true,
        message: `Porcentaje de comisión actualizado a ${commission_percentage}%`,
        data: {
          code: code,
          commission_percentage: updatedCode.commission_percentage,
          updated_at: updatedCode.updated_at
        }
      });

    } catch (error) {
      console.error('❌ [ADMIN] Error actualizando comisión:', error);
      res.status(500).json({
        success: false,
        message: 'Error actualizando porcentaje de comisión',
        error: error.message
      });
    }
  }

  /**
   * Tracking automático de conversión premium
   * POST /api/affiliates/track-premium-conversion
   */
  async trackPremiumConversion(req, res) {
    try {
      const { user_id, subscription_id, subscription_amount, is_conversion = true } = req.body;

      console.log('🔄 [TRACKING] Procesando conversión premium:', {
        user_id,
        subscription_id,
        subscription_amount,
        is_conversion
      });

      if (!user_id) {
        return res.status(400).json({
          success: false,
          message: 'user_id es requerido'
        });
      }

      const { query } = require('../../config/database');

      // Buscar si el usuario tiene un código de referencia
      const referralQuery = `
        SELECT ur.*, ac.code as affiliate_code, ac.created_by, ac.commission_percentage
        FROM user_referrals ur
        LEFT JOIN affiliate_codes ac ON ur.affiliate_code = ac.code
        WHERE ur.user_id = $1
      `;
      
      const referralResult = await query(referralQuery, [user_id]);
      
      if (referralResult.rows.length === 0) {
        console.log('⚠️ [TRACKING] Usuario no tiene código de referencia');
        return res.json({
          success: true,
          message: 'Usuario no tiene código de referencia',
          data: null
        });
      }

      const referral = referralResult.rows[0];
      const affiliateCode = referral.affiliate_code;
      const affiliateId = referral.created_by;
      const commissionPercentage = parseFloat(referral.commission_percentage) || 30;

      if (is_conversion) {
        // CONVERSIÓN A PREMIUM
        console.log('✅ [TRACKING] Procesando conversión a premium');

        // Actualizar el referral como premium
        const updateReferralQuery = `
          UPDATE user_referrals 
          SET is_premium = true, premium_conversion_date = CURRENT_TIMESTAMP
          WHERE user_id = $1
        `;
        await query(updateReferralQuery, [user_id]);

        // Calcular comisión
        const commissionAmount = (subscription_amount * commissionPercentage) / 100;

        // Crear comisión
        const commissionQuery = `
          INSERT INTO affiliate_commissions (
            id, affiliate_code, user_id, subscription_id, commission_amount, 
            commission_percentage, is_paid, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `;
        
        const { v4: uuidv4 } = require('uuid');
        await query(commissionQuery, [
          uuidv4(),
          affiliateCode,
          user_id,
          subscription_id || uuidv4(),
          commissionAmount,
          commissionPercentage,
          false // No pagado inicialmente
        ]);

        console.log('💰 [TRACKING] Comisión creada:', {
          affiliateCode,
          commissionAmount,
          commissionPercentage
        });

        res.json({
          success: true,
          message: 'Conversión a premium procesada exitosamente',
          data: {
            affiliate_code: affiliateCode,
            commission_amount: commissionAmount,
            commission_percentage: commissionPercentage
          }
        });

      } else {
        // CANCELACIÓN DE SUSCRIPCIÓN
        console.log('❌ [TRACKING] Procesando cancelación de suscripción');

        // Actualizar el referral como no premium
        const updateReferralQuery = `
          UPDATE user_referrals 
          SET is_premium = false, premium_conversion_date = NULL
          WHERE user_id = $1
        `;
        await query(updateReferralQuery, [user_id]);

        // Marcar comisiones relacionadas como canceladas (opcional)
        const updateCommissionsQuery = `
          UPDATE affiliate_commissions 
          SET is_cancelled = true, updated_at = CURRENT_TIMESTAMP
          WHERE user_id = $1 AND is_paid = false
        `;
        await query(updateCommissionsQuery, [user_id]);

        console.log('🔄 [TRACKING] Suscripción cancelada para usuario:', user_id);

        res.json({
          success: true,
          message: 'Cancelación de suscripción procesada exitosamente',
          data: {
            affiliate_code: affiliateCode,
            user_id: user_id
          }
        });
      }

    } catch (error) {
      console.error('❌ [TRACKING] Error procesando conversión premium:', error);
      res.status(500).json({
        success: false,
        message: 'Error procesando conversión premium',
        error: error.message
      });
    }
  }
}

module.exports = new SimpleAffiliateController();
