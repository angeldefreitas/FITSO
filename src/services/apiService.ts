// Servicio base para llamadas al API
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../config/i18n';
import userAuthService from './userAuthService';
import NetInfo from '@react-native-community/netinfo';

// Cambiar esta URL por la de tu backend en Render una vez desplegado
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
  private isOnline: boolean = true;
  private offlineMode: boolean = false;
  private failedRequests: number = 0;
  private maxRetries: number = 3;
  private retryDelay: number = 30000; // 30 segundos

  constructor(baseURL: string = BASE_URL) {
    this.baseURL = baseURL;
    // No inicializar token aquí, se hará cuando se necesite
    this.initializeNetworkListener();
  }

  // Inicializar listener de red
  private initializeNetworkListener() {
    NetInfo.addEventListener(state => {
      const wasOnline = this.isOnline;
      this.isOnline = state.isConnected && state.isInternetReachable;
      
      console.log('🌐 Estado de conexión API:', this.isOnline ? 'Online' : 'Offline');
      
      // Si volvió la conexión, resetear contador de fallos
      if (!wasOnline && this.isOnline) {
        console.log('🔄 Conexión restaurada - reseteando modo offline');
        this.offlineMode = false;
        this.failedRequests = 0;
      }
    });
  }

  // Inicializar token cuando se necesite
  private async ensureTokenLoaded() {
    if (!this.token) {
      await this.loadToken();
    }
  }

  // Método público para forzar la carga del token
  async forceLoadToken() {
    await this.ensureTokenLoaded();
  }

  // Verificar si debe usar modo offline
  private shouldUseOfflineMode(): boolean {
    return !this.isOnline || this.offlineMode;
  }

  // Obtener datos offline por defecto
  private getOfflineData(endpoint: string): any {
    const offlineData: { [key: string]: any } = {
      '/profile': {
        success: true,
        message: 'Datos offline',
        data: {
          profile: null,
          biometricData: {
            age: 25,
            heightCm: 175,
            weightKg: 70,
            gender: 'male',
            activityLevel: 'moderate'
          },
          goalsData: {
            goal: 'lose_weight',
            weightGoalAmount: 0.5,
            nutritionGoals: null
          },
          hasProfile: false
        }
      },
      '/progress/weight': {
        success: true,
        message: 'Datos offline',
        data: {
          entries: [],
          stats: {
            avg_weight: 0,
            total_entries: 0
          }
        }
      },
      '/progress/water': {
        success: true,
        message: 'Datos offline',
        data: {
          entries: [],
          stats: {
            total_water: 0,
            total_entries: 0
          }
        }
      }
    };

    return offlineData[endpoint] || {
      success: true,
      message: 'Datos offline',
      data: null
    };
  }

  // Guardar datos para uso offline
  private async saveOfflineData(endpoint: string, data: any) {
    try {
      const key = `@fitso_offline_${endpoint.replace(/\//g, '_')}`;
      await AsyncStorage.setItem(key, JSON.stringify(data));
      console.log('💾 Datos guardados para uso offline:', endpoint);
    } catch (error) {
      console.error('❌ Error guardando datos offline:', error);
    }
  }

  // Cargar datos offline
  private async loadOfflineData(endpoint: string): Promise<any> {
    try {
      const key = `@fitso_offline_${endpoint.replace(/\//g, '_')}`;
      const data = await AsyncStorage.getItem(key);
      if (data) {
        console.log('📱 Datos cargados desde offline:', endpoint);
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('❌ Error cargando datos offline:', error);
    }
    return this.getOfflineData(endpoint);
  }

  // Cargar token del almacenamiento local
  private async loadToken() {
    try {
      // Primero intentar cargar el usuario actual desde el almacenamiento
      const currentUserId = await userAuthService.loadCurrentUser();
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
      'Accept-Language': (i18n as any)?.language?.slice(0,2) || 'en',
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
      // Verificar si debe usar modo offline
      if (this.shouldUseOfflineMode()) {
        console.log('📱 Modo offline - cargando datos locales para:', endpoint);
        return await this.loadOfflineData(endpoint);
      }

      // Asegurar que el token esté cargado
      await this.ensureTokenLoaded();
      
      const url = `${this.baseURL}${endpoint}`;
      
      // Timeout de 10 segundos
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error en la petición');
      }

      // Guardar datos para uso offline
      await this.saveOfflineData(endpoint, data);
      
      // Resetear contador de fallos en caso de éxito
      this.failedRequests = 0;
      this.offlineMode = false;

      return data;
    } catch (error) {
      console.error('Error en API request:', error);
      
      // Incrementar contador de fallos
      this.failedRequests++;
      
      // Si hay muchos fallos, activar modo offline
      if (this.failedRequests >= this.maxRetries) {
        console.log('🚫 Muchos fallos - activando modo offline');
        this.offlineMode = true;
      }
      
      // Si es un error de red, usar datos offline
      if (error.message?.includes('Network request failed') || 
          error.message?.includes('timeout') ||
          error.name === 'AbortError') {
        console.log('🌐 Error de red - usando datos offline');
        return await this.loadOfflineData(endpoint);
      }
      
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

  // Verificar estado de conexión
  isConnected(): boolean {
    return this.isOnline;
  }

  // Verificar si está en modo offline
  isOfflineMode(): boolean {
    return this.offlineMode;
  }

  // Forzar modo offline
  setOfflineMode(offline: boolean) {
    this.offlineMode = offline;
    console.log('🔧 Modo offline:', offline ? 'Activado' : 'Desactivado');
  }

  // Resetear contador de fallos
  resetFailedRequests() {
    this.failedRequests = 0;
    this.offlineMode = false;
    console.log('🔄 Contador de fallos reseteado');
  }
}

export default new ApiService();
