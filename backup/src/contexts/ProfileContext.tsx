import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getUserProfile, UserProfile } from '../lib/userProfile';

interface ProfileContextType {
  profile: UserProfile | null;
  isLoading: boolean;
  refreshProfile: () => Promise<void>;
  updateProfileWeight: (weight: number) => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

interface ProfileProviderProps {
  children: ReactNode;
}

export const ProfileProvider: React.FC<ProfileProviderProps> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const userProfile = await getUserProfile();
      setProfile(userProfile);
      console.log('📊 Perfil cargado:', userProfile?.weight, 'kg');
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    console.log('🔄 Refrescando perfil...');
    await loadProfile();
  };

  const updateProfileWeight = async (weight: number) => {
    try {
      console.log('🔄 Actualizando peso del perfil a:', weight);
      
      // Actualizar el estado local inmediatamente
      if (profile) {
        const updatedProfile = {
          ...profile,
          weight: weight,
          lastUpdated: new Date().toISOString()
        };
        setProfile(updatedProfile);
        console.log('✅ Peso del perfil actualizado en tiempo real:', weight, 'kg');
      }
      
      // También actualizar en AsyncStorage
      const { updateUserProfile } = await import('../lib/userProfile');
      await updateUserProfile({ weight });
      
    } catch (error) {
      console.error('Error updating profile weight:', error);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const value: ProfileContextType = {
    profile,
    isLoading,
    refreshProfile,
    updateProfileWeight
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = (): ProfileContextType => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};
