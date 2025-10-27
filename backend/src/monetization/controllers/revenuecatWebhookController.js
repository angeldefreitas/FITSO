const AffiliateService = require('../services/affiliateService');
const { query } = require('../../config/database');

class RevenueCatWebhookController {
  /**
   * Procesar webhook de RevenueCat
   * POST /api/webhooks/revenuecat
   */
  async handleWebhook(req, res) {
    try {
      // Validar secreto de RevenueCat para seguridad
      const webhookSecret = process.env.REVENUECAT_WEBHOOK_SECRET;
      const authHeader = req.headers['authorization'];
      
      if (webhookSecret && authHeader) {
        const expectedAuth = `Bearer ${webhookSecret}`;
        if (authHeader !== expectedAuth) {
          console.error('❌ [REVENUECAT] Authorization inválida');
          return res.status(401).json({
            success: false,
            message: 'Unauthorized'
          });
        }
      }

      const payload = req.body;
      
      console.log('📨 [REVENUECAT] Webhook recibido');
      console.log('📋 [REVENUECAT] Payload:', JSON.stringify(payload, null, 2));

      // Validar que el evento tenga la estructura correcta
      if (!payload || !payload.event) {
        console.error('❌ [REVENUECAT] Payload inválido:', payload);
        return res.status(400).json({
          success: false,
          message: 'Payload inválido'
        });
      }

      // Extraer información del evento
      const eventData = payload.event;
      const eventType = eventData.type;
      
      // Información del usuario y suscripción
      const appUserId = eventData.app_user_id;
      const productId = eventData.product_id;
      const transactionId = eventData.id;
      const price = eventData.price || eventData.price_in_purchased_currency || 0;
      const currency = eventData.currency || 'USD';

      console.log(`📨 [REVENUECAT] Tipo de evento: ${eventType}`);
      console.log(`👤 [REVENUECAT] Usuario: ${appUserId}`);
      console.log(`📦 [REVENUECAT] Producto: ${productId}`);
      console.log(`💰 [REVENUECAT] Precio: ${price} ${currency}`);

      // Procesar según el tipo de evento
      switch (eventType) {
        case 'TEST':
          console.log('✅ [REVENUECAT] Evento de prueba recibido correctamente');
          break;

        case 'INITIAL_PURCHASE':
          await this.handleInitialPurchase(appUserId, transactionId, price, productId);
          break;
        
        case 'RENEWAL':
          await this.handleRenewal(appUserId, transactionId, price, productId);
          break;
        
        case 'CANCELLATION':
          await this.handleCancellation(appUserId, transactionId);
          break;
        
        case 'EXPIRATION':
          await this.handleExpiration(appUserId, transactionId);
          break;
        
        case 'BILLING_ISSUE':
          await this.handleBillingIssue(appUserId, transactionId);
          break;
        
        case 'NON_RENEWING_PURCHASE':
          console.log('ℹ️ [REVENUECAT] Compra no renovable, no se genera comisión recurrente');
          break;
        
        default:
          console.log(`⚠️ [REVENUECAT] Evento no manejado: ${eventType}`);
      }

      // Responder siempre con 200 para que RevenueCat no reintente
      res.status(200).json({
        success: true,
        message: 'Webhook procesado'
      });

    } catch (error) {
      console.error('❌ [REVENUECAT] Error procesando webhook:', error);
      
      // Aún así responder con 200 para evitar reintentos innecesarios
      res.status(200).json({
        success: false,
        message: 'Error procesado internamente'
      });
    }
  }

  /**
   * Manejar compra inicial (primera vez que el usuario se hace premium)
   */
  async handleInitialPurchase(userId, transactionId, price, productId) {
    try {
      console.log('🎉 [REVENUECAT] Primera compra detectada');
      
      // Determinar tipo de suscripción
      const subscriptionType = productId.toLowerCase().includes('monthly') ? 'monthly' : 'yearly';
      
      // Procesar comisión de conversión
      const commission = await AffiliateService.processPremiumConversion(
        userId,
        transactionId,
        price,
        subscriptionType
      );

      if (commission) {
        console.log(`✅ [REVENUECAT] Comisión inicial generada: $${commission.commission_amount}`);
      } else {
        console.log('ℹ️ [REVENUECAT] Usuario sin código de referencia o código inválido');
      }

    } catch (error) {
      console.error('❌ [REVENUECAT] Error en handleInitialPurchase:', error);
      throw error;
    }
  }

  /**
   * Manejar renovación de suscripción
   */
  async handleRenewal(userId, transactionId, price, productId) {
    try {
      console.log('🔄 [REVENUECAT] Renovación detectada');
      
      // Determinar tipo de suscripción
      const subscriptionType = productId.toLowerCase().includes('monthly') ? 'monthly' : 'yearly';
      
      // Procesar comisión recurrente
      const commission = await AffiliateService.processSubscriptionRenewal(
        userId,
        transactionId,
        price,
        subscriptionType
      );

      if (commission) {
        console.log(`✅ [REVENUECAT] Comisión recurrente generada: $${commission.commission_amount}`);
      } else {
        console.log('ℹ️ [REVENUECAT] Usuario sin código de referencia o comisión ya existe para este período');
      }

    } catch (error) {
      console.error('❌ [REVENUECAT] Error en handleRenewal:', error);
      throw error;
    }
  }

  /**
   * Manejar cancelación de suscripción
   */
  async handleCancellation(userId, transactionId) {
    try {
      console.log('❌ [REVENUECAT] Cancelación detectada');
      
      // Aquí podrías marcar que no se deben generar más comisiones
      // O enviar notificación al afiliado
      
      console.log(`ℹ️ [REVENUECAT] Usuario ${userId} canceló suscripción`);
      console.log(`ℹ️ [REVENUECAT] No se generarán más comisiones automáticamente`);

    } catch (error) {
      console.error('❌ [REVENUECAT] Error en handleCancellation:', error);
      throw error;
    }
  }

  /**
   * Manejar expiración de suscripción
   */
  async handleExpiration(userId, transactionId) {
    try {
      console.log('⏰ [REVENUECAT] Expiración detectada');
      
      console.log(`ℹ️ [REVENUECAT] Suscripción de usuario ${userId} expiró`);
      console.log(`ℹ️ [REVENUECAT] No se generarán más comisiones hasta que renueve`);

    } catch (error) {
      console.error('❌ [REVENUECAT] Error en handleExpiration:', error);
      throw error;
    }
  }

  /**
   * Manejar problema de facturación
   */
  async handleBillingIssue(userId, transactionId) {
    try {
      console.log('⚠️ [REVENUECAT] Problema de facturación detectado');
      
      console.log(`⚠️ [REVENUECAT] Usuario ${userId} tiene problemas de pago`);
      console.log(`ℹ️ [REVENUECAT] Comisiones pausadas hasta que se resuelva`);

    } catch (error) {
      console.error('❌ [REVENUECAT] Error en handleBillingIssue:', error);
      throw error;
    }
  }

  /**
   * Endpoint de prueba para verificar que el webhook está funcionando
   * GET /api/webhooks/revenuecat/test
   */
  async testWebhook(req, res) {
    try {
      res.json({
        success: true,
        message: 'Webhook de RevenueCat funcionando correctamente',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error en webhook de RevenueCat'
      });
    }
  }
}

module.exports = new RevenueCatWebhookController();

