import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getUserProfile, UserProfile } from '../lib/userProfile';

interface ProfileContextType {
  profile: UserProfile | null;
  isLoading: boolean;
  refreshProfile: () => Promise<void>;
  updateProfileWeight: (weight: number) => Promise<void>;
  updateProfileData: (updates: Partial<UserProfile>) => Promise<void>;
  loadProfileForUser: (userId: string) => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

interface ProfileProviderProps {
  children: ReactNode;
  userId?: string;
}

export const ProfileProvider: React.FC<ProfileProviderProps> = ({ children, userId }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadProfile = async () => {
    // Esta función ya no se usa directamente
    console.log('⚠️ loadProfile deprecated, use loadProfileForUser instead');
  };

  const loadProfileForUser = async (userId: string) => {
    try {
      setIsLoading(true);
      console.log('🔄 Cargando perfil para usuario:', userId);
      
      // Primero intentar cargar desde el backend
      try {
        const { default: profileService } = await import('../services/profileService');
        const profileData = await profileService.getProfile();
        
        if (profileData && profileData.biometricData) {
          console.log('✅ Perfil encontrado en backend');
          const userProfile = {
            id: userId,
            name: 'Usuario', // El nombre viene del usuario autenticado
            age: profileData.biometricData.age || 25,
            height: profileData.biometricData.heightCm || 175,
            weight: profileData.biometricData.weightKg || 70,
            gender: profileData.biometricData.gender === 'male' ? 'masculino' as const : 'femenino' as const,
            activityLevel: profileData.biometricData.activityLevel === 'sedentary' ? 'sedentario' as const :
                          profileData.biometricData.activityLevel === 'light' ? 'ligero' as const :
                          profileData.biometricData.activityLevel === 'moderate' ? 'moderado' as const :
                          profileData.biometricData.activityLevel === 'active' ? 'intenso' as const : 'intenso' as const,
            goal: profileData.goalsData?.goal || 'lose_weight',
            weightGoalAmount: profileData.goalsData?.weightGoalAmount || 0.5,
            createdAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
          };
          setProfile(userProfile);
          console.log('📊 Perfil cargado desde backend:', userProfile.weight, 'kg');
          return;
        }
      } catch (backendError) {
        console.log('⚠️ Error cargando desde backend:', backendError.message);
      }
      
      // Si no se encuentra en backend, intentar desde AsyncStorage
      const userProfile = await getUserProfile(userId);
      setProfile(userProfile);
      console.log('📊 Perfil cargado desde AsyncStorage:', userProfile?.weight, 'kg');
      
    } catch (error) {
      console.error('❌ Error loading profile:', error);
      setProfile(null);
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
      
      // Si no hay perfil cargado, intentar cargarlo primero
      if (!profile) {
        console.log('⚠️ No hay perfil cargado, intentando cargar...');
        if (userId) {
          await loadProfileForUser(userId);
        } else {
          console.error('❌ No hay userId disponible para cargar perfil');
          return;
        }
      }
      
      // Verificar nuevamente después de intentar cargar
      if (!profile) {
        console.error('❌ No se pudo cargar el perfil');
        return;
      }
      
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
      
      // Actualizar en AsyncStorage y crear registro de progreso
      const { updateUserProfile } = await import('../lib/userProfile');
      const result = await updateUserProfile({ weight }, profile.id);
      
      if (!result.success) {
        console.error('❌ Error actualizando perfil:', result.error);
        // Revertir el cambio local si falló
        if (profile) {
          setProfile(profile);
        }
      } else {
        console.log('✅ Peso actualizado en perfil y progreso');
        // Recargar el perfil desde AsyncStorage para asegurar sincronización
        await loadProfileForUser(profile.id);
      }
      
    } catch (error) {
      console.error('Error updating profile weight:', error);
      // Revertir el cambio local si falló
      if (profile) {
        setProfile(profile);
      }
    }
  };

  const updateProfileData = async (updates: Partial<UserProfile>) => {
    try {
      console.log('🔄 Actualizando datos del perfil:', updates);
      
      // Si no hay perfil cargado, intentar cargarlo primero
      if (!profile) {
        console.log('⚠️ No hay perfil cargado, intentando cargar...');
        if (userId) {
          await loadProfileForUser(userId);
        } else {
          console.error('❌ No hay userId disponible para cargar perfil');
          return;
        }
      }
      
      // Verificar nuevamente después de intentar cargar
      if (!profile) {
        console.error('❌ No se pudo cargar el perfil');
        return;
      }
      
      // Actualizar el estado local inmediatamente
      if (profile) {
        const updatedProfile = {
          ...profile,
          ...updates,
          lastUpdated: new Date().toISOString()
        };
        setProfile(updatedProfile);
        console.log('✅ Datos del perfil actualizados en tiempo real');
      }
      
      // Actualizar en AsyncStorage y backend
      const { updateUserProfile } = await import('../lib/userProfile');
      const result = await updateUserProfile(updates, profile.id);
      
      if (!result.success) {
        console.error('❌ Error actualizando perfil:', result.error);
        // Revertir el cambio local si falló
        if (profile) {
          setProfile(profile);
        }
      } else {
        console.log('✅ Datos del perfil actualizados correctamente');
        // Recargar el perfil desde AsyncStorage para asegurar sincronización
        await loadProfileForUser(profile.id);
      }
      
    } catch (error) {
      console.error('Error updating profile data:', error);
      // Revertir el cambio local si falló
      if (profile) {
        setProfile(profile);
      }
    }
  };

  useEffect(() => {
    if (userId) {
      console.log('🔄 Cargando perfil para usuario:', userId);
      loadProfileForUser(userId);
    } else {
      console.log('❌ No hay userId, limpiando perfil');
      setProfile(null);
      setIsLoading(false);
    }
  }, [userId]);

  const value: ProfileContextType = {
    profile,
    isLoading,
    refreshProfile,
    updateProfileWeight,
    updateProfileData,
    loadProfileForUser
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
