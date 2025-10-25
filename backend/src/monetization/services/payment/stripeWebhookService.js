const stripeService = require('./stripeService');
const { query } = require('../../../config/database');

class StripeWebhookService {
  /**
   * Procesar webhook de balance actualizado
   */
  async handleBalanceUpdated(event) {
    try {
      console.log('💰 [WEBHOOK] Balance actualizado en Stripe');
      
      // Aquí podrías actualizar una tabla de cache o notificar a usuarios
      // Por ahora solo logueamos
      console.log('📊 [WEBHOOK] Nuevo balance disponible');
      
      return { success: true, message: 'Balance actualizado' };
    } catch (error) {
      console.error('❌ [WEBHOOK] Error procesando balance:', error);
      throw error;
    }
  }

  /**
   * Procesar webhook de transferencia completada
   */
  async handleTransferCompleted(event) {
    try {
      const transfer = event.data.object;
      console.log('💸 [WEBHOOK] Transferencia completada:', transfer.id);
      
      // Actualizar estado en la base de datos
      const updateQuery = `
        UPDATE affiliate_payments 
        SET status = 'paid', paid_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE stripe_transfer_id = $1
      `;
      
      await query(updateQuery, [transfer.id]);
      
      console.log('✅ [WEBHOOK] Estado de pago actualizado');
      return { success: true, message: 'Transferencia procesada' };
    } catch (error) {
      console.error('❌ [WEBHOOK] Error procesando transferencia:', error);
      throw error;
    }
  }

  /**
   * Procesar webhook de transferencia fallida
   */
  async handleTransferFailed(event) {
    try {
      const transfer = event.data.object;
      console.log('❌ [WEBHOOK] Transferencia fallida:', transfer.id);
      
      // Actualizar estado en la base de datos
      const updateQuery = `
        UPDATE affiliate_payments 
        SET status = 'failed', updated_at = CURRENT_TIMESTAMP
        WHERE stripe_transfer_id = $1
      `;
      
      await query(updateQuery, [transfer.id]);
      
      console.log('✅ [WEBHOOK] Estado de pago actualizado a fallido');
      return { success: true, message: 'Transferencia marcada como fallida' };
    } catch (error) {
      console.error('❌ [WEBHOOK] Error procesando transferencia fallida:', error);
      throw error;
    }
  }
}

module.exports = new StripeWebhookService();
