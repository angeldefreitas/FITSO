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
      const authHeader = req.headers['authorization'] || req.headers['Authorization'];
      
      // Logging para debugging
      console.log('🔍 [REVENUECAT] Validando webhook...');
      console.log('🔑 [REVENUECAT] Webhook secret configurado:', webhookSecret ? 'Sí' : 'No');
      console.log('📨 [REVENUECAT] Authorization header recibido:', authHeader ? `${authHeader.substring(0, 20)}...` : 'No presente');
      
      if (webhookSecret && authHeader) {
        // Normalizar el header (quitar espacios extras, manejar mayúsculas/minúsculas)
        const normalizedHeader = authHeader.trim();
        const expectedAuth = `Bearer ${webhookSecret}`;
        
        // Comparar de forma flexible (sin importar mayúsculas/minúsculas en "Bearer")
        const headerParts = normalizedHeader.split(' ');
        const receivedSecret = headerParts.length > 1 ? headerParts.slice(1).join(' ') : normalizedHeader;
        
        // Comparar el secret (la parte después de "Bearer")
        if (receivedSecret.trim() !== webhookSecret.trim()) {
          console.error('❌ [REVENUECAT] Authorization inválida');
          console.error('❌ [REVENUECAT] Esperado:', `Bearer ${webhookSecret.substring(0, 10)}...`);
          console.error('❌ [REVENUECAT] Recibido:', `${authHeader.substring(0, 30)}...`);
          
          // IMPORTANTE: En desarrollo/sandbox, permitir continuar para debugging
          // En producción, debería rechazar
          const isDevelopment = process.env.NODE_ENV !== 'production';
          if (isDevelopment) {
            console.warn('⚠️ [REVENUECAT] Modo desarrollo: continuando sin validación estricta');
          } else {
            return res.status(401).json({
              success: false,
              message: 'Unauthorized'
            });
          }
        } else {
          console.log('✅ [REVENUECAT] Authorization válida');
        }
      } else if (webhookSecret && !authHeader) {
        console.warn('⚠️ [REVENUECAT] Webhook secret configurado pero no se recibió header Authorization');
        console.warn('⚠️ [REVENUECAT] Continuando sin validación (modo permisivo para testing)');
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
          console.log('ℹ️ [REVENUECAT] Los eventos TEST son de RevenueCat para verificar que el webhook funciona');
          console.log('ℹ️ [REVENUECAT] Este NO es un evento de compra real - no se procesará');
          break;

        case 'INITIAL_PURCHASE':
          console.log('🎉 [REVENUECAT] Compra inicial detectada - procesando...');
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
  async handleInitialPurchase(appUserId, transactionId, price, productId) {
    try {
      console.log('🎉 [REVENUECAT] Primera compra detectada');
      console.log('👤 [REVENUECAT] App User ID:', appUserId);
      console.log('📦 [REVENUECAT] Product ID:', productId);
      console.log('💰 [REVENUECAT] Price:', price);
      
      // IMPORTANTE: El appUserId que viene de RevenueCat es el ID del usuario en nuestra BD
      // Buscar el usuario por su ID (que debería coincidir con el app_user_id configurado)
      const userQuery = 'SELECT id, email, name FROM users WHERE id = $1';
      const userResult = await query(userQuery, [appUserId]);
      
      if (userResult.rows.length === 0) {
        console.error('❌ [REVENUECAT] Usuario no encontrado en BD con App User ID:', appUserId);
        console.log('ℹ️ [REVENUECAT] Esto puede ocurrir si el App User ID no coincide con el ID del usuario en la BD');
        console.log('ℹ️ [REVENUECAT] El webhook se procesará pero no se actualizará el usuario');
        return;
      }
      
      const user = userResult.rows[0];
      console.log('✅ [REVENUECAT] Usuario encontrado:', user.email, user.name);
      
      // Determinar tipo de suscripción
      const subscriptionType = productId.toLowerCase().includes('monthly') ? 'monthly' : 'yearly';
      
      // Procesar comisión de conversión
      const commission = await AffiliateService.processPremiumConversion(
        appUserId,
        transactionId,
        price,
        subscriptionType
      );

      if (commission) {
        console.log(`✅ [REVENUECAT] Comisión inicial generada: $${commission.commission_amount}`);
      } else {
        console.log('ℹ️ [REVENUECAT] Usuario sin código de referencia o código inválido');
      }
      
      // El estado premium se maneja automáticamente por:
      // 1. RevenueCat SDK en la app (actualiza el estado local)
      // 2. La tabla subscriptions (si existe una suscripción activa, el usuario es premium)
      // 3. is_affiliate o is_admin en users (otorgan premium automático)
      
      console.log('✅ [REVENUECAT] Compra inicial procesada correctamente');
      console.log('ℹ️ [REVENUECAT] El estado premium se actualizará automáticamente en la app cuando verifique con RevenueCat');

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

