const { query } = require('../../config/database');
const UserReferral = require('../models/UserReferral');
const AffiliateCommission = require('../models/AffiliateCommission');
const AffiliateCode = require('../models/AffiliateCode');

class AffiliateService {
  /**
   * Procesar comisión cuando un usuario se convierte a premium
   * @param {string} userId - ID del usuario que se convirtió a premium
   * @param {string} subscriptionId - ID de la suscripción
   * @param {number} subscriptionAmount - Monto de la suscripción
   * @param {string} subscriptionType - Tipo de suscripción (monthly/yearly)
   */
  static async processPremiumConversion(userId, subscriptionId, subscriptionAmount, subscriptionType) {
    try {
      console.log(`🔄 Procesando conversión premium para usuario: ${userId}`);

      // Buscar si el usuario tiene una referencia
      const referral = await UserReferral.findByUserId(userId);
      if (!referral) {
        console.log(`ℹ️ Usuario ${userId} no tiene código de referencia`);
        return null;
      }

      // Marcar el usuario como premium en la referencia
      await referral.markAsPremium();

      // Obtener información del código de afiliado
      const affiliateCode = await AffiliateCode.findByCode(referral.affiliate_code);
      if (!affiliateCode) {
        console.log(`❌ Código de afiliado ${referral.affiliate_code} no encontrado`);
        return null;
      }

      // Calcular fechas de período de pago
      const now = new Date();
      const paymentPeriodStart = new Date(now.getFullYear(), now.getMonth(), 1); // Primer día del mes
      const paymentPeriodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Último día del mes

      // Crear comisión
      const commission = await AffiliateCommission.create({
        affiliate_code: referral.affiliate_code,
        user_id: userId,
        subscription_id: subscriptionId,
        subscription_amount: subscriptionAmount,
        commission_percentage: affiliateCode.commission_percentage,
        payment_period_start: paymentPeriodStart,
        payment_period_end: paymentPeriodEnd
      });

      console.log(`✅ Comisión creada para afiliado ${referral.affiliate_code}: $${commission.commission_amount}`);

      return commission;

    } catch (error) {
      console.error('❌ Error procesando conversión premium:', error.message);
      throw error;
    }
  }

  /**
   * Procesar renovación de suscripción (comisión recurrente)
   * @param {string} userId - ID del usuario
   * @param {string} subscriptionId - ID de la suscripción renovada
   * @param {number} subscriptionAmount - Monto de la suscripción
   * @param {string} subscriptionType - Tipo de suscripción
   */
  static async processSubscriptionRenewal(userId, subscriptionId, subscriptionAmount, subscriptionType) {
    try {
      console.log(`🔄 Procesando renovación de suscripción para usuario: ${userId}`);

      // Buscar si el usuario tiene una referencia
      const referral = await UserReferral.findByUserId(userId);
      if (!referral) {
        console.log(`ℹ️ Usuario ${userId} no tiene código de referencia`);
        return null;
      }

      // Obtener información del código de afiliado
      const affiliateCode = await AffiliateCode.findByCode(referral.affiliate_code);
      if (!affiliateCode) {
        console.log(`❌ Código de afiliado ${referral.affiliate_code} no encontrado`);
        return null;
      }

      // Calcular fechas de período de pago
      const now = new Date();
      const paymentPeriodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const paymentPeriodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      // Verificar si ya existe una comisión para este período
      const existingCommission = await query(`
        SELECT id FROM affiliate_commissions 
        WHERE user_id = $1 
        AND affiliate_code = $2 
        AND payment_period_start = $3 
        AND payment_period_end = $4
      `, [userId, referral.affiliate_code, paymentPeriodStart, paymentPeriodEnd]);

      if (existingCommission.rows.length > 0) {
        console.log(`ℹ️ Comisión ya existe para este período: ${userId}`);
        return null;
      }

      // Crear comisión recurrente
      const commission = await AffiliateCommission.create({
        affiliate_code: referral.affiliate_code,
        user_id: userId,
        subscription_id: subscriptionId,
        subscription_amount: subscriptionAmount,
        commission_percentage: affiliateCode.commission_percentage,
        payment_period_start: paymentPeriodStart,
        payment_period_end: paymentPeriodEnd
      });

      console.log(`✅ Comisión recurrente creada para afiliado ${referral.affiliate_code}: $${commission.commission_amount}`);

      return commission;

    } catch (error) {
      console.error('❌ Error procesando renovación de suscripción:', error.message);
      throw error;
    }
  }

