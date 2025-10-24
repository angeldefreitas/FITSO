import { useState, useEffect } from 'react';
import { affiliateApiService } from '../services/affiliateApiService';
import { isAdminEmail } from '../../../config/adminConfig';

export type UserType = 'admin' | 'affiliate' | 'user';

export interface UserTypeInfo {
  type: UserType;
  affiliateCode?: string;
  isAdmin?: boolean;
}

export const useUserType = (userId?: string): UserTypeInfo => {
  const [userType, setUserType] = useState<UserTypeInfo>({ type: 'user' });

  useEffect(() => {
    const determineUserType = async () => {
      if (!userId) {
        setUserType({ type: 'user' });
        return;
      }

      try {
        // Verificar si es admin (por email o configuración específica)
        const isAdmin = await checkIfAdmin(userId);
        
        if (isAdmin) {
          setUserType({ type: 'admin', isAdmin: true });
          return;
        }

        // Verificar si tiene código de afiliado
        const referral = await affiliateApiService.getMyReferral();
        
        if (referral && referral.affiliate_code) {
          setUserType({ 
            type: 'affiliate', 
            affiliateCode: referral.affiliate_code 
          });
          return;
        }

        // Usuario normal
        setUserType({ type: 'user' });

      } catch (error) {
        console.error('Error determining user type:', error);
        setUserType({ type: 'user' });
      }
    };

    determineUserType();
  }, [userId]);

  return userType;
};

// Función para verificar si es admin
const checkIfAdmin = async (userId: string): Promise<boolean> => {
  try {
    // Opción 1: Verificar por email (usando configuración)
    // En tu implementación real, obtendrías el email del usuario desde tu AuthContext
    // const userEmail = getCurrentUserEmail(); // De tu AuthContext
    // return isAdminEmail(userEmail);
    
    // Opción 2: Verificar por campo en base de datos
    // const response = await apiService.get(`/api/users/${userId}/admin-status`);
    // return response.data.is_admin;
    
    // Por ahora, simulamos que es admin si el userId contiene 'admin' o 'angelfritas'
    // Esto es temporal para testing - en producción usarías el email real
    return userId === 'admin' || userId.includes('admin') || userId.includes('angelfritas');
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};
