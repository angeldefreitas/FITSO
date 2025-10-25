const Stripe = require('stripe');

class StripeService {
  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  }

  /**
   * Crear un pago de comisión a un afiliado
   * @param {Object} payoutData - Datos del pago
   * @param {string} payoutData.affiliateId - ID del afiliado
   * @param {string} payoutData.email - Email del afiliado
   * @param {number} payoutData.amount - Monto en centavos
   * @param {string} payoutData.description - Descripción del pago
   * @returns {Promise<Object>} - Resultado del pago
   */
  async createPayout({ affiliateId, email, amount, description }) {
    try {
      console.log('💰 [STRIPE] Creando pago de comisión:', {
        affiliateId,
        email,
        amount,
        description
      });

      // Crear transferencia a la cuenta del afiliado
      const transfer = await this.stripe.transfers.create({
        amount: Math.round(amount * 100), // Convertir a centavos
        currency: 'usd',
        destination: affiliateId, // ID de la cuenta conectada del afiliado
        description: description || `Comisión de afiliado - ${email}`,
        metadata: {
          type: 'affiliate_commission',
          affiliate_email: email,
          payout_date: new Date().toISOString()
        }
      });

      console.log('✅ [STRIPE] Pago creado exitosamente:', transfer.id);
      return {
        success: true,
        transferId: transfer.id,
        amount: amount,
        status: transfer.status
      };

    } catch (error) {
      console.error('❌ [STRIPE] Error creando pago:', error);
      throw new Error(`Error procesando pago: ${error.message}`);
    }
  }

  /**
   * Crear cuenta conectada para afiliado
   * @param {Object} accountData - Datos de la cuenta
   * @param {string} accountData.email - Email del afiliado
   * @param {string} accountData.country - País (ej: 'US', 'MX')
   * @param {string} accountData.type - Tipo de cuenta ('express' o 'standard')
   * @returns {Promise<Object>} - Datos de la cuenta creada
   */
  async createConnectedAccount({ email, country = 'US', type = 'express' }) {
    try {
      console.log('🏦 [STRIPE] Creando cuenta conectada para:', email);

      const account = await this.stripe.accounts.create({
        type: type,
        country: country,
        email: email,
        capabilities: {
          transfers: { requested: true }
        },
        settings: {
          payouts: {
            schedule: {
              interval: 'monthly',
              monthly_anchor: 1 // Día 1 de cada mes
            }
          }
        }
      });

      console.log('✅ [STRIPE] Cuenta conectada creada:', account.id);
      return {
        success: true,
        accountId: account.id,
        account: account
      };

    } catch (error) {
      console.error('❌ [STRIPE] Error creando cuenta conectada:', error);
      throw new Error(`Error creando cuenta: ${error.message}`);
    }
  }

  /**
   * Crear enlace de onboarding para afiliado
   * @param {string} accountId - ID de la cuenta conectada
   * @param {string} returnUrl - URL de retorno
   * @returns {Promise<Object>} - Enlace de onboarding
   */
  async createOnboardingLink(accountId, returnUrl) {
    try {
      console.log('🔗 [STRIPE] Creando enlace de onboarding para:', accountId);

      const accountLink = await this.stripe.accountLinks.create({
        account: accountId,
        return_url: returnUrl,
        refresh_url: returnUrl,
        type: 'account_onboarding'
      });

      console.log('✅ [STRIPE] Enlace de onboarding creado');
      return {
        success: true,
        url: accountLink.url,
        expires_at: accountLink.expires_at
      };

    } catch (error) {
      console.error('❌ [STRIPE] Error creando enlace de onboarding:', error);
      throw new Error(`Error creando enlace: ${error.message}`);
    }
  }

  /**
   * Verificar estado de cuenta conectada
   * @param {string} accountId - ID de la cuenta
   * @returns {Promise<Object>} - Estado de la cuenta
   */
  async getAccountStatus(accountId) {
    try {
      console.log('🔍 [STRIPE] Verificando estado de cuenta:', accountId);

      const account = await this.stripe.accounts.retrieve(accountId);
      
      return {
        success: true,
        accountId: account.id,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        detailsSubmitted: account.details_submitted,
        requirements: account.requirements
      };

    } catch (error) {
      console.error('❌ [STRIPE] Error verificando cuenta:', error);
      throw new Error(`Error verificando cuenta: ${error.message}`);
    }
  }

  /**
   * Procesar webhook de Stripe
   * @param {string} payload - Payload del webhook
   * @param {string} signature - Firma del webhook
   * @returns {Promise<Object>} - Evento procesado
   */
  async processWebhook(payload, signature) {
    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.webhookSecret
      );

      console.log('📨 [STRIPE] Webhook recibido:', event.type);

      switch (event.type) {
        case 'account.updated':
          return await this.handleAccountUpdated(event.data.object);
        
        case 'transfer.created':
          return await this.handleTransferCreated(event.data.object);
        
        case 'transfer.updated':
          return await this.handleTransferUpdated(event.data.object);
        
        default:
          console.log('⚠️ [STRIPE] Evento no manejado:', event.type);
          return { success: true, message: 'Evento no manejado' };
      }

    } catch (error) {
      console.error('❌ [STRIPE] Error procesando webhook:', error);
      throw new Error(`Error procesando webhook: ${error.message}`);
    }
  }

  /**
   * Manejar actualización de cuenta
   */
  async handleAccountUpdated(account) {
    console.log('🔄 [STRIPE] Cuenta actualizada:', account.id);
    // Aquí puedes actualizar el estado en tu base de datos
    return { success: true, message: 'Cuenta actualizada' };
  }

  /**
   * Manejar transferencia creada
   */
  async handleTransferCreated(transfer) {
    console.log('💰 [STRIPE] Transferencia creada:', transfer.id);
    // Aquí puedes actualizar el estado del pago en tu base de datos
    return { success: true, message: 'Transferencia creada' };
  }

  /**
   * Manejar transferencia actualizada
   */
  async handleTransferUpdated(transfer) {
    console.log('🔄 [STRIPE] Transferencia actualizada:', transfer.id);
    // Aquí puedes actualizar el estado del pago en tu base de datos
    return { success: true, message: 'Transferencia actualizada' };
  }
}

module.exports = new StripeService();
