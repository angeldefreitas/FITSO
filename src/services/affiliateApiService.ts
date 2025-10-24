import { apiService } from './apiService';

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

interface CreateAffiliateRequest {
  affiliate_name: string;
  email?: string;
  commission_percentage?: number;
}

interface AffiliateStats {
  total_referrals: number;
  premium_referrals: number;
  total_commissions: number;
  paid_commissions: number;
  pending_commissions: number;
}

interface ConversionStats {
  total_referrals: number;
  premium_conversions: number;
  conversion_rate: number;
  avg_days_to_conversion: number;
}

interface Commission {
  id: string;
  affiliate_code: string;
  user_id: string;
  subscription_id: string;
  commission_amount: number;
  commission_percentage: number;
  subscription_amount: number;
  payment_period_start: string;
  payment_period_end: string;
  is_paid: boolean;
  paid_date?: string;
  payment_method?: string;
  payment_reference?: string;
  created_at: string;
}

interface Referral {
  id: string;
  user_id: string;
  affiliate_code: string;
  referral_date: string;
  is_premium: boolean;
  premium_conversion_date?: string;
}

export class AffiliateApiService {
  private baseUrl = '/api/affiliates';

  /**
   * Crear un nuevo código de afiliado
   */
  async createAffiliateCode(data: CreateAffiliateRequest): Promise<AffiliateCode> {
    const response = await apiService.post(`${this.baseUrl}/codes`, data);
    return response.data;
  }

  /**
   * Obtener todos los códigos de afiliado activos
   */
  async getAllAffiliateCodes(): Promise<AffiliateCode[]> {
    const response = await apiService.get(`${this.baseUrl}/codes`);
    return response.data;
  }

  /**
   * Desactivar un código de afiliado
   */
  async deactivateAffiliateCode(id: string): Promise<void> {
    await apiService.delete(`${this.baseUrl}/codes/${id}`);
  }

  /**
   * Registrar código de referencia para el usuario autenticado
   */
  async registerReferralCode(referralCode: string): Promise<void> {
    await apiService.post(`${this.baseUrl}/referral`, {
      referral_code: referralCode
    });
  }

  /**
   * Obtener información de referencia del usuario autenticado
   */
  async getMyReferral(): Promise<Referral | null> {
    const response = await apiService.get(`${this.baseUrl}/my-referral`);
    return response.data;
  }

  /**
   * Obtener estadísticas de un afiliado
   */
  async getAffiliateStats(code: string): Promise<{
    affiliate: AffiliateCode;
    referrals: AffiliateStats;
    conversion: ConversionStats;
    commissions: any;
  }> {
    const response = await apiService.get(`${this.baseUrl}/stats/${code}`);
    return response.data;
  }

  /**
   * Obtener lista de referidos de un afiliado
   */
  async getAffiliateReferrals(
    code: string,
    options: {
      limit?: number;
      offset?: number;
      premium_only?: boolean;
    } = {}
  ): Promise<Referral[]> {
    const params = new URLSearchParams();
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.offset) params.append('offset', options.offset.toString());
    if (options.premium_only) params.append('premium_only', 'true');

    const response = await apiService.get(
      `${this.baseUrl}/referrals/${code}?${params.toString()}`
    );
    return response.data;
  }

  /**
   * Obtener comisiones de un afiliado
   */
  async getAffiliateCommissions(
    code: string,
    options: {
      limit?: number;
      offset?: number;
      paid_only?: boolean;
      unpaid_only?: boolean;
      date_from?: string;
      date_to?: string;
    } = {}
  ): Promise<Commission[]> {
    const params = new URLSearchParams();
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.offset) params.append('offset', options.offset.toString());
    if (options.paid_only) params.append('paid_only', 'true');
    if (options.unpaid_only) params.append('unpaid_only', 'true');
    if (options.date_from) params.append('date_from', options.date_from);
    if (options.date_to) params.append('date_to', options.date_to);

    const response = await apiService.get(
      `${this.baseUrl}/commissions/${code}?${params.toString()}`
    );
    return response.data;
  }

  /**
   * Procesar pago de comisiones
   */
  async processCommissionPayment(
    affiliateCode: string,
    commissionIds: string[],
    paymentMethod: string,
    paymentReference?: string
  ): Promise<void> {
    await apiService.post(`${this.baseUrl}/payments`, {
      affiliate_code: affiliateCode,
      commission_ids: commissionIds,
      payment_method: paymentMethod,
      payment_reference: paymentReference
    });
  }

  /**
   * Obtener comisiones pendientes de pago
   */
  async getPendingPayments(affiliateCode?: string): Promise<Commission[]> {
    const params = affiliateCode ? `?affiliate_code=${affiliateCode}` : '';
    const response = await apiService.get(`${this.baseUrl}/pending-payments${params}`);
    return response.data;
  }

  /**
   * Validar si un código de referencia es válido
   */
  async validateReferralCode(code: string): Promise<boolean> {
    try {
      const response = await apiService.get(`${this.baseUrl}/validate/${code}`);
      return response.data.valid;
    } catch (error) {
      return false;
    }
  }

  /**
   * Obtener información de un código de referencia
   */
  async getReferralCodeInfo(code: string): Promise<{
    code: string;
    affiliate_name: string;
    commission_percentage: number;
    is_active: boolean;
  } | null> {
    try {
      const response = await apiService.get(`${this.baseUrl}/code-info/${code}`);
      return response.data;
    } catch (error) {
      return null;
    }
  }

  /**
   * Obtener estadísticas generales del sistema de afiliados
   */
  async getSystemStats(): Promise<{
    total_affiliates: number;
    total_referrals: number;
    premium_conversions: number;
    total_commissions_generated: number;
    total_commissions_paid: number;
    total_commissions_pending: number;
    overall_conversion_rate: number;
  }> {
    const response = await apiService.get(`${this.baseUrl}/system-stats`);
    return response.data;
  }

  /**
   * Obtener top afiliados por comisiones generadas
   */
  async getTopAffiliates(limit: number = 10): Promise<AffiliateCode[]> {
    const response = await apiService.get(`${this.baseUrl}/top-affiliates?limit=${limit}`);
    return response.data;
  }
}

// Exportar instancia singleton
export const affiliateApiService = new AffiliateApiService();
