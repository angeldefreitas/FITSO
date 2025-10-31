const axios = require('axios');

class AppleReceiptService {
  constructor() {
    // URLs de Apple para validación de recibos
    this.productionUrl = 'https://buy.itunes.apple.com/verifyReceipt';
    this.sandboxUrl = 'https://sandbox.itunes.apple.com/verifyReceipt';
    
    // Password compartido de App Store Connect (debe configurarse en variables de entorno)
    // IMPORTANTE: Sin este secret, la validación de recibos fallará
    // Obtenerlo desde: App Store Connect > Tu App > App Information > Shared Secret
    this.sharedSecret = process.env.APPLE_SHARED_SECRET;
    
    if (!this.sharedSecret) {
      console.error('❌ [APPLE] APPLE_SHARED_SECRET no configurado en variables de entorno');
      console.error('❌ [APPLE] Las validaciones de recibos fallarán sin este secret');
      console.error('📝 [APPLE] Obtén el secret desde: App Store Connect > Tu App > App Information > Shared Secret');
    }
  }

  /**
   * Valida un recibo de Apple Store
   * Sigue la recomendación de Apple: siempre validar primero contra producción,
   * y solo si falla con error 21007 ("Sandbox receipt used in production"),
   * validar contra sandbox.
   * 
   * @param {string} receiptData - Datos del recibo en base64
   * @param {boolean} isSandbox - Si es sandbox o producción (solo para reintentos internos)
   * @returns {Promise<Object>} - Resultado de la validación
   */
  async validateReceipt(receiptData, isSandbox = false) {
    try {
      // Validar que el shared secret esté configurado
      if (!this.sharedSecret) {
        const errorMsg = 'APPLE_SHARED_SECRET no está configurado. Obtén el secret desde: App Store Connect > Tu App > App Information > Shared Secret';
        console.error(`❌ [VALIDATE] ${errorMsg}`);
        throw new Error(errorMsg);
      }

      // Según recomendación de Apple: siempre validar primero contra producción
      const url = isSandbox ? this.sandboxUrl : this.productionUrl;
      const environment = isSandbox ? 'sandbox' : 'production';
      
      console.log(`🍎 [VALIDATE] Validando recibo contra ${environment}...`);
      
      const requestBody = {
        'receipt-data': receiptData,
        'password': this.sharedSecret,
        'exclude-old-transactions': true
      };

      const response = await axios.post(url, requestBody, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 segundos timeout
      });

      const result = response.data;
      console.log('📱 [VALIDATE] Respuesta de Apple:', { 
        status: result.status, 
        environment: result.environment || environment,
        statusCode: result.status 
      });

      // Según recomendación de Apple: si validación en producción falla con 21007,
      // entonces validar contra sandbox
      if (result.status === 21007 && !isSandbox) {
        console.log('🔄 [VALIDATE] Error 21007 detectado: Recibo de sandbox usado en producción');
        console.log('🔄 [VALIDATE] Reintentando validación contra entorno sandbox...');
        return await this.validateReceipt(receiptData, true);
      }

      // Si ya estamos validando contra sandbox y recibimos otros errores,
      // o si la validación es exitosa, procesar la respuesta
      return this.processAppleResponse(result);
    } catch (error) {
      console.error('❌ [VALIDATE] Error validando recibo de Apple:', error.message);
      
      // Si es un error de red o timeout, pero tenemos un error 21007 pendiente,
      // no reintentar automáticamente - dejar que el cliente lo maneje
      if (error.response && error.response.data && error.response.data.status === 21007) {
        console.log('🔄 [VALIDATE] Error 21007 en respuesta de error, intentando sandbox...');
        if (!isSandbox) {
          return await this.validateReceipt(receiptData, true);
        }
      }
      
      throw new Error(`Error validando recibo: ${error.message}`);
    }
  }

  /**
   * Procesa la respuesta de Apple y extrae información de suscripción
   * @param {Object} appleResponse - Respuesta de Apple
   * @returns {Object} - Información procesada de la suscripción
   */
  processAppleResponse(appleResponse) {
    const { status, receipt, latest_receipt_info, pending_renewal_info } = appleResponse;

    // Verificar estado de la respuesta
    // Nota: El error 21007 ya fue manejado en validateReceipt antes de llegar aquí
    if (status !== 0) {
      const errorMessage = this.getStatusErrorMessage(status);
      console.error(`❌ [PROCESS] Error de Apple al procesar respuesta: ${errorMessage} (${status})`);
      throw new Error(`Error de Apple: ${errorMessage} (${status})`);
    }

    // Verificar que hay información de recibos
    if (!receipt || !latest_receipt_info || latest_receipt_info.length === 0) {
      throw new Error('No se encontró información de suscripción en el recibo');
    }

    // Buscar la suscripción más reciente
    const latestReceipt = latest_receipt_info[latest_receipt_info.length - 1];
    
    // Verificar que es una suscripción válida
    if (!this.isValidSubscription(latestReceipt)) {
      throw new Error('El recibo no contiene una suscripción válida');
    }

    // Extraer información de la suscripción
    const subscriptionInfo = {
      productId: latestReceipt.product_id,
      transactionId: latestReceipt.transaction_id,
      originalTransactionId: latestReceipt.original_transaction_id,
      purchaseDate: new Date(parseInt(latestReceipt.purchase_date_ms)),
      expiresDate: new Date(parseInt(latestReceipt.expires_date_ms)),
      isTrialPeriod: latestReceipt.is_trial_period === 'true',
      isInIntroOfferPeriod: latestReceipt.is_in_intro_offer_period === 'true',
      environment: appleResponse.environment || 'production',
      receiptData: appleResponse.latest_receipt || appleResponse.receipt,
      autoRenewStatus: this.getAutoRenewStatus(pending_renewal_info, latestReceipt.original_transaction_id)
    };

    // Verificar si la suscripción está activa
    const now = new Date();
    subscriptionInfo.isActive = subscriptionInfo.expiresDate > now;

    console.log('✅ Suscripción procesada:', {
      productId: subscriptionInfo.productId,
      isActive: subscriptionInfo.isActive,
      expiresDate: subscriptionInfo.expiresDate.toISOString()
    });

    return subscriptionInfo;
  }

  /**
   * Verifica si el recibo contiene una suscripción válida
   * @param {Object} receipt - Información del recibo
   * @returns {boolean} - Si es una suscripción válida
   */
  isValidSubscription(receipt) {
    const validProductIds = ['fitso_premium_monthly', 'fitso_premium_yearly'];
    return validProductIds.includes(receipt.product_id);
  }

  /**
   * Obtiene el estado de renovación automática
   * @param {Array} pendingRenewalInfo - Información de renovaciones pendientes
   * @param {string} originalTransactionId - ID de transacción original
   * @returns {boolean} - Estado de renovación automática
   */
  getAutoRenewStatus(pendingRenewalInfo, originalTransactionId) {
    if (!pendingRenewalInfo || pendingRenewalInfo.length === 0) {
      return true; // Por defecto asumir que está activa
    }

    const renewalInfo = pendingRenewalInfo.find(
      info => info.original_transaction_id === originalTransactionId
    );

    return renewalInfo ? renewalInfo.auto_renew_status === '1' : true;
  }

  /**
   * Obtiene mensaje de error basado en el código de estado de Apple
   * @param {number} status - Código de estado de Apple
   * @returns {string} - Mensaje de error
   */
  getStatusErrorMessage(status) {
    const errorMessages = {
      21000: 'El recibo enviado no es válido',
      21002: 'Los datos del recibo no están en formato correcto',
      21003: 'El recibo no se pudo autenticar',
      21004: 'La contraseña compartida no coincide',
      21005: 'El recibo no está disponible',
      21006: 'El recibo es válido pero la suscripción ha expirado',
      21007: 'El recibo es del entorno de sandbox',
      21008: 'El recibo es del entorno de producción',
      21009: 'Datos internos no disponibles',
      21010: 'El usuario no está autorizado'
    };

    return errorMessages[status] || `Error desconocido (${status})`;
  }

  /**
   * Verifica si un recibo es de sandbox basado en el environment
   * @param {string} environment - Entorno del recibo
   * @returns {boolean} - Si es sandbox
   */
  isSandboxEnvironment(environment) {
    return environment === 'Sandbox';
  }
}

module.exports = new AppleReceiptService();
