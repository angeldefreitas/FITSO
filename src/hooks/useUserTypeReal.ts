import { useState, useEffect } from 'react';
import { affiliateApiService } from '../services/affiliateApiService';
import { isAdminEmail } from '../config/adminConfig';

export type UserType = 'admin' | 'affiliate' | 'user';

interface UserTypeInfo {
  type: UserType;
  affiliateCode?: string;
  isAdmin?: boolean;
}

interface User {
  id: string;
  email: string;
  name: string;
}

interface UseUserTypeProps {
  user: User | null;
}

export const useUserTypeReal = ({ user }: UseUserTypeProps): UserTypeInfo => {
  const [userType, setUserType] = useState<UserTypeInfo>({ type: 'user' });

  useEffect(() => {
    const determineUserType = async () => {
      if (!user) {
        setUserType({ type: 'user' });
        return;
      }

      try {
        // Verificar si es admin por email
        const isAdmin = isAdminEmail(user.email);
        
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
  }, [user]);

  return userType;
};
