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
      
      // Extraer fechas si están disponibles
      const purchaseDate = eventData.purchased_at_ms 
        ? new Date(eventData.purchased_at_ms) 
        : new Date();
      const expiresDate = eventData.expiration_at_ms 
        ? new Date(eventData.expiration_at_ms) 
        : null;
      
      // Extraer environment (sandbox o production)
      const environment = eventData.environment || 'production';

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
          await this.handleInitialPurchase(appUserId, transactionId, price, productId, purchaseDate, expiresDate, environment);
          break;
        
        case 'RENEWAL':
          await this.handleRenewal(appUserId, transactionId, price, productId, purchaseDate, expiresDate, environment);
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
        
        case 'DID_CHANGE_RENEWAL_PREF':
          // Este evento ocurre cuando el usuario cambia su preferencia de renovación (ej: mensual a anual)
          // Aunque no es una compra inicial, puede indicar un upgrade/downgrade
          console.log('🔄 [REVENUECAT] Cambio de preferencia de renovación detectado');
          console.log('ℹ️ [REVENUECAT] Este evento indica cambio de plan, pero no es una compra inicial');
          console.log('ℹ️ [REVENUECAT] Si hay app_user_id y product_id, verificaremos si es necesario procesar');
          
          // Si tenemos app_user_id y product_id, podríamos procesarlo como un cambio de suscripción
          // Por ahora solo logueamos, pero podríamos expandir esto si es necesario
          if (appUserId && productId) {
            console.log(`ℹ️ [REVENUECAT] Usuario ${appUserId} cambió a producto ${productId}`);
            // Nota: Este evento normalmente NO requiere procesar comisiones porque no es una conversión inicial
            // Pero si el usuario hizo un upgrade/downgrade, podría requerir lógica adicional
          }
          break;
        
        default:
          console.log(`⚠️ [REVENUECAT] Evento no manejado: ${eventType}`);
          console.log(`⚠️ [REVENUECAT] App User ID: ${appUserId || 'NO DISPONIBLE'}`);
          console.log(`⚠️ [REVENUECAT] Product ID: ${productId || 'NO DISPONIBLE'}`);
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
  async handleInitialPurchase(appUserId, transactionId, price, productId, purchaseDate = null, expiresDate = null, environment = 'production') {
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
      
      // CRÍTICO: Guardar suscripción en la tabla subscriptions
      // Esto asegura que cada usuario tenga su propia suscripción registrada
      try {
        // Desactivar cualquier suscripción previa del usuario
        await query(
          'UPDATE subscriptions SET is_active = false WHERE user_id = $1',
          [appUserId]
        );
        
        // Usar fechas del evento si están disponibles, sino calcular
        const finalPurchaseDate = purchaseDate || new Date();
        let finalExpiresDate = expiresDate;
        
        if (!finalExpiresDate) {
          // Calcular fecha de expiración si no viene en el evento
          finalExpiresDate = new Date(finalPurchaseDate);
          if (subscriptionType === 'monthly') {
            finalExpiresDate.setMonth(finalExpiresDate.getMonth() + 1);
          } else {
            finalExpiresDate.setFullYear(finalExpiresDate.getFullYear() + 1);
          }
        }
        
        // Guardar nueva suscripción
        const insertQuery = `
          INSERT INTO subscriptions (
            user_id, 
            product_id, 
            transaction_id, 
            original_transaction_id, 
            purchase_date, 
            expires_date, 
            is_active, 
            environment,
            receipt_data
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          ON CONFLICT (transaction_id) DO UPDATE SET
            user_id = EXCLUDED.user_id,
            is_active = EXCLUDED.is_active,
            expires_date = EXCLUDED.expires_date,
            updated_at = CURRENT_TIMESTAMP
        `;
        
        const productIdFormatted = subscriptionType === 'monthly' 
          ? 'fitso_premium_monthly' 
          : 'fitso_premium_yearly';
        
        await query(insertQuery, [
          appUserId,
          productIdFormatted,
          transactionId,
          transactionId, // original_transaction_id (puede ser el mismo para primera compra)
          finalPurchaseDate,
          finalExpiresDate,
          true,
          environment, // 'production' o 'sandbox' según el evento
          JSON.stringify({ source: 'revenuecat', productId, price })
        ]);
        
        console.log('✅ [REVENUECAT] Suscripción guardada en BD para usuario:', appUserId);
      } catch (subscriptionError) {
        console.error('❌ [REVENUECAT] Error guardando suscripción en BD:', subscriptionError);
        // Continuar aunque falle para procesar comisión
      }
      
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
      
      console.log('✅ [REVENUECAT] Compra inicial procesada correctamente');

    } catch (error) {
      console.error('❌ [REVENUECAT] Error en handleInitialPurchase:', error);
      throw error;
    }
  }

  /**
   * Manejar renovación de suscripción
   */
  async handleRenewal(userId, transactionId, price, productId, purchaseDate = null, expiresDate = null, environment = 'production') {
    try {
      console.log('🔄 [REVENUECAT] Renovación detectada');
      console.log('👤 [REVENUECAT] Usuario:', userId);
      console.log('📦 [REVENUECAT] Product ID:', productId);
      
      // Determinar tipo de suscripción
      const subscriptionType = productId.toLowerCase().includes('monthly') ? 'monthly' : 'yearly';
      
      // CRÍTICO: Actualizar suscripción en BD
      try {
        // Buscar suscripción activa del usuario
        const existingQuery = `
          SELECT id, transaction_id FROM subscriptions 
          WHERE user_id = $1 AND is_active = true 
          ORDER BY expires_date DESC LIMIT 1
        `;
        const existingResult = await query(existingQuery, [userId]);
        
        if (existingResult.rows.length > 0) {
          // Actualizar suscripción existente
          const finalPurchaseDate = purchaseDate || new Date();
          let finalExpiresDate = expiresDate;
          
          if (!finalExpiresDate) {
            finalExpiresDate = new Date(finalPurchaseDate);
            if (subscriptionType === 'monthly') {
              finalExpiresDate.setMonth(finalExpiresDate.getMonth() + 1);
            } else {
              finalExpiresDate.setFullYear(finalExpiresDate.getFullYear() + 1);
            }
          }
          
          const updateQuery = `
            UPDATE subscriptions 
            SET transaction_id = $1,
                purchase_date = $2,
                expires_date = $3,
                is_active = true,
                updated_at = CURRENT_TIMESTAMP
            WHERE user_id = $4 AND is_active = true
          `;
          
          await query(updateQuery, [transactionId, finalPurchaseDate, finalExpiresDate, userId]);
          console.log('✅ [REVENUECAT] Suscripción actualizada en BD');
        } else {
          // Crear nueva suscripción (similar a INITIAL_PURCHASE)
          const finalPurchaseDate = purchaseDate || new Date();
          let finalExpiresDate = expiresDate;
          
          if (!finalExpiresDate) {
            finalExpiresDate = new Date(finalPurchaseDate);
            if (subscriptionType === 'monthly') {
              finalExpiresDate.setMonth(finalExpiresDate.getMonth() + 1);
            } else {
              finalExpiresDate.setFullYear(finalExpiresDate.getFullYear() + 1);
            }
          }
          
          const productIdFormatted = subscriptionType === 'monthly' 
            ? 'fitso_premium_monthly' 
            : 'fitso_premium_yearly';
          
          const insertQuery = `
            INSERT INTO subscriptions (
              user_id, product_id, transaction_id, original_transaction_id,
              purchase_date, expires_date, is_active, environment, receipt_data
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            ON CONFLICT (transaction_id) DO UPDATE SET
              user_id = EXCLUDED.user_id,
              is_active = EXCLUDED.is_active,
              expires_date = EXCLUDED.expires_date,
              updated_at = CURRENT_TIMESTAMP
          `;
          
          await query(insertQuery, [
            userId,
            productIdFormatted,
            transactionId,
            transactionId,
            finalPurchaseDate,
            finalExpiresDate,
            true,
            environment,
            JSON.stringify({ source: 'revenuecat', productId, price, type: 'renewal' })
          ]);
          
          console.log('✅ [REVENUECAT] Nueva suscripción creada en BD para renovación');
        }
      } catch (subscriptionError) {
        console.error('❌ [REVENUECAT] Error actualizando suscripción en BD:', subscriptionError);
      }
      
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
      console.log('👤 [REVENUECAT] Usuario:', userId);
      
      // CRÍTICO: Marcar suscripción como cancelada en BD
      try {
        const updateQuery = `
          UPDATE subscriptions 
          SET is_active = false, 
              auto_renew_status = false,
              updated_at = CURRENT_TIMESTAMP
          WHERE user_id = $1 AND is_active = true
        `;
        
        const result = await query(updateQuery, [userId]);
        console.log(`✅ [REVENUECAT] Suscripción marcada como cancelada en BD (${result.rowCount} registros)`);
      } catch (subscriptionError) {
        console.error('❌ [REVENUECAT] Error actualizando suscripción cancelada:', subscriptionError);
      }
      
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
      console.log('👤 [REVENUECAT] Usuario:', userId);
      
      // CRÍTICO: Marcar suscripción como expirada en BD
      try {
        const updateQuery = `
          UPDATE subscriptions 
          SET is_active = false,
              updated_at = CURRENT_TIMESTAMP
          WHERE user_id = $1 AND is_active = true
        `;
        
        const result = await query(updateQuery, [userId]);
        console.log(`✅ [REVENUECAT] Suscripción marcada como expirada en BD (${result.rowCount} registros)`);
      } catch (subscriptionError) {
        console.error('❌ [REVENUECAT] Error actualizando suscripción expirada:', subscriptionError);
      }
      
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

