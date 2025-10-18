import AsyncStorage from '@react-native-async-storage/async-storage';

// Tipos para el perfil del usuario
export interface UserProfile {
  id: string;
  name: string;
  age: number;
  weight: number; // en kg
  height: number; // en cm
  gender: 'masculino' | 'femenino';
  activityLevel: 'sedentario' | 'ligero' | 'moderado' | 'intenso';
  goal: 'lose_weight' | 'gain_weight' | 'maintain_weight';
  weightGoalAmount?: number; // cantidad de kg por semana (solo para lose_weight y gain_weight)
  customNutritionGoals?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  createdAt: string;
  lastUpdated: string;
}

export interface AppState {
  isFirstTime: boolean;
  hasCompletedOnboarding: boolean;
  userProfile: UserProfile | null;
}

// Claves para AsyncStorage
const STORAGE_KEYS = {
  USER_PROFILE: '@fitso_user_profile',
  APP_STATE: '@fitso_app_state',
};

// Verificar si es la primera vez
export async function isFirstTimeUser(): Promise<boolean> {
  try {
    const appStateJson = await AsyncStorage.getItem(STORAGE_KEYS.APP_STATE);
    if (!appStateJson) return true;
    
    const appState: AppState = JSON.parse(appStateJson);
    return !appState.hasCompletedOnboarding;
  } catch (error) {
    console.error('Error checking first time user:', error);
    return true;
  }
}

// Obtener perfil del usuario
export async function getUserProfile(): Promise<UserProfile | null> {
  try {
    const profileJson = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    return profileJson ? JSON.parse(profileJson) : null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
}

// Guardar perfil del usuario
export async function saveUserProfile(profile: UserProfile): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('💾 Guardando perfil del usuario:', profile.name);
    
    // Validaciones básicas
    if (!profile.name || profile.name.trim().length < 2) {
      return { success: false, error: 'El nombre debe tener al menos 2 caracteres' };
    }
    
    if (profile.age < 13 || profile.age > 120) {
      return { success: false, error: 'La edad debe estar entre 13 y 120 años' };
    }
    
    if (profile.weight < 20 || profile.weight > 300) {
      return { success: false, error: 'El peso debe estar entre 20 y 300 kg' };
    }
    
    if (profile.height < 100 || profile.height > 250) {
      return { success: false, error: 'La altura debe estar entre 100 y 250 cm' };
    }
    
    // Generar ID único si no existe
    if (!profile.id) {
      profile.id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    }
    
    // Actualizar timestamps
    const now = new Date().toISOString();
    profile.lastUpdated = now;
    if (!profile.createdAt) {
      profile.createdAt = now;
    }
    
    // Guardar perfil
    await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
    
    // Marcar onboarding como completado
    const appState: AppState = {
      isFirstTime: false,
      hasCompletedOnboarding: true,
      userProfile: profile,
    };
    await AsyncStorage.setItem(STORAGE_KEYS.APP_STATE, JSON.stringify(appState));
    
    console.log('✅ Perfil guardado exitosamente:', profile.id);
    return { success: true };
    
  } catch (error) {
    console.error('❌ Error saving profile:', error);
    return { success: false, error: 'Error interno del sistema' };
  }
}

// Actualizar perfil existente
export async function updateUserProfile(updates: Partial<UserProfile>): Promise<{ success: boolean; error?: string }> {
  try {
    const currentProfile = await getUserProfile();
    if (!currentProfile) {
      return { success: false, error: 'No hay perfil para actualizar' };
    }
    
    const updatedProfile: UserProfile = {
      ...currentProfile,
      ...updates,
      lastUpdated: new Date().toISOString(),
    };
    
    return await saveUserProfile(updatedProfile);
  } catch (error) {
    console.error('❌ Error updating profile:', error);
    return { success: false, error: 'Error interno del sistema' };
  }
}

// Obtener estado completo de la app
export async function getAppState(): Promise<AppState> {
  try {
    const appStateJson = await AsyncStorage.getItem(STORAGE_KEYS.APP_STATE);
    const profile = await getUserProfile();
    
    if (!appStateJson) {
      return {
        isFirstTime: true,
        hasCompletedOnboarding: false,
        userProfile: null,
      };
    }
    
    const appState: AppState = JSON.parse(appStateJson);
    return {
      ...appState,
      userProfile: profile,
    };
  } catch (error) {
    console.error('❌ Error getting app state:', error);
    return {
      isFirstTime: true,
      hasCompletedOnboarding: false,
      userProfile: null,
    };
  }
}

// Calcular IMC
export function calculateBMI(weight: number, height: number): number {
  const heightInMeters = height / 100;
  return Math.round((weight / (heightInMeters * heightInMeters)) * 10) / 10;
}

// Obtener categoría de IMC
export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return 'Bajo peso';
  if (bmi < 25) return 'Peso normal';
  if (bmi < 30) return 'Sobrepeso';
  return 'Obesidad';
}

// Limpiar todos los datos (para testing)
export async function clearAllData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.USER_PROFILE,
      STORAGE_KEYS.APP_STATE,
    ]);
    console.log('🧹 Todos los datos locales eliminados');
  } catch (error) {
    console.error('❌ Error clearing data:', error);
  }
}
