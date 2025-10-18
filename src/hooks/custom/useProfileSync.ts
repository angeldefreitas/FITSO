import { useState, useEffect } from 'react';
import { getUserProfile } from '../../lib/userProfile';

export const useProfileSync = () => {
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const userProfile = await getUserProfile();
      setProfile(userProfile);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Cargar perfil inicial
    loadProfile();

    // Escuchar eventos de actualización del peso
    const handleWeightUpdate = (event: any) => {
      console.log('🔄 Evento de actualización de peso recibido:', event.detail);
      loadProfile(); // Recargar perfil cuando se actualice el peso
    };

    // Agregar listener para eventos personalizados
    if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('profileWeightUpdated', handleWeightUpdate);
    }

    // Cleanup
    return () => {
      if (typeof window !== 'undefined' && window.removeEventListener) {
        window.removeEventListener('profileWeightUpdated', handleWeightUpdate);
      }
    };
  }, []);

  return {
    profile,
    isLoading,
    refreshProfile: loadProfile
  };
};
