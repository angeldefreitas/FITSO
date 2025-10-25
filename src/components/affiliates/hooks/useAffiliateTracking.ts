import { useState } from 'react';
import { affiliateApiService } from '../services/affiliateApiService';

interface TrackingResult {
  success: boolean;
  message: string;
  data?: {
    affiliate_code: string;
    commission_amount?: number;
    commission_percentage?: number;
  };
}

export const useAffiliateTracking = () => {
  const [isTracking, setIsTracking] = useState(false);

  const trackPremiumConversion = async (
    userId: string, 
    subscriptionId: string, 
    subscriptionAmount: number
  ): Promise<TrackingResult> => {
    try {
      setIsTracking(true);
      const result = await affiliateApiService.trackPremiumConversion(
        userId, 
        subscriptionId, 
        subscriptionAmount, 
        true
      );
      return result;
    } catch (error) {
      console.error('Error tracking premium conversion:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error desconocido'
      };
    } finally {
      setIsTracking(false);
    }
  };

  const trackSubscriptionCancellation = async (
    userId: string, 
    subscriptionId: string
  ): Promise<TrackingResult> => {
    try {
      setIsTracking(true);
      const result = await affiliateApiService.trackPremiumConversion(
        userId, 
        subscriptionId, 
        0, // No hay monto en cancelación
        false
      );
      return result;
    } catch (error) {
      console.error('Error tracking subscription cancellation:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error desconocido'
      };
    } finally {
      setIsTracking(false);
    }
  };

  return {
    isTracking,
    trackPremiumConversion,
    trackSubscriptionCancellation
  };
};