  /**
   * Obtener estadísticas generales del sistema de afiliados
   */
  static async getSystemStats() {
    try {
      const statsQuery = `
        SELECT 
          COUNT(DISTINCT ac.id) as total_affiliates,
          COUNT(DISTINCT ur.id) as total_referrals,
          COUNT(DISTINCT CASE WHEN ur.is_premium = true THEN ur.id END) as premium_conversions,
          COALESCE(SUM(afc.commission_amount), 0) as total_commissions_generated,
          COALESCE(SUM(CASE WHEN afc.is_paid = true THEN afc.commission_amount ELSE 0 END), 0) as total_commissions_paid,
          COALESCE(SUM(CASE WHEN afc.is_paid = false THEN afc.commission_amount ELSE 0 END), 0) as total_commissions_pending,
          ROUND(
            (COUNT(CASE WHEN ur.is_premium = true THEN 1 END) * 100.0) / COUNT(ur.id), 2
          ) as overall_conversion_rate
        FROM affiliate_codes ac
        LEFT JOIN user_referrals ur ON ac.code = ur.affiliate_code
        LEFT JOIN affiliate_commissions afc ON ac.code = afc.affiliate_code
        WHERE ac.is_active = true
      `;

      const result = await query(statsQuery);
      return result.rows[0];

    } catch (error) {
      console.error('❌ Error obteniendo estadísticas del sistema:', error.message);
      throw error;
    }
  }

  /**
   * Obtener top afiliados por comisiones generadas
   * @param {number} limit - Número de afiliados a retornar
   */
  static async getTopAffiliates(limit = 10) {
    try {
      const topAffiliatesQuery = `
        SELECT 
          ac.code,
          ac.affiliate_name,
          ac.commission_percentage,
          COUNT(ur.id) as total_referrals,
          COUNT(CASE WHEN ur.is_premium = true THEN 1 END) as premium_referrals,
          COALESCE(SUM(afc.commission_amount), 0) as total_commissions,
          ROUND(
            (COUNT(CASE WHEN ur.is_premium = true THEN 1 END) * 100.0) / NULLIF(COUNT(ur.id), 0), 2
          ) as conversion_rate
        FROM affiliate_codes ac
        LEFT JOIN user_referrals ur ON ac.code = ur.affiliate_code
        LEFT JOIN affiliate_commissions afc ON ac.code = afc.affiliate_code
        WHERE ac.is_active = true
        GROUP BY ac.id, ac.code, ac.affiliate_name, ac.commission_percentage
        ORDER BY total_commissions DESC
        LIMIT $1
      `;

      const result = await query(topAffiliatesQuery, [limit]);
      return result.rows;

    } catch (error) {
      console.error('❌ Error obteniendo top afiliados:', error.message);
      throw error;
    }
  }

  /**
   * Validar si un código de referencia es válido
   * @param {string} referralCode - Código a validar
   */
  static async validateReferralCode(referralCode) {
    try {
      const affiliateCode = await AffiliateCode.findByCode(referralCode.toUpperCase());
      return affiliateCode !== null;
    } catch (error) {
      console.error('❌ Error validando código de referencia:', error.message);
      return false;
    }
  }

  /**
   * Obtener información de un código de referencia
   * @param {string} referralCode - Código a consultar
   */
  static async getReferralCodeInfo(referralCode) {
    try {
      const affiliateCode = await AffiliateCode.findByCode(referralCode.toUpperCase());
      
      if (!affiliateCode) {
        return null;
      }

      return {
        code: affiliateCode.code,
        affiliate_name: affiliateCode.affiliate_name,
        commission_percentage: affiliateCode.commission_percentage,
        is_active: affiliateCode.is_active
      };
    } catch (error) {
      console.error('❌ Error obteniendo información del código:', error.message);
      throw error;
    }
  }
}

module.exports = AffiliateService;
