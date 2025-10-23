import { FoodItem } from '../types/food';
import { useLanguage } from '../contexts/LanguageContext';
import { translateCategoryStatic, translateSubcategoryStatic } from '../utils/categoryTranslations';

// Importar las traducciones directamente
import esTranslations from '../locales/es.json';
import enTranslations from '../locales/en.json';
import ptTranslations from '../locales/pt.json';

const translations = {
  es: esTranslations,
  en: enTranslations,
  pt: ptTranslations
};

// Función auxiliar para obtener traducciones
const getTranslation = (key: string, language: SupportedLanguage): string => {
  const keys = key.split('.');
  let value: any = translations[language];
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return key; // Fallback al key original si no se encuentra
    }
  }
  
  return typeof value === 'string' ? value : key;
};

export type SupportedLanguage = 'es' | 'en' | 'pt';

export interface TranslatedFoodItem extends Omit<FoodItem, 'name' | 'description' | 'tags'> {
  name: string;
  description?: string;
  tags?: string[];
  translatedCategory: string; // Categoría traducida
  translatedSubcategory: string; // Subcategoría traducida
}

/**
 * Servicio para manejar las traducciones de alimentos
 */
export class FoodTranslationService {
  private static instance: FoodTranslationService;
  private currentLanguage: SupportedLanguage = 'es';

  private constructor() {
    // Inicializar con español por defecto
    this.currentLanguage = 'es';
    console.log('🏗️ Servicio de traducción inicializado con idioma:', this.currentLanguage);
  }

  public static getInstance(): FoodTranslationService {
    if (!FoodTranslationService.instance) {
      FoodTranslationService.instance = new FoodTranslationService();
    }
    return FoodTranslationService.instance;
  }

  /**
   * Establece el idioma actual
   */
  public setLanguage(language: SupportedLanguage): void {
    console.log(`🌍 Estableciendo idioma del servicio de traducción a: ${language}`);
    this.currentLanguage = language;
  }

  /**
   * Obtiene el idioma actual
   */
  public getCurrentLanguage(): SupportedLanguage {
    return this.currentLanguage;
  }

  /**
   * Traduce un alimento al idioma actual
   */
  public translateFood(food: FoodItem): TranslatedFoodItem {
    const translated: TranslatedFoodItem = {
      ...food,
      name: this.getTranslatedName(food),
      description: this.getTranslatedDescription(food),
      tags: this.getTranslatedTags(food),
      translatedCategory: this.getTranslatedCategory(food.category),
      translatedSubcategory: this.getTranslatedSubcategory(food.subcategory)
    };

    return translated;
  }

  /**
   * Traduce una lista de alimentos al idioma actual
   */
  public translateFoods(foods: FoodItem[]): TranslatedFoodItem[] {
    return foods.map(food => this.translateFood(food));
  }

  /**
   * Obtiene el nombre traducido de un alimento
   */
  private getTranslatedName(food: FoodItem): string {
    console.log(`🔍 Debug traducción para "${food.name}":`);
    console.log(`  - Idioma actual: ${this.currentLanguage}`);
    console.log(`  - nameTranslations existe: ${!!food.nameTranslations}`);
    if (food.nameTranslations) {
      console.log(`  - nameTranslations:`, food.nameTranslations);
      console.log(`  - Traducción para ${this.currentLanguage}: ${food.nameTranslations[this.currentLanguage]}`);
    }
    
    if (food.nameTranslations && food.nameTranslations[this.currentLanguage]) {
      console.log(`🌍 Traduciendo "${food.name}" a ${this.currentLanguage}: "${food.nameTranslations[this.currentLanguage]}"`);
      return food.nameTranslations[this.currentLanguage];
    }
    console.log(`⚠️ No hay traducción para "${food.name}" en ${this.currentLanguage}, usando original`);
    return food.name; // Fallback al nombre original
  }

  /**
   * Obtiene la descripción traducida de un alimento
   */
  private getTranslatedDescription(food: FoodItem): string | undefined {
    if (food.descriptionTranslations && food.descriptionTranslations[this.currentLanguage]) {
      return food.descriptionTranslations[this.currentLanguage];
    }
    return food.description; // Fallback a la descripción original
  }

  /**
   * Obtiene las etiquetas traducidas de un alimento
   */
  private getTranslatedTags(food: FoodItem): string[] | undefined {
    if (food.tagsTranslations && food.tagsTranslations[this.currentLanguage]) {
      return food.tagsTranslations[this.currentLanguage];
    }
    return food.tags; // Fallback a las etiquetas originales
  }

  /**
   * Obtiene la categoría traducida
   */
  private getTranslatedCategory(category: string): string {
    return translateCategoryStatic(category, (key: string) => getTranslation(key, this.currentLanguage));
  }

  /**
   * Obtiene la subcategoría traducida
   */
  private getTranslatedSubcategory(subcategory: string): string {
    return translateSubcategoryStatic(subcategory, (key: string) => getTranslation(key, this.currentLanguage));
  }

  /**
   * Busca alimentos por texto en el idioma actual
   */
  public searchFoods(foods: FoodItem[], query: string, category?: string, subcategory?: string): TranslatedFoodItem[] {
    let results = foods;

    // Filtrar por categoría si se especifica
    if (category) {
      results = results.filter(food => food.category === category);
    }

    // Filtrar por subcategoría si se especifica
    if (subcategory) {
      results = results.filter(food => food.subcategory === subcategory);
    }

    // Filtrar por texto de búsqueda en el idioma actual
    if (query && query.trim().length >= 2) {
      const searchQuery = query.toLowerCase();
      results = results.filter(food => {
        const translatedName = this.getTranslatedName(food).toLowerCase();
        const translatedDescription = this.getTranslatedDescription(food)?.toLowerCase() || '';
        const translatedTags = this.getTranslatedTags(food) || [];
        const translatedTagsString = translatedTags.join(' ').toLowerCase();
        const translatedCategory = this.getTranslatedCategory(food.category).toLowerCase();
        const translatedSubcategory = this.getTranslatedSubcategory(food.subcategory).toLowerCase();
        
        return (
          translatedName.includes(searchQuery) ||
          translatedDescription.includes(searchQuery) ||
          food.brand?.toLowerCase().includes(searchQuery) ||
          translatedTagsString.includes(searchQuery) ||
          translatedCategory.includes(searchQuery) ||
          translatedSubcategory.includes(searchQuery)
        );
      });
    }

    // SIEMPRE traducir los resultados, independientemente de si hay búsqueda o no
    return this.translateFoods(results);
  }

  /**
   * Obtiene alimentos por categoría traducidos
   */
  public getFoodsByCategory(foods: FoodItem[], category: string): TranslatedFoodItem[] {
    const filteredFoods = foods.filter(food => food.category === category);
    return this.translateFoods(filteredFoods);
  }

  /**
   * Obtiene subcategorías de una categoría (traducidas si es necesario)
   */
  public getSubcategoriesByCategory(foods: FoodItem[], category: string): string[] {
    const categoryFoods = foods.filter(food => food.category === category);
    const subcategories = [...new Set(categoryFoods.map(food => food.subcategory))];
    return subcategories.filter(sub => sub && sub.trim() !== '');
  }

  /**
   * Obtiene todas las categorías disponibles
   */
  public getAllCategories(foods: FoodItem[]): string[] {
    const categories = [...new Set(foods.map(food => food.category))];
    return categories.filter(cat => cat && cat.trim() !== '');
  }
}

// Instancia singleton
export const foodTranslationService = FoodTranslationService.getInstance();
