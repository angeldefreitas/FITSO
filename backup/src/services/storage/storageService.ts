import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Servicio centralizado para operaciones de almacenamiento
 */

export class StorageService {
  // Claves de almacenamiento
  static readonly KEYS = {
    DAILY_MEALS: '@fitso_daily_meals',
    WATER_TRACKING: '@fitso_water_tracking',
    CUSTOM_FOODS: '@fitso_custom_foods',
    USER_PROFILE: '@fitso_user_profile',
  };

  // Métodos genéricos
  static async getItem<T>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Error getting item ${key}:`, error);
      return null;
    }
  }

  static async setItem<T>(key: string, value: T): Promise<boolean> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error setting item ${key}:`, error);
      return false;
    }
  }

  static async removeItem(key: string): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing item ${key}:`, error);
      return false;
    }
  }

  static async clear(): Promise<boolean> {
    try {
      await AsyncStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing storage:', error);
      return false;
    }
  }

  // Métodos específicos para comidas
  static async getMeals() {
    return this.getItem(this.KEYS.DAILY_MEALS);
  }

  static async saveMeals(meals: any[]) {
    return this.setItem(this.KEYS.DAILY_MEALS, meals);
  }

  // Métodos específicos para agua
  static async getWaterData() {
    return this.getItem(this.KEYS.WATER_TRACKING);
  }

  static async saveWaterData(waterData: any) {
    return this.setItem(this.KEYS.WATER_TRACKING, waterData);
  }

  // Métodos específicos para comidas personalizadas
  static async getCustomFoods() {
    return this.getItem(this.KEYS.CUSTOM_FOODS);
  }

  static async saveCustomFoods(foods: any[]) {
    return this.setItem(this.KEYS.CUSTOM_FOODS, foods);
  }

  // Métodos específicos para perfil de usuario
  static async getUserProfile() {
    return this.getItem(this.KEYS.USER_PROFILE);
  }

  static async saveUserProfile(profile: any) {
    return this.setItem(this.KEYS.USER_PROFILE, profile);
  }
}
