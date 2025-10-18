import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from '../services/apiService';

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

// Función para obtener claves específicas por usuario
const getStorageKeys = (userId: string) => ({
  USER_PROFILE: `@fitso_user_profile_${userId}`,
  APP_STATE: `@fitso_app_state_${userId}`,
});

// Verificar si es la primera vez
export async function isFirstTimeUser(userId: string): Promise<boolean> {
  try {
    const storageKeys = getStorageKeys(userId);
    const appStateJson = await AsyncStorage.getItem(storageKeys.APP_STATE);
    if (!appStateJson) return true;
    
    const appState: AppState = JSON.parse(appStateJson);
    return !appState.hasCompletedOnboarding;
  } catch (error) {
    console.error('Error checking first time user:', error);
    return true;
  }
}

// Obtener perfil del usuario
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const storageKeys = getStorageKeys(userId);
    const profileJson = await AsyncStorage.getItem(storageKeys.USER_PROFILE);
    return profileJson ? JSON.parse(profileJson) : null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
}

// Guardar perfil del usuario
export async function saveUserProfile(profile: UserProfile, userId: string): Promise<{ success: boolean; error?: string }> {
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
    
    // Crear perfil en el backend (en background, no bloquear)
    console.log('🔄 Creando perfil en el backend (background)...');
    const createBackendProfile = async () => {
      try {
        const { default: profileService } = await import('../services/profileService');
        
        // Mapear campos locales a campos del backend
        const backendData = {
          age: profile.age,
          heightCm: profile.height,
          weightKg: profile.weight,
          gender: (profile.gender === 'masculino' ? 'male' : 'female') as 'male' | 'female',
          activityLevel: (profile.activityLevel === 'sedentario' ? 'sedentary' :
                        profile.activityLevel === 'ligero' ? 'light' :
                        profile.activityLevel === 'moderado' ? 'moderate' :
                        profile.activityLevel === 'intenso' ? 'very_active' : 'moderate') as 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active',
          goal: profile.goal,
          weightGoalAmount: profile.weightGoalAmount || 0.5
        };
        
        console.log('🔄 Enviando datos al backend:', backendData);
        await profileService.updateBiometricData(backendData);
        console.log('✅ Perfil creado en el backend');
      } catch (backendError) {
        console.error('⚠️ Error creando perfil en backend:', backendError);
      }
    };
    
    // Ejecutar en background sin bloquear
    createBackendProfile();
    
    // Guardar perfil con clave específica del usuario
    const storageKeys = getStorageKeys(userId);
    await AsyncStorage.setItem(storageKeys.USER_PROFILE, JSON.stringify(profile));
    
    // Marcar onboarding como completado
    const appState: AppState = {
      isFirstTime: false,
      hasCompletedOnboarding: true,
      userProfile: profile,
    };
    await AsyncStorage.setItem(storageKeys.APP_STATE, JSON.stringify(appState));
    
    console.log('✅ Perfil guardado exitosamente:', profile.id);
    return { success: true };
    
  } catch (error) {
    console.error('❌ Error saving profile:', error);
    return { success: false, error: 'Error interno del sistema' };
  }
}

