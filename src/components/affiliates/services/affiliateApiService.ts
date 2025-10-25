// Servicio de API de afiliados conectado al backend real
// Usando servidor de producción de Render
import userAuthService from '../../../services/userAuthService';
import apiService, { ApiResponse } from '../../../services/apiService';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://fitso.onrender.com';

console.log('🌐 [API] Usando URL:', API_BASE_URL);

interface AffiliateCode {
  id: string;
  code: string;
  affiliate_name: string;
  email?: string;
  commission_percentage: number;
  is_active: boolean;
  total_referrals?: number;
  premium_referrals?: number;
  total_commissions?: number;
  created_at: string;
}

interface CreateAffiliateAccountRequest {
  email: string;
  name: string;
  password: string;
  referralCode: string;
  commissionPercentage?: number;
}

interface AffiliateStats {
  total_referrals: number;
  premium_referrals: number;
  total_commissions: number;
  pending_commissions: number;
  paid_commissions: number;
  conversion_rate: number;
  commission_percentage: number;
  affiliate_code: string;
}

interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// Función para hacer requests autenticados usando apiService
const authenticatedRequest = async <T = any>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> => {
  try {
    console.log('🔑 [AFFILIATE API] Haciendo request autenticado a:', endpoint);
    
    // Usar apiService para manejar la autenticación automáticamente
    const response = await apiService.request<T>(endpoint, options);
    
    console.log('✅ [AFFILIATE API] Respuesta exitosa:', response);
    return response;
  } catch (error) {
    console.error('❌ [AFFILIATE API] Error en request:', error);
    throw error;
  }
};

