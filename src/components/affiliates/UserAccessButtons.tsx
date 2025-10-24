import React from 'react';
import { AdminButton } from './AdminButton';
import { AffiliateButton } from './AffiliateButton';
import { useUserType } from './hooks/useUserType';

interface UserAccessButtonsProps {
  navigation: any;
  userId?: string;
}

export const UserAccessButtons: React.FC<UserAccessButtonsProps> = ({
  navigation,
  userId
}) => {
  const { type, affiliateCode, isAdmin } = useUserType(userId);

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
