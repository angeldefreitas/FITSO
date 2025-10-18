import apiService, { ApiResponse } from './apiService';

export interface BiometricData {
  age: number;
  heightCm: number;
  weightKg: number;
  gender: 'male' | 'female';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
}

export interface GoalsData {
  goal: 'lose_weight' | 'gain_weight' | 'maintain_weight';
  weightGoalAmount: number;
  nutritionGoals?: any | null;
}

export interface UserProfile {
  id: string;
  user_id: string;
  age: number;
  gender: string;
  height: number;
  weight: number;
  activity_level: string;
  goal: string;
  target_weight: number;
  created_at: string;
  updated_at: string;
}

export interface ProfileResponse {
  profile?: UserProfile | null;
  biometricData?: BiometricData;
  goalsData?: GoalsData;
  hasProfile?: boolean;
}

export interface ProfileUpdateResponse {
  profile?: UserProfile | null;
  biometricData?: BiometricData;
  goalsData?: GoalsData;
}

class ProfileService {
  // Obtener perfil completo del usuario
  async getProfile(): Promise<ProfileResponse | null> {
    try {
      console.log('🔄 Llamando a /profile...');
      const response = await apiService.get<ProfileResponse>('/profile');
      console.log('🔍 DEBUG - Respuesta completa del backend:', JSON.stringify(response, null, 2));
      
      if (response.success && response.data) {
        console.log('✅ Perfil obtenido del backend:', response.data);
        console.log('🔍 DEBUG - profile existe:', !!response.data.profile);
        console.log('🔍 DEBUG - biometricData existe:', !!response.data.biometricData);
        console.log('🔍 DEBUG - goalsData existe:', !!response.data.goalsData);
        return response.data;
      }
      
      console.log('⚠️ Respuesta del backend sin datos:', response.message);
      return null;
    } catch (error: any) {
      console.log('❌ Error obteniendo perfil del backend:', error.message);
      return null;
    }
  }

  // Actualizar datos biométricos
  async updateBiometricData(data: BiometricData): Promise<ProfileUpdateResponse> {
    const response = await apiService.put<ProfileUpdateResponse>('/profile/biometric', data);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Error actualizando datos biométricos');
  }

  // Actualizar datos de metas
  async updateGoalsData(data: GoalsData): Promise<ProfileUpdateResponse> {
    const response = await apiService.put<ProfileUpdateResponse>('/profile/goals', data);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Error actualizando metas');
  }

  // Actualizar perfil completo (flexible)
  async updateProfile(data: Partial<UserProfile>): Promise<ProfileResponse> {
    const response = await apiService.put<ProfileResponse>('/profile', data);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Error actualizando perfil');
  }

  // Eliminar perfil
  async deleteProfile(): Promise<void> {
    const response = await apiService.delete('/profile');
    
    if (!response.success) {
      throw new Error(response.message || 'Error eliminando perfil');
    }
  }
}

export default new ProfileService();
