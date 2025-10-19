import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Alert, DeviceEventEmitter } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authService, { RegisterData, LoginData, ForgotPasswordData, ResetPasswordData, ChangePasswordData, UpdateProfileData } from '../services/authService';
import profileService, { BiometricData, GoalsData, ProfileResponse, ProfileUpdateResponse } from '../services/profileService';
import apiService, { User } from '../services/apiService';
import offlineSyncService from '../services/offlineSyncService';
import { debugAuthState } from '../utils/authDebug';

interface AuthContextType {
  // Estado
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  profileData: ProfileResponse | null;
  isNewUser: boolean; // Para detectar si es un usuario recién registrado
  
  // Acciones de autenticación
  register: (data: RegisterData) => Promise<void>;
  login: (data: LoginData) => Promise<void>;
  logout: () => void;
  getProfile: () => Promise<void>;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
  forgotPassword: (data: ForgotPasswordData) => Promise<void>;
  resetPassword: (data: ResetPasswordData) => Promise<void>;
  changePassword: (data: ChangePasswordData) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
  checkConnection: () => Promise<boolean>;
  resetIsNewUser: () => void; // Nueva función para resetear isNewUser
  
  // Acciones de perfil
  getProfileData: () => Promise<void>;
  updateBiometricData: (data: BiometricData) => Promise<void>;
  updateGoalsData: (data: GoalsData) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<ProfileResponse | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);

  // Funciones para manejar caché local de datos del usuario
  const saveCachedUserData = useCallback(async (userData: User) => {
    try {
      await AsyncStorage.setItem('cached_user_data', JSON.stringify(userData));
      // También guardar en el servicio de sincronización offline
      await offlineSyncService.saveOfflineData({ user: userData });
      console.log('💾 Datos del usuario guardados en caché local');
    } catch (error) {
      console.error('Error guardando datos del usuario en caché:', error);
    }
  }, []);

  const loadCachedUserData = useCallback(async (): Promise<User | null> => {
    try {
      const cachedData = await AsyncStorage.getItem('cached_user_data');
      if (cachedData) {
        const userData = JSON.parse(cachedData);
        console.log('📱 Datos del usuario cargados desde caché local');
        return userData;
      }
      return null;
    } catch (error) {
      console.error('Error cargando datos del usuario desde caché:', error);
      return null;
    }
  }, []);

  const clearCachedUserData = useCallback(async () => {
    try {
      await AsyncStorage.removeItem('cached_user_data');
      // También limpiar datos del servicio de sincronización offline
      await offlineSyncService.clearOfflineData();
      console.log('🗑️ Datos del usuario eliminados del caché local');
    } catch (error) {
      console.error('Error eliminando datos del usuario del caché:', error);
    }
  }, []);

  const checkAuthStatus = useCallback(async () => {
    try {
      setLoading(true);
      
      console.log('🔄 Verificando estado de autenticación...');
      
      // Debug: mostrar estado actual de autenticación
      await debugAuthState();
      
      // Primero intentar cargar datos del usuario desde caché local
      let cachedUserData = await loadCachedUserData();
      
      // Si no hay datos en caché local, intentar desde el servicio de sincronización offline
      if (!cachedUserData) {
        const offlineData = await offlineSyncService.getOfflineData();
        cachedUserData = offlineData?.user || null;
      }
      
      if (cachedUserData) {
        console.log('✅ Usuario encontrado en caché local');
        setUser(cachedUserData);
        
        // Verificar conectividad y intentar sincronizar con el backend
        const isOnline = offlineSyncService.isOnline;
        if (isOnline) {
          try {
            // Intentar validar el token con el backend
            const userProfile = await authService.getProfile();
            if (userProfile) {
              setUser(userProfile);
              await saveCachedUserData(userProfile);
              console.log('✅ Usuario validado con backend y actualizado en caché');
            }
          } catch (backendError) {
            console.log('⚠️ Error validando con backend, manteniendo datos locales');
            // Mantener los datos locales si el backend falla
          }
        }
        
        setLoading(false);
        return;
      }
      
      // Si no hay datos en caché, verificar si hay token almacenado
      console.log('🔍 No hay datos en caché, verificando token almacenado...');
      
      // Forzar carga del token desde el almacenamiento
      const apiService = await import('../services/apiService');
      await apiService.default.forceLoadToken();
      
      const token = authService.getToken();
      if (!token) {
        console.log('ℹ️ No hay token almacenado');
        setUser(null);
        return;
      }

      // Si hay token, intentar obtener el perfil desde el backend
      try {
        const userProfile = await authService.getProfile();
        setUser(userProfile);
        await saveCachedUserData(userProfile);
        console.log('✅ Usuario autenticado desde backend');
      } catch (error) {
        console.log('❌ Token inválido, limpiando sesión');
        await authService.logout();
        setUser(null);
      }
    } catch (error) {
      console.error('Error verificando estado de autenticación:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []); // Sin dependencias para ejecutar solo una vez

  // Verificar si está autenticado al cargar
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Escuchar eventos de actualización de peso
  useEffect(() => {
    const handleWeightUpdate = async (eventData: any) => {
      console.log('🔄 Evento de actualización de peso recibido:', eventData);
      try {
        // Recargar datos del perfil para reflejar el nuevo peso
        await getProfileData();
      } catch (error) {
        console.error('Error recargando datos del perfil después de actualización de peso:', error);
      }
    };

    // Agregar listener para eventos usando DeviceEventEmitter
    const subscription = DeviceEventEmitter.addListener('profileWeightUpdated', handleWeightUpdate);

    // Cleanup
    return () => {
      subscription?.remove();
    };
  }, []);

  const register = async (data: RegisterData) => {
    try {
      setLoading(true);
      const response = await authService.register(data);
      setUser(response.user);
      setIsNewUser(true); // Marcar como usuario nuevo
      // Guardar datos del usuario en caché local
      await saveCachedUserData(response.user);
    } catch (error) {
      console.error('Error en registro:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const login = async (data: LoginData) => {
    try {
      setLoading(true);
      const response = await authService.login(data);
      setUser(response.user);
      setIsNewUser(false); // Marcar como usuario existente
      // Guardar datos del usuario en caché local
      await saveCachedUserData(response.user);
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };


  const logout = async () => {
    await authService.logout();
    setUser(null);
    setIsNewUser(false);
    // Limpiar caché local
    await clearCachedUserData();
  };

  const getProfile = async () => {
    try {
      setLoading(true);
      const userProfile = await authService.getProfile();
      setUser(userProfile);
      // Guardar datos del usuario en caché local
      await saveCachedUserData(userProfile);
    } catch (error) {
      console.error('Error obteniendo perfil:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: UpdateProfileData) => {
    try {
      setLoading(true);
      const updatedUser = await authService.updateProfile(data);
      setUser(updatedUser);
      // Guardar datos actualizados del usuario en caché local
      await saveCachedUserData(updatedUser);
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (data: ForgotPasswordData) => {
    try {
      setLoading(true);
      await authService.forgotPassword(data);
    } catch (error) {
      console.error('Error en forgot password:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (data: ResetPasswordData) => {
    try {
      setLoading(true);
      await authService.resetPassword(data);
    } catch (error) {
      console.error('Error en reset password:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (data: ChangePasswordData) => {
    try {
      setLoading(true);
      await authService.changePassword(data);
    } catch (error) {
      console.error('Error cambiando contraseña:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const verifyEmail = async (token: string) => {
    try {
      setLoading(true);
      await authService.verifyEmail(token);
      // Actualizar el estado del usuario para reflejar que está verificado
      if (user) {
        setUser({ ...user, is_verified: true });
      }
    } catch (error) {
      console.error('Error verificando email:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async () => {
    try {
      setLoading(true);
      await authService.deleteAccount();
      // Limpiar el estado del usuario después de eliminar la cuenta
      setUser(null);
      authService.logout();
    } catch (error) {
      console.error('Error eliminando cuenta:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const checkConnection = async () => {
    try {
      // Verificar conectividad de red primero
      const isOnline = offlineSyncService.isOnline;
      if (!isOnline) {
        console.log('⚠️ Sin conexión a internet');
        return false;
      }
      
      // Si hay conexión, verificar el servidor
      return await authService.checkConnection();
    } catch (error) {
      console.error('Error verificando conexión:', error);
      return false;
    }
  };

  // Funciones de perfil
  const getProfileData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Verificar conectividad
      const isOnline = offlineSyncService.isOnline;
      
      if (isOnline) {
        try {
          const data = await profileService.getProfile();
          setProfileData(data);
          // Guardar datos del perfil en caché offline
          await offlineSyncService.saveOfflineData({ profile: data });
          console.log('✅ Datos de perfil obtenidos del backend');
        } catch (backendError) {
          console.log('⚠️ Error del backend, intentando cargar desde caché offline');
          // Intentar cargar desde caché offline
          const offlineData = await offlineSyncService.getOfflineData();
          if (offlineData?.profile) {
            setProfileData(offlineData.profile);
            console.log('✅ Datos de perfil cargados desde caché offline');
          } else {
            throw backendError;
          }
        }
      } else {
        // Modo offline: cargar desde caché
        const offlineData = await offlineSyncService.getOfflineData();
        if (offlineData?.profile) {
          setProfileData(offlineData.profile);
          console.log('✅ Datos de perfil cargados desde caché offline (sin conexión)');
        } else {
          throw new Error('Sin conexión y no hay datos en caché');
        }
      }
    } catch (error) {
      console.error('Error obteniendo datos de perfil:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []); // Remover 'loading' de las dependencias para evitar bucle infinito

  const updateBiometricData = useCallback(async (data: BiometricData) => {
    try {
      setLoading(true);
      
      // Verificar conectividad
      const isOnline = offlineSyncService.isOnline;
      
      if (isOnline) {
        try {
          const response = await profileService.updateBiometricData(data);
          console.log('🔍 Respuesta del backend updateBiometricData:', JSON.stringify(response, null, 2));
          
          // Verificar que response.biometricData existe
          if (!response.biometricData) {
            throw new Error('Respuesta del backend no contiene biometricData');
          }
          
          // Mantener los datos de metas existentes y solo actualizar los datos biométricos
          const updatedProfileData = {
            ...profileData,
            biometricData: response.biometricData
          };
          setProfileData(updatedProfileData);
          
          // Guardar datos actualizados en caché offline
          await offlineSyncService.saveOfflineData({ profile: updatedProfileData });
        } catch (backendError) {
          console.log('⚠️ Error del backend, guardando datos localmente para sincronización posterior');
          // Guardar datos localmente para sincronización posterior
          const updatedProfileData = {
            ...profileData,
            biometricData: data
          };
          setProfileData(updatedProfileData);
          await offlineSyncService.saveOfflineData({ profile: updatedProfileData });
        }
      } else {
        // Modo offline: actualizar datos localmente
        console.log('📱 Modo offline: actualizando datos biométricos localmente');
        const updatedProfileData = {
          ...profileData,
          biometricData: data
        };
        setProfileData(updatedProfileData);
        await offlineSyncService.saveOfflineData({ profile: updatedProfileData });
      }
    } catch (error) {
      console.error('Error actualizando datos biométricos:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [profileData]);

  const updateGoalsData = useCallback(async (data: GoalsData) => {
    try {
      setLoading(true);
      
      // Verificar conectividad
      const isOnline = offlineSyncService.isOnline;
      
      if (isOnline) {
        try {
          const response = await profileService.updateGoalsData(data);
          console.log('🔍 Respuesta del backend updateGoalsData:', JSON.stringify(response, null, 2));
          
          // Verificar que response.goalsData existe
          if (!response.goalsData) {
            throw new Error('Respuesta del backend no contiene goalsData');
          }
          
          // Mantener los datos biométricos existentes y solo actualizar las metas
          const updatedProfileData = {
            ...profileData,
            goalsData: response.goalsData
          };
          setProfileData(updatedProfileData);
          
          // Guardar datos actualizados en caché offline
          await offlineSyncService.saveOfflineData({ profile: updatedProfileData });
        } catch (backendError) {
          console.log('⚠️ Error del backend, guardando datos localmente para sincronización posterior');
          // Guardar datos localmente para sincronización posterior
          const updatedProfileData = {
            ...profileData,
            goalsData: data
          };
          setProfileData(updatedProfileData);
          await offlineSyncService.saveOfflineData({ profile: updatedProfileData });
        }
      } else {
        // Modo offline: actualizar datos localmente
        console.log('📱 Modo offline: actualizando metas localmente');
        const updatedProfileData = {
          ...profileData,
          goalsData: data
        };
        setProfileData(updatedProfileData);
        await offlineSyncService.saveOfflineData({ profile: updatedProfileData });
      }
    } catch (error) {
      console.error('Error actualizando metas:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [profileData]);

  const resetIsNewUser = useCallback(() => {
    console.log('🔄 Reseteando isNewUser a false');
    setIsNewUser(false);
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    profileData,
    isNewUser,
    register,
    login,
    logout,
    getProfile,
    updateProfile,
    forgotPassword,
    resetPassword,
    changePassword,
    verifyEmail,
    deleteAccount,
    checkConnection,
    resetIsNewUser,
    getProfileData,
    updateBiometricData,
    updateGoalsData,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