export const affiliateApiService = {
  // Crear cuenta de afiliado completa
  async createAffiliateAccount(data: CreateAffiliateAccountRequest) {
    try {
      console.log('🚀 [API] Creando cuenta de afiliado...');
      console.log('📝 [API] Datos:', data);
      console.log('🌐 [API] URL completa:', `${API_BASE_URL}/api/create-affiliate-simple`);
      
      // Usar endpoint simple sin autenticación
      const response = await fetch(`${API_BASE_URL}/api/create-affiliate-simple`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ [API] Respuesta recibida:', result);
      return result;
    } catch (error) {
      console.error('❌ [API] Error creating affiliate account:', error);
      console.error('❌ [API] Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      throw error;
    }
  },

  // Cambiar contraseña de afiliado
  async changeAffiliatePassword(data: ChangePasswordRequest) {
    try {
      const response = await authenticatedRequest('/affiliates/change-password', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      return response;
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  },

  // Crear código de afiliado
  async createAffiliateCode(data: { affiliate_name: string; email?: string; commission_percentage?: number }) {
    try {
      const response = await authenticatedRequest('/affiliates/codes', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      return response;
    } catch (error) {
      console.error('Error creating affiliate code:', error);
      throw error;
    }
  },

  // Obtener dashboard de afiliado
  async getAffiliateDashboard(): Promise<AffiliateStats> {
    try {
      // Intentar primero el endpoint simplificado
      try {
        const response = await authenticatedRequest<{ data: AffiliateStats }>('/affiliates/simple-dashboard');
        return response.data!;
      } catch (simpleError) {
        console.log('⚠️ Endpoint simplificado falló, intentando endpoint original...');
        // Fallback al endpoint original
        const response = await authenticatedRequest<{ data: AffiliateStats }>('/affiliates/dashboard');
        return response.data!;
      }
    } catch (error) {
      console.error('Error getting affiliate dashboard:', error);
      throw error;
    }
  },

  // Obtener dashboard de administración
  async getAdminDashboard() {
    try {
      console.log('🔍 [ADMIN API] Obteniendo dashboard de administración...');
      const response = await authenticatedRequest('/affiliates/admin-dashboard');
      console.log('✅ [ADMIN API] Dashboard obtenido:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [ADMIN API] Error obteniendo dashboard:', error);
      throw error;
    }
  },

  // Registrar código de referencia
  async recordReferral(referralCode: string) {
    try {
      const response = await authenticatedRequest('/affiliates/referral', {
        method: 'POST',
        body: JSON.stringify({ referral_code: referralCode }),
      });

      return response;
    } catch (error) {
      console.error('Error recording referral:', error);
      throw error;
    }
  },

  // Obtener mi referencia
  async getMyReferral() {
    try {
      const response = await authenticatedRequest('/affiliates/my-referral');
      return response.data;
    } catch (error) {
      console.error('Error getting my referral:', error);
      throw error;
    }
  },

  // Obtener información básica del afiliado
  async getMyAffiliateInfo() {
    try {
      const response = await authenticatedRequest('/affiliates/my-info');
      return response.data;
    } catch (error) {
      console.error('Error getting my affiliate info:', error);
      throw error;
    }
  },

  // Registrar código de referencia
  async registerReferralCode(referralCode: string) {
    try {
      const response = await authenticatedRequest('/affiliates/referral', {
        method: 'POST',
        body: JSON.stringify({ referral_code: referralCode }),
      });
      return response;
    } catch (error) {
      console.error('Error registering referral code:', error);
      throw error;
    }
  },

  // Obtener códigos de afiliado
  async getAffiliateCodes(): Promise<AffiliateCode[]> {
    try {
      const response = await authenticatedRequest<{ data: AffiliateCode[] }>('/affiliates/codes');
      return response.data!;
    } catch (error) {
      console.error('Error getting affiliate codes:', error);
      throw error;
    }
  },

  // Obtener estadísticas de afiliado (endpoint público para validación)
  async getAffiliateStats(code: string) {
    try {
      console.log('🔍 [AFFILIATE API] Validando código:', code);
      const response = await fetch(`${API_BASE_URL}/api/affiliates/stats/${code}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ [AFFILIATE API] Código validado:', result);
      return result.data;
    } catch (error) {
      console.error('Error getting affiliate stats:', error);
      throw error;
    }
  },

  // Procesar pago
  async processPayment(data: {
    affiliate_code: string;
    commission_ids: string[];
    payment_method: string;
    payment_reference: string;
  }) {
    try {
      const response = await authenticatedRequest('/affiliates/payments', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      return response;
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  },

  // Obtener referidos de un afiliado
  async getAffiliateReferrals(code: string, options: {
    limit?: number;
    offset?: number;
    premium_only?: boolean;
  } = {}) {
    try {
      console.log('🔍 [AFFILIATE API] Obteniendo referidos para código:', code);
      
      const params = new URLSearchParams();
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.offset) params.append('offset', options.offset.toString());
      if (options.premium_only) params.append('premium_only', options.premium_only.toString());
      
      const queryString = params.toString();
      const endpoint = `/affiliates/referrals/${code}${queryString ? `?${queryString}` : ''}`;
      
      const response = await authenticatedRequest(endpoint);
      console.log('✅ [AFFILIATE API] Referidos obtenidos:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [AFFILIATE API] Error obteniendo referidos:', error);
      throw error;
    }
  },

  // Obtener comisiones de un afiliado
  async getAffiliateCommissions(code: string, options: {
    limit?: number;
    offset?: number;
    paid_only?: boolean;
    unpaid_only?: boolean;
    date_from?: string;
    date_to?: string;
  } = {}) {
    try {
      console.log('🔍 [AFFILIATE API] Obteniendo comisiones para código:', code);
      
      const params = new URLSearchParams();
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.offset) params.append('offset', options.offset.toString());
      if (options.paid_only) params.append('paid_only', options.paid_only.toString());
      if (options.unpaid_only) params.append('unpaid_only', options.unpaid_only.toString());
      if (options.date_from) params.append('date_from', options.date_from);
      if (options.date_to) params.append('date_to', options.date_to);
      
      const queryString = params.toString();
      const endpoint = `/affiliates/commissions/${code}${queryString ? `?${queryString}` : ''}`;
      
      const response = await authenticatedRequest(endpoint);
      console.log('✅ [AFFILIATE API] Comisiones obtenidas:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [AFFILIATE API] Error obteniendo comisiones:', error);
      throw error;
    }
  },

  // Obtener comisiones pendientes
  async getPendingPayments(affiliate_code?: string) {
    try {
      console.log('🔍 [AFFILIATE API] Obteniendo comisiones pendientes...');
      
      const params = new URLSearchParams();
      if (affiliate_code) params.append('affiliate_code', affiliate_code);
      
      const queryString = params.toString();
      const endpoint = `/affiliates/pending-payments${queryString ? `?${queryString}` : ''}`;
      
      const response = await authenticatedRequest(endpoint);
      console.log('✅ [AFFILIATE API] Comisiones pendientes obtenidas:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [AFFILIATE API] Error obteniendo comisiones pendientes:', error);
      throw error;
    }
  },

  // Toggle estado del código de afiliado
  async toggleAffiliateCode(code: string, isActive: boolean) {
    try {
      console.log('🔄 [AFFILIATE API] Cambiando estado del código:', code, 'a:', isActive);
      
      const response = await authenticatedRequest(`/affiliates/codes/${code}/toggle`, {
        method: 'PUT',
        body: JSON.stringify({ is_active: isActive }),
      });
      
      console.log('✅ [AFFILIATE API] Estado del código actualizado:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [AFFILIATE API] Error cambiando estado del código:', error);
      throw error;
    }
  },

  // Actualizar porcentaje de comisión
  async updateCommissionPercentage(code: string, newPercentage: number) {
    try {
      console.log('💰 [AFFILIATE API] Actualizando comisión para:', code, 'a:', newPercentage + '%');
      
      const response = await authenticatedRequest(`/affiliates/codes/${code}/commission`, {
        method: 'PUT',
        body: JSON.stringify({ commission_percentage: newPercentage }),
      });
      
      console.log('✅ [AFFILIATE API] Porcentaje de comisión actualizado:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [AFFILIATE API] Error actualizando comisión:', error);
      throw error;
    }
  },

  async trackPremiumConversion(userId: string, subscriptionId: string, subscriptionAmount: number, isConversion: boolean = true) {
    try {
      console.log('🔄 [AFFILIATE API] Tracking conversión premium:', {
        userId,
        subscriptionId,
        subscriptionAmount,
        isConversion
      });
      
      const response = await fetch(`${API_BASE_URL}/api/affiliates/track-premium-conversion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          subscription_id: subscriptionId,
          subscription_amount: subscriptionAmount,
          is_conversion: isConversion
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error en tracking de conversión');
      }
      
      console.log('✅ [AFFILIATE API] Conversión tracked:', data);
      return data;
    } catch (error) {
      console.error('❌ [AFFILIATE API] Error en tracking:', error);
      throw error;
    }
  },

  // Métodos de pagos
  async createStripeAccount(country: string = 'US', type: string = 'express') {
    try {
      console.log('🏦 [AFFILIATE API] Creando cuenta Stripe');
      
      const response = await authenticatedRequest('/affiliates/create-stripe-account', {
        method: 'POST',
        body: JSON.stringify({ country, type }),
      });
      
      console.log('✅ [AFFILIATE API] Cuenta Stripe creada:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [AFFILIATE API] Error creando cuenta Stripe:', error);
      throw error;
    }
  },

  async getStripeAccountStatus() {
    try {
      console.log('🔍 [AFFILIATE API] Verificando estado de cuenta Stripe');
      
      const response = await authenticatedRequest('/affiliates/stripe-account-status');
      
      console.log('✅ [AFFILIATE API] Estado de cuenta obtenido:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [AFFILIATE API] Error verificando cuenta:', error);
      throw error;
    }
  },

  async processPayout(affiliateCode: string, amount: number, description?: string) {
    try {
      console.log('💰 [AFFILIATE API] Procesando pago de comisión');
      
      const response = await authenticatedRequest('/affiliates/process-payout', {
        method: 'POST',
        body: JSON.stringify({
          affiliate_code: affiliateCode,
          amount: amount,
          description: description
        }),
      });
      
      console.log('✅ [AFFILIATE API] Pago procesado:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [AFFILIATE API] Error procesando pago:', error);
      throw error;
    }
  },

  async getPaymentHistory(limit: number = 50, offset: number = 0) {
    try {
      console.log('📊 [AFFILIATE API] Obteniendo historial de pagos');
      
      const response = await authenticatedRequest(`/affiliates/payment-history?limit=${limit}&offset=${offset}`);
      
      console.log('✅ [AFFILIATE API] Historial obtenido:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [AFFILIATE API] Error obteniendo historial:', error);
      throw error;
    }
  },

  // Métodos de balance
  async getBalance() {
    try {
      console.log('💰 [AFFILIATE API] Obteniendo balance');
      
      const response = await authenticatedRequest('/affiliates/balance');
      
      console.log('✅ [AFFILIATE API] Balance obtenido:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [AFFILIATE API] Error obteniendo balance:', error);
      throw error;
    }
  },

  async getTransferHistory(limit: number = 50, offset: number = 0) {
    try {
      console.log('📋 [AFFILIATE API] Obteniendo historial de transferencias');
      
      const response = await authenticatedRequest(`/affiliates/transfer-history?limit=${limit}&offset=${offset}`);
      
      console.log('✅ [AFFILIATE API] Historial de transferencias obtenido:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [AFFILIATE API] Error obteniendo historial de transferencias:', error);
      throw error;
    }
  },
};
