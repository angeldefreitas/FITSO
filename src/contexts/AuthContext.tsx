import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Alert } from 'react-native';
import authService, { RegisterData, LoginData, ForgotPasswordData, ResetPasswordData, ChangePasswordData, UpdateProfileData } from '../services/authService';
import profileService, { BiometricData, GoalsData, ProfileResponse, ProfileUpdateResponse } from '../services/profileService';
import apiService, { User } from '../services/apiService';

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

  const checkAuthStatus = useCallback(async () => {
    try {
      setLoading(true);
      
      // Verificar si hay token almacenado
      const token = await authService.getToken();
      if (!token) {
        console.log('ℹ️ No hay token almacenado');
        setUser(null);
        return;
      }

      // Si hay token, intentar obtener el perfil
      try {
        const userProfile = await authService.getProfile();
        setUser(userProfile);
      } catch (error) {
        console.log('❌ Token inválido, limpiando sesión');
        apiService.clearToken();
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

  const register = async (data: RegisterData) => {
    try {
      setLoading(true);
      const response = await authService.register(data);
      setUser(response.user);
      setIsNewUser(true); // Marcar como usuario nuevo
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
  };

  const getProfile = async () => {
    try {
      setLoading(true);
      const userProfile = await authService.getProfile();
      setUser(userProfile);
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
    return await authService.checkConnection();
  };

  // Funciones de perfil
  const getProfileData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await profileService.getProfile();
      setProfileData(data);
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
      const response = await profileService.updateBiometricData(data);
      console.log('🔍 Respuesta del backend updateBiometricData:', JSON.stringify(response, null, 2));
      
      // Verificar que response.biometricData existe
      if (!response.biometricData) {
        throw new Error('Respuesta del backend no contiene biometricData');
      }
      
      // Mantener los datos de metas existentes y solo actualizar los datos biométricos
      setProfileData(prevData => ({
        ...prevData,
        biometricData: response.biometricData
      }));
    } catch (error) {
      console.error('Error actualizando datos biométricos:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateGoalsData = useCallback(async (data: GoalsData) => {
    try {
      setLoading(true);
      const response = await profileService.updateGoalsData(data);
      console.log('🔍 Respuesta del backend updateGoalsData:', JSON.stringify(response, null, 2));
      
      // Verificar que response.goalsData existe
      if (!response.goalsData) {
        throw new Error('Respuesta del backend no contiene goalsData');
      }
      
      // Mantener los datos biométricos existentes y solo actualizar las metas
      setProfileData(prevData => ({
        ...prevData,
        goalsData: response.goalsData
      }));
    } catch (error) {
      console.error('Error actualizando metas:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

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
