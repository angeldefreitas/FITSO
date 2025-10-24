import React from 'react';
import { AdminButton } from './AdminButton';
import { AffiliateButton } from './AffiliateButton';
import { useUserTypeReal } from './hooks/useUserTypeReal';

interface User {
  id: string;
  email: string;
  name: string;
}

interface UserAccessButtonsRealProps {
  navigation: any;
  user: User | null;
}

export const UserAccessButtonsReal: React.FC<UserAccessButtonsRealProps> = ({
  navigation,
  user
}) => {
  const { type, affiliateCode, isAdmin } = useUserTypeReal({ user });

  const handleAdminPress = () => {
    navigation.navigate('AdminAffiliates');
  };

  const handleAffiliatePress = () => {
    navigation.navigate('AffiliateDashboard', { 
      affiliateCode: affiliateCode || 'FITNESS_GURU' 
    });
  };

  return (
    <>
      {type === 'admin' && (
        <AdminButton onPress={handleAdminPress} />
      )}
      
      {type === 'affiliate' && (
        <AffiliateButton 
          onPress={handleAffiliatePress} 
          affiliateCode={affiliateCode}
        />
      )}
    </>
  );
};
