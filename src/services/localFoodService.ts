import AsyncStorage from '@react-native-async-storage/async-storage';
import { fitsoFoodDatabase, FoodItem } from '../database/FitsoDatabase';
import { foodTranslationService, TranslatedFoodItem, SupportedLanguage } from './foodTranslationService';

const LOCAL_FOODS_KEY = '@fitso_local_foods';
const DATABASE_VERSION_KEY = '@fitso_database_version';
const CURRENT_VERSION = '3.1.0';

export class LocalFoodService {
  // Cargar alimentos desde AsyncStorage
  static async loadLocalFoods(): Promise<FoodItem[]> {
    try {
      const stored = await AsyncStorage.getItem(LOCAL_FOODS_KEY);
      if (stored) {
        const foods = JSON.parse(stored);
        console.log('✅ Alimentos locales cargados:', foods.length);
        return foods;
      }
      return [];
    } catch (error) {
      console.error('❌ Error cargando alimentos locales:', error);
      return [];
    }
  }

  // Guardar alimentos en AsyncStorage
  static async saveLocalFoods(foods: FoodItem[]): Promise<void> {
    try {
      await AsyncStorage.setItem(LOCAL_FOODS_KEY, JSON.stringify(foods));
      console.log('✅ Alimentos locales guardados:', foods.length);
    } catch (error) {
      console.error('❌ Error guardando alimentos locales:', error);
    }
  }

  // Inicializar base de datos local si no existe o está desactualizada
  static async initializeLocalDatabase(): Promise<FoodItem[]> {
    try {
      const currentVersion = await AsyncStorage.getItem(DATABASE_VERSION_KEY);
      
      // Si no hay versión o es diferente, inicializar la base de datos
      if (!currentVersion || currentVersion !== CURRENT_VERSION) {
        console.log('🌱 Inicializando base de datos local de alimentos...');
        
        // Guardar la base de datos completa
        await this.saveLocalFoods(fitsoFoodDatabase);
        await AsyncStorage.setItem(DATABASE_VERSION_KEY, CURRENT_VERSION);
        
        console.log(`✅ Base de datos local inicializada con ${fitsoFoodDatabase.length} alimentos`);
        console.log('🔍 Primeros 3 alimentos de fitsoFoodDatabase:', fitsoFoodDatabase.slice(0, 3).map(f => ({ name: f.name, category: f.category })));
        return fitsoFoodDatabase;
      }

      // Si ya existe, cargar desde AsyncStorage
      const localFoods = await this.loadLocalFoods();
      console.log(`📱 Alimentos cargados desde AsyncStorage: ${localFoods.length}`);
      if (localFoods.length === 0) {
        // Si está vacía, inicializar
        console.log('🔄 AsyncStorage vacío, inicializando...');
        await this.saveLocalFoods(fitsoFoodDatabase);
        return fitsoFoodDatabase;
      }

      console.log('🔍 Primeros 3 alimentos desde AsyncStorage:', localFoods.slice(0, 3).map(f => ({ name: f.name, category: f.category })));
      return localFoods;
    } catch (error) {
      console.error('❌ Error inicializando base de datos local:', error);
      return [];
    }
  }

  // Buscar alimentos locales (con traducciones)
  static async searchLocalFoods(query: string, category?: string, subcategory?: string, language?: SupportedLanguage): Promise<TranslatedFoodItem[]> {
    try {
      const localFoods = await this.loadLocalFoods();
      
      // Establecer el idioma si se proporciona
      if (language) {
        foodTranslationService.setLanguage(language);
      }
      
      // Usar el servicio de traducción para buscar
      return foodTranslationService.searchFoods(localFoods, query, category, subcategory);
    } catch (error) {
      console.error('❌ Error buscando alimentos locales:', error);
      return [];
    }
  }

  // Obtener alimentos por categoría (con traducciones)
  static async getFoodsByCategory(category: string, language?: SupportedLanguage): Promise<TranslatedFoodItem[]> {
    try {
      const localFoods = await this.loadLocalFoods();
      
      // Establecer el idioma si se proporciona
      if (language) {
        foodTranslationService.setLanguage(language);
      }
      
      return foodTranslationService.getFoodsByCategory(localFoods, category);
    } catch (error) {
      console.error('❌ Error obteniendo alimentos por categoría:', error);
      return [];
    }
  }

  // Obtener categorías disponibles
  static async getAvailableCategories(): Promise<string[]> {
    try {
      const localFoods = await this.loadLocalFoods();
      const categories = [...new Set(localFoods.map(food => food.category))];
      return categories.filter(cat => cat && cat.trim() !== '');
    } catch (error) {
      console.error('❌ Error obteniendo categorías:', error);
      return [];
    }
  }

  // Obtener subcategorías de una categoría
  static async getSubcategoriesByCategory(category: string): Promise<string[]> {
    try {
      const localFoods = await this.loadLocalFoods();
      const foods = localFoods.filter(food => food.category === category);
      const subcategories = [...new Set(foods.map(food => food.subcategory))];
      return subcategories.filter(sub => sub && sub.trim() !== '');
    } catch (error) {
      console.error('❌ Error obteniendo subcategorías:', error);
      return [];
    }
  }

  // Obtener estadísticas de la base de datos local
  static async getLocalDatabaseStats() {
    try {
      const localFoods = await this.loadLocalFoods();
      const totalFoods = localFoods.length;
      const categories = await this.getAvailableCategories();
      const categoryStats = await Promise.all(
        categories.map(async category => ({
          category,
          count: localFoods.filter(food => food.category === category).length,
          subcategories: (await this.getSubcategoriesByCategory(category)).length
        }))
      );

      return {
        totalFoods,
        totalCategories: categories.length,
        categoryStats,
        version: CURRENT_VERSION
      };
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      return {
        totalFoods: 0,
        totalCategories: 0,
        categoryStats: [],
        version: CURRENT_VERSION
      };
    }
  }

  // Limpiar base de datos local (para testing)
  static async clearLocalDatabase(): Promise<void> {
    try {
      await AsyncStorage.removeItem(LOCAL_FOODS_KEY);
      await AsyncStorage.removeItem(DATABASE_VERSION_KEY);
      console.log('✅ Base de datos local limpiada');
    } catch (error) {
      console.error('❌ Error limpiando base de datos local:', error);
    }
  }

  // Forzar recarga de la base de datos
  static async forceReloadDatabase(): Promise<FoodItem[]> {
    try {
      console.log('🔄 Forzando recarga de la base de datos...');
      await this.clearLocalDatabase();
      return await this.initializeLocalDatabase();
    } catch (error) {
      console.error('❌ Error forzando recarga:', error);
      return [];
    }
  }

  // Método para verificar si la base de datos necesita actualización
  static async needsUpdate(): Promise<boolean> {
    try {
      const currentVersion = await AsyncStorage.getItem(DATABASE_VERSION_KEY);
      return !currentVersion || currentVersion !== CURRENT_VERSION;
    } catch (error) {
      console.error('❌ Error verificando versión:', error);
      return true;
    }
  }
}
