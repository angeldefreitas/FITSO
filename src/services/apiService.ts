// Servicio base para llamadas al API
import AsyncStorage from '@react-native-async-storage/async-storage';
import userAuthService from './userAuthService';

// Cambiar esta URL por la de tu backend en Render una vez desplegado
const BASE_URL = __DEV__ 
  ? 'http://localhost:3000/api'  // Desarrollo local
  : 'https://fitso.onrender.com/api'; // Producción en Render

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = BASE_URL) {
    this.baseURL = baseURL;
    // No inicializar token aquí, se hará cuando se necesite
  }

  // Inicializar token cuando se necesite
  private async ensureTokenLoaded() {
    if (!this.token) {
      await this.loadToken();
    }
  }

  // Cargar token del almacenamiento local
  private async loadToken() {
    try {
      // Usar el token del usuario actual
      const currentUserId = userAuthService.getCurrentUserId();
      const token = userAuthService.getCurrentToken();
      
      console.log('🔍 Intentando cargar token:', {
        currentUserId,
        hasToken: !!token,
        tokenPreview: token ? `${token.substring(0, 10)}...` : 'null'
      });
      
      if (token) {
        this.token = token;
        console.log('🔑 Token cargado desde userAuthService para usuario:', currentUserId);
      } else {
        console.log('❌ No hay token disponible para usuario:', currentUserId);
      }
    } catch (error) {
      console.error('Error cargando token:', error);
    }
  }

  // Guardar token
  async setToken(token: string, userId?: string) {
    this.token = token;
    if (userId) {
      try {
        await userAuthService.saveTokenForUser(userId, token);
        console.log(`🔑 Token guardado para usuario ${userId}`);
      } catch (error) {
        console.error('Error guardando token:', error);
      }
    } else {
      // Fallback al método anterior para compatibilidad
      try {
        await AsyncStorage.setItem('auth_token', token);
        console.log('🔑 Token guardado en AsyncStorage (fallback)');
      } catch (error) {
        console.error('Error guardando token:', error);
      }
    }
  }

  // Limpiar token
  async clearToken() {
    this.token = null;
    try {
      await AsyncStorage.removeItem('auth_token');
      console.log('🔑 Token eliminado de AsyncStorage');
    } catch (error) {
      console.error('Error eliminando token:', error);
    }
  }

  // Obtener headers con autenticación
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Método base para hacer requests
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      // Asegurar que el token esté cargado
      await this.ensureTokenLoaded();
      
      const url = `${this.baseURL}${endpoint}`;
      
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error en la petición');
      }

      return data;
    } catch (error) {
      console.error('Error en API request:', error);
      throw error;
    }
  }

  // GET request
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  // POST request
  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT request
  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Health check
  async healthCheck(): Promise<ApiResponse> {
    return this.get('/health');
  }
}

export default new ApiService();
