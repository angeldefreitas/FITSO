import apiService, { ApiResponse, AuthResponse, User } from './apiService';
import userAuthService from './userAuthService';

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateProfileData {
  name?: string;
  email?: string;
}

class AuthService {
  // Registro de usuario
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>('/auth/register', data);
    
    if (response.success && response.data) {
      // Establecer usuario actual y guardar token
      await userAuthService.setCurrentUser(response.data.user.id);
      await apiService.setToken(response.data.token, response.data.user.id);
      return response.data;
    }
    
    throw new Error(response.message || 'Error en el registro');
  }

  // Login de usuario
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>('/auth/login', data);
    
    if (response.success && response.data) {
      // Establecer usuario actual y guardar token
      await userAuthService.setCurrentUser(response.data.user.id);
      await apiService.setToken(response.data.token, response.data.user.id);
      return response.data;
    }
    
    throw new Error(response.message || 'Error en el login');
  }

  // Logout
  async logout(): Promise<void> {
    await userAuthService.clearCurrentUser();
    await apiService.clearToken();
  }

  // Obtener perfil del usuario actual
  async getProfile(): Promise<User> {
    const response = await apiService.get<{ user: User }>('/auth/profile');
    
    if (response.success && response.data) {
      return response.data.user;
    }
    
    throw new Error(response.message || 'Error obteniendo perfil');
  }

  // Actualizar perfil
  async updateProfile(data: UpdateProfileData): Promise<User> {
    const response = await apiService.put<{ user: User }>('/auth/profile', data);
    
    if (response.success && response.data) {
      return response.data.user;
    }
    
    throw new Error(response.message || 'Error actualizando perfil');
  }

  // Solicitar reset de contraseña
  async forgotPassword(data: ForgotPasswordData): Promise<void> {
    const response = await apiService.post('/auth/forgot-password', data);
    
    if (!response.success) {
      throw new Error(response.message || 'Error solicitando reset de contraseña');
    }
  }

  // Reset de contraseña
  async resetPassword(data: ResetPasswordData): Promise<void> {
    const response = await apiService.post('/auth/reset-password', data);
    
    if (!response.success) {
      throw new Error(response.message || 'Error reseteando contraseña');
    }
  }

  // Cambiar contraseña
  async changePassword(data: ChangePasswordData): Promise<void> {
    const response = await apiService.put('/auth/change-password', data);
    
    if (!response.success) {
      throw new Error(response.message || 'Error cambiando contraseña');
    }
  }

  // Verificar email
  async verifyEmail(token: string): Promise<void> {
    const response = await apiService.post('/auth/verify-email', { token });
    
    if (!response.success) {
      throw new Error(response.message || 'Error verificando email');
    }
  }

  // Verificar si el usuario está autenticado
  isAuthenticated(): boolean {
    return apiService['token'] !== null;
  }

  // Obtener token actual
  getToken(): string | null {
    return apiService['token'];
  }

  // Eliminar cuenta
  async deleteAccount(): Promise<void> {
    const response = await apiService.delete('/auth/account');
    
    if (!response.success) {
      throw new Error(response.message || 'Error eliminando cuenta');
    }
  }

  // Verificar conexión con el servidor
  async checkConnection(): Promise<boolean> {
    try {
      const response = await apiService.healthCheck();
      return response.success;
    } catch (error) {
      console.error('Error verificando conexión:', error);
      return false;
    }
  }
}

export default new AuthService();
