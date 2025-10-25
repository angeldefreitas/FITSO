const { query } = require('../../config/database');
const { appleReceiptService } = require('../services/payment');
const AffiliateService = require('../services/affiliateService');

class SubscriptionController {
  /**
   * Verifica un recibo de compra y actualiza el estado de suscripción
   * POST /api/subscriptions/verify-receipt
   */
  async verifyReceipt(req, res) {
    try {
      const { userId, receiptData } = req.body;

      if (!userId || !receiptData) {
        return res.status(400).json({
          success: false,
          message: 'userId y receiptData son requeridos'
        });
      }

      console.log('🔄 Verificando recibo para usuario:', userId);

      // Validar recibo con Apple
      const subscriptionInfo = await appleReceiptService.validateReceipt(receiptData);

      // Verificar si el usuario ya tiene una suscripción activa
      const existingSubscription = await this.getActiveSubscription(userId);

      if (existingSubscription) {
        // Actualizar suscripción existente
        await this.updateSubscription(userId, subscriptionInfo);
        console.log('✅ Suscripción actualizada para usuario:', userId);
      } else {
        // Crear nueva suscripción
        await this.createSubscription(userId, subscriptionInfo);
        console.log('✅ Nueva suscripción creada para usuario:', userId);
      }

      // Procesar comisión de afiliado si aplica
      try {
        const subscriptionAmount = this.calculateSubscriptionAmount(subscriptionInfo.productId);
        const subscriptionType = subscriptionInfo.productId.includes('monthly') ? 'monthly' : 'yearly';
        
        if (existingSubscription) {
          // Es una renovación - procesar comisión recurrente
          await AffiliateService.processSubscriptionRenewal(
            userId, 
            subscriptionInfo.transactionId, 
            subscriptionAmount, 
            subscriptionType
          );
        } else {
          // Es una nueva suscripción - procesar conversión
          await AffiliateService.processPremiumConversion(
            userId, 
            subscriptionInfo.transactionId, 
            subscriptionAmount, 
            subscriptionType
          );
        }
      } catch (affiliateError) {
        console.error('❌ Error procesando comisión de afiliado:', affiliateError.message);
        // No fallar la verificación de suscripción por error de afiliados
      }

      // Obtener estado actual de la suscripción
      const currentStatus = await this.getSubscriptionStatus(userId);

      res.json({
        success: true,
        message: 'Recibo verificado exitosamente',
        subscription: currentStatus
      });

    } catch (error) {
      console.error('❌ Error verificando recibo:', error.message);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Obtiene el estado de suscripción de un usuario
   * GET /api/subscriptions/status
   */
  async getSubscriptionStatus(req, res) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'userId es requerido'
        });
      }

      const status = await this.getSubscriptionStatus(userId);

      res.json({
        success: true,
        subscription: status
      });

    } catch (error) {
      console.error('❌ Error obteniendo estado de suscripción:', error.message);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo estado de suscripción'
      });
    }
  }

  /**
   * Obtiene el estado de suscripción de un usuario (método interno)
   * @param {string} userId - ID del usuario
   * @returns {Object} - Estado de la suscripción
   */
  async getSubscriptionStatus(userId) {
    try {
      // Verificar si el usuario es afiliado o administrador
      const { query } = require('../../config/database');
      const userQuery = 'SELECT is_affiliate, is_admin FROM users WHERE id = $1';
      const userResult = await query(userQuery, [userId]);
      
      if (userResult.rows.length > 0) {
        const user = userResult.rows[0];
        
        // Si es afiliado o administrador, otorgar premium automáticamente
        if (user.is_affiliate || user.is_admin) {
          console.log('👑 [PREMIUM] Usuario afiliado/admin detectado, otorgando premium automático');
          return {
            isPremium: true,
            subscriptionType: 'lifetime',
            expiresAt: null, // Lifetime = sin expiración
            isTrialPeriod: false,
            autoRenewStatus: false,
            purchaseDate: new Date().toISOString(),
            environment: 'lifetime',
            reason: user.is_admin ? 'admin' : 'affiliate'
          };
        }
      }

      // Si no es afiliado/admin, verificar suscripción normal
      const subscription = await this.getActiveSubscription(userId);

      if (!subscription) {
        return {
          isPremium: false,
          subscriptionType: null,
          expiresAt: null,
          isTrialPeriod: false,
          autoRenewStatus: false
        };
      }

      const now = new Date();
      const isActive = subscription.expires_date > now;

      return {
        isPremium: isActive,
        subscriptionType: subscription.product_id === 'fitso_premium_monthly' ? 'monthly' : 'yearly',
        expiresAt: subscription.expires_date.toISOString(),
        isTrialPeriod: subscription.is_trial_period,
        autoRenewStatus: subscription.auto_renew_status,
        purchaseDate: subscription.purchase_date.toISOString(),
        environment: subscription.environment
      };

    } catch (error) {
      console.error('❌ Error obteniendo estado de suscripción:', error.message);
      throw error;
    }
  }

  /**
   * Verificar estado premium de usuario (endpoint público)
   * GET /api/subscriptions/check-premium/:userId
   */
  async checkUserPremium(req, res) {
    try {
      const { userId } = req.params;
      
      console.log('🔍 [PREMIUM] Verificando estado premium para usuario:', userId);
      
      const status = await this.getSubscriptionStatus(userId);
      
      res.json({
        success: true,
        data: status
      });
      
    } catch (error) {
      console.error('❌ [PREMIUM] Error verificando estado premium:', error);
      res.status(500).json({
        success: false,
        message: 'Error verificando estado premium',
        error: error.message
      });
    }
  }

  /**
   * Obtiene la suscripción activa de un usuario
   * @param {string} userId - ID del usuario
   * @returns {Object|null} - Suscripción activa o null
   */
  async getActiveSubscription(userId) {
    try {
      const queryText = `
        SELECT * FROM subscriptions 
        WHERE user_id = $1 
        AND is_active = true 
        ORDER BY expires_date DESC 
        LIMIT 1
      `;

      const result = await query(queryText, [userId]);
      return result.rows[0] || null;

    } catch (error) {
      console.error('❌ Error obteniendo suscripción activa:', error.message);
      throw error;
    }
  }

  /**
   * Crea una nueva suscripción
   * @param {string} userId - ID del usuario
   * @param {Object} subscriptionInfo - Información de la suscripción
   */
  async createSubscription(userId, subscriptionInfo) {
    try {
      const queryText = `
        INSERT INTO subscriptions (
          user_id, 
          product_id, 
          transaction_id, 
          original_transaction_id, 
          purchase_date, 
          expires_date, 
          is_active, 
          is_trial_period, 
          is_in_intro_offer_period, 
          auto_renew_status, 
          environment, 
          receipt_data
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      `;

      const values = [
        userId,
        subscriptionInfo.productId,
        subscriptionInfo.transactionId,
        subscriptionInfo.originalTransactionId,
        subscriptionInfo.purchaseDate,
        subscriptionInfo.expiresDate,
        subscriptionInfo.isActive,
        subscriptionInfo.isTrialPeriod,
        subscriptionInfo.isInIntroOfferPeriod,
        subscriptionInfo.autoRenewStatus,
        subscriptionInfo.environment,
        subscriptionInfo.receiptData
      ];

      await query(queryText, values);
      console.log('✅ Suscripción creada para usuario:', userId);

    } catch (error) {
      console.error('❌ Error creando suscripción:', error.message);
      throw error;
    }
  }

  /**
   * Actualiza una suscripción existente
   * @param {string} userId - ID del usuario
   * @param {Object} subscriptionInfo - Información de la suscripción
   */
  async updateSubscription(userId, subscriptionInfo) {
    try {
      // Primero desactivar suscripciones anteriores
      await query(
        'UPDATE subscriptions SET is_active = false WHERE user_id = $1',
        [userId]
      );

      // Crear nueva suscripción
      await this.createSubscription(userId, subscriptionInfo);
      console.log('✅ Suscripción actualizada para usuario:', userId);

    } catch (error) {
      console.error('❌ Error actualizando suscripción:', error.message);
      throw error;
    }
  }

  /**
   * Calcula el monto de suscripción basado en el product ID
   * @param {string} productId - ID del producto de suscripción
   * @returns {number} - Monto de la suscripción
   */
  calculateSubscriptionAmount(productId) {
    // Estos valores deben coincidir con los precios configurados en Apple Store
    const prices = {
      'fitso_premium_monthly': 9.99,  // Ajustar según tu precio real
      'fitso_premium_yearly': 99.99   // Ajustar según tu precio real
    };

    return prices[productId] || 0;
  }

  /**
   * Cancela una suscripción (marca como inactiva)
   * POST /api/subscriptions/cancel
   */
  async cancelSubscription(req, res) {
    try {
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'userId es requerido'
        });
      }

      await query(
        'UPDATE subscriptions SET is_active = false WHERE user_id = $1',
        [userId]
      );

      console.log('✅ Suscripción cancelada para usuario:', userId);

      res.json({
        success: true,
        message: 'Suscripción cancelada exitosamente'
      });

    } catch (error) {
      console.error('❌ Error cancelando suscripción:', error.message);
      res.status(500).json({
        success: false,
        message: 'Error cancelando suscripción'
      });
    }
  }

  /**
   * Obtiene el historial de suscripciones de un usuario
   * GET /api/subscriptions/history
   */
  async getSubscriptionHistory(req, res) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'userId es requerido'
        });
      }

      const queryText = `
        SELECT 
          product_id,
          transaction_id,
          purchase_date,
          expires_date,
          is_active,
          is_trial_period,
          auto_renew_status,
          environment,
          created_at
        FROM subscriptions 
        WHERE user_id = $1 
        ORDER BY created_at DESC
      `;

      const result = await query(queryText, [userId]);

      res.json({
        success: true,
        subscriptions: result.rows
      });

    } catch (error) {
      console.error('❌ Error obteniendo historial de suscripciones:', error.message);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo historial de suscripciones'
      });
    }
  }
}

module.exports = new SubscriptionController();
