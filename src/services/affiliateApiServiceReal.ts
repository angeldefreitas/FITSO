// Servicio de API de afiliados conectado al backend real
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

// Para testing local, cambiar a:
// const API_BASE_URL = 'http://localhost:3000';

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

// Función para obtener el token de autenticación
const getAuthToken = (): string | null => {
  // Aquí obtendrías el token del AsyncStorage o tu sistema de autenticación
  // Por ahora retornamos null, pero deberías implementar esto
  return null;
};

// Función para hacer requests autenticados
const authenticatedRequest = async (url: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

export const affiliateApiServiceReal = {
  // Crear cuenta de afiliado completa
  async createAffiliateAccount(data: CreateAffiliateAccountRequest) {
    try {
      const response = await authenticatedRequest('/api/affiliates/create-account', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      return response;
    } catch (error) {
      console.error('Error creating affiliate account:', error);
      throw error;
    }
  },

  // Cambiar contraseña de afiliado
  async changeAffiliatePassword(data: ChangePasswordRequest) {
    try {
      const response = await authenticatedRequest('/api/affiliates/change-password', {
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
      const response = await authenticatedRequest('/api/affiliates/codes', {
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
      const response = await authenticatedRequest('/api/affiliates/dashboard');
      return response.data;
    } catch (error) {
      console.error('Error getting affiliate dashboard:', error);
      throw error;
    }
  },

  // Obtener dashboard de administración
  async getAdminDashboard() {
    try {
      const response = await authenticatedRequest('/api/affiliates/admin-dashboard');
      return response.data;
    } catch (error) {
      console.error('Error getting admin dashboard:', error);
      throw error;
    }
  },

  // Registrar código de referencia
  async recordReferral(referralCode: string) {
    try {
      const response = await authenticatedRequest('/api/affiliates/referral', {
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
      const response = await authenticatedRequest('/api/affiliates/my-referral');
      return response.data;
    } catch (error) {
      console.error('Error getting my referral:', error);
      throw error;
    }
  },

  // Obtener códigos de afiliado
  async getAffiliateCodes(): Promise<AffiliateCode[]> {
    try {
      const response = await authenticatedRequest('/api/affiliates/codes');
      return response.data;
    } catch (error) {
      console.error('Error getting affiliate codes:', error);
      throw error;
    }
  },

  // Obtener estadísticas de afiliado
  async getAffiliateStats(code: string) {
    try {
      const response = await authenticatedRequest(`/api/affiliates/stats/${code}`);
      return response.data;
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
      const response = await authenticatedRequest('/api/affiliates/payments', {
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
