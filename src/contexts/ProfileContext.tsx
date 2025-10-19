import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getUserProfile, UserProfile } from '../lib/userProfile';
import offlineSyncService from '../services/offlineSyncService';

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
      
      // Verificar conectividad
      const isOnline = offlineSyncService.isOnline;
      
      if (isOnline) {
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
            // Guardar perfil en caché offline
            await offlineSyncService.saveOfflineData({ 
              profile: profileData,
              user: { id: userId, name: 'Usuario' }
            });
            console.log('📊 Perfil cargado desde backend:', userProfile.weight, 'kg');
            return;
          }
        } catch (backendError) {
          console.log('⚠️ Error cargando desde backend:', backendError.message);
        }
      }
      
      // Si no se encuentra en backend o no hay conexión, intentar desde caché offline
      try {
        const offlineData = await offlineSyncService.getOfflineData();
        if (offlineData?.profile && offlineData.profile.biometricData) {
          console.log('✅ Perfil encontrado en caché offline');
          const userProfile = {
            id: userId,
            name: 'Usuario',
            age: offlineData.profile.biometricData.age || 25,
            height: offlineData.profile.biometricData.heightCm || 175,
            weight: offlineData.profile.biometricData.weightKg || 70,
            gender: offlineData.profile.biometricData.gender === 'male' ? 'masculino' as const : 'femenino' as const,
            activityLevel: offlineData.profile.biometricData.activityLevel === 'sedentary' ? 'sedentario' as const :
                          offlineData.profile.biometricData.activityLevel === 'light' ? 'ligero' as const :
                          offlineData.profile.biometricData.activityLevel === 'moderate' ? 'moderado' as const :
                          offlineData.profile.biometricData.activityLevel === 'active' ? 'intenso' as const : 'intenso' as const,
            goal: offlineData.profile.goalsData?.goal || 'lose_weight',
            weightGoalAmount: offlineData.profile.goalsData?.weightGoalAmount || 0.5,
            createdAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
          };
          setProfile(userProfile);
          console.log('📊 Perfil cargado desde caché offline:', userProfile.weight, 'kg');
          return;
        }
      } catch (offlineError) {
        console.log('⚠️ Error cargando desde caché offline:', offlineError.message);
      }
      
      // Como último recurso, intentar desde AsyncStorage
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
      
      // La sincronización con el backend ya se maneja automáticamente
      // en el ProgressService cuando se actualiza una entrada de peso
      console.log('✅ Peso del perfil actualizado localmente');
      
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
