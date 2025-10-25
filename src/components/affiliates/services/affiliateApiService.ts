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
      const response = await authenticatedRequest('/affiliates/admin-dashboard');
      return response.data;
    } catch (error) {
      console.error('Error getting admin dashboard:', error);
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
};