// Actualizar perfil existente
export async function updateUserProfile(updates: Partial<UserProfile>, userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('🔄 Actualizando perfil para usuario:', userId, 'con updates:', updates);
    
    // Actualizar en el backend
    try {
      const { default: profileService } = await import('../services/profileService');
      
      // Mapear campos locales a campos del backend
      const backendUpdates: any = {};
      if (updates.weight !== undefined) backendUpdates.weightKg = updates.weight;
      if (updates.height !== undefined) backendUpdates.heightCm = updates.height;
      if (updates.age !== undefined) backendUpdates.age = updates.age;
      if (updates.gender !== undefined) {
        backendUpdates.gender = updates.gender === 'masculino' ? 'male' : 'female';
      }
      if (updates.activityLevel !== undefined) {
        const activityMap: { [key: string]: string } = {
          'sedentario': 'sedentary',
          'ligero': 'light',
          'moderado': 'moderate',
          'intenso': 'very_active'
        };
        backendUpdates.activityLevel = activityMap[updates.activityLevel] || updates.activityLevel;
      }
      if (updates.goal !== undefined) backendUpdates.goal = updates.goal;
      if (updates.weightGoalAmount !== undefined) backendUpdates.weightGoalAmount = updates.weightGoalAmount;

      // Solo actualizar si hay campos para enviar
      if (Object.keys(backendUpdates).length > 0) {
        console.log('🔄 Enviando actualización al backend:', backendUpdates);
        const response = await profileService.updateBiometricData(backendUpdates);
        console.log('✅ Perfil actualizado en backend');
      }
      
      // Si se está actualizando el peso, crear un registro de progreso
      if (updates.weight) {
        try {
          console.log('🔄 Peso cambiado en perfil, creando registro de progreso...');
          const { default: progressService } = await import('../services/progressService');
          const today = new Date().toISOString().split('T')[0];

          // Verificar si ya existe un peso para hoy
          const existingEntries = await progressService.getWeightEntriesByDate(today);

          if (existingEntries.entries && existingEntries.entries.length > 0) {
            // Actualizar el peso existente de hoy
            await progressService.updateWeightEntry(existingEntries.entries[0].id, {
              weight: updates.weight,
              entry_date: today
            });
            console.log('✅ Peso de hoy actualizado en progreso');
          } else {
            // Crear nuevo registro de peso para hoy
            await progressService.addWeightEntry({
              weight: updates.weight,
              entry_date: today
            });
            console.log('✅ Nuevo registro de peso creado para hoy');
          }
        } catch (progressError) {
          console.error('⚠️ Error creando registro de progreso:', progressError);
          // No fallar la actualización del perfil por esto
        }
      }
      
      return { success: true };
    } catch (backendError) {
      console.error('❌ Error actualizando perfil en backend:', backendError);
      return { success: false, error: 'Error actualizando perfil en backend' };
    }
  } catch (error) {
    console.error('❌ Error updating profile:', error);
    return { success: false, error: 'Error interno del sistema' };
  }
}

// Obtener estado completo de la app
export async function getAppState(userId: string): Promise<AppState> {
  try {
    console.log('🔍 Verificando estado de la app para usuario:', userId);
    
    // Primero intentar cargar desde el backend
    const { default: profileService } = await import('../services/profileService');
    const profileData = await profileService.getProfile();
    
    console.log('🔍 DEBUG - Datos del backend:', JSON.stringify(profileData, null, 2));
    console.log('🔍 DEBUG - profileData existe:', !!profileData);
    console.log('🔍 DEBUG - profileData.profile existe:', !!profileData?.profile);
    console.log('🔍 DEBUG - profileData.biometricData existe:', !!profileData?.biometricData);
    
    if (profileData && profileData.profile && profileData.biometricData) {
      console.log('✅ Perfil encontrado en backend, usuario existente');
      return {
        isFirstTime: false,
        hasCompletedOnboarding: true,
        userProfile: {
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
        },
      };
    } else {
      console.log('⚠️ No se encontró perfil real en backend (solo datos por defecto), usuario nuevo');
      console.log('🔍 DEBUG - Razón: profileData=', !!profileData, 'profile=', !!profileData?.profile, 'biometricData=', !!profileData?.biometricData);
      return {
        isFirstTime: true,
        hasCompletedOnboarding: false,
        userProfile: null,
      };
    }
    
    // Si no se encuentra en backend, intentar desde AsyncStorage
    const storageKeys = getStorageKeys(userId);
    const appStateJson = await AsyncStorage.getItem(storageKeys.APP_STATE);
    const profile = await getUserProfile(userId);
    
    if (!appStateJson) {
      console.log('❌ No hay datos en AsyncStorage, usuario nuevo');
      return {
        isFirstTime: true,
        hasCompletedOnboarding: false,
        userProfile: null,
      };
    }
    
    const appState: AppState = JSON.parse(appStateJson);
    console.log('✅ Datos encontrados en AsyncStorage');
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
export async function clearAllData(userId: string): Promise<void> {
  try {
    const storageKeys = getStorageKeys(userId);
    await AsyncStorage.multiRemove([
      storageKeys.USER_PROFILE,
      storageKeys.APP_STATE,
    ]);
    console.log('🧹 Todos los datos locales eliminados para usuario:', userId);
  } catch (error) {
    console.error('❌ Error clearing data:', error);
  }
}
