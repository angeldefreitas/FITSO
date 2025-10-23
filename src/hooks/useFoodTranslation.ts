import { useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { foodTranslationService, TranslatedFoodItem, SupportedLanguage } from '../services/foodTranslationService';
import { FoodItem } from '../types/food';

/**
 * Hook personalizado para manejar las traducciones de alimentos
 */
export const useFoodTranslation = () => {
  const { currentLanguage } = useLanguage();

  // Actualizar el idioma del servicio cuando cambie el idioma de la app
  useEffect(() => {
    console.log(`🔄 Hook useFoodTranslation: Cambiando idioma a ${currentLanguage}`);
    foodTranslationService.setLanguage(currentLanguage as SupportedLanguage);
  }, [currentLanguage]);

  /**
   * Traduce un alimento al idioma actual
   */
  const translateFood = (food: FoodItem): TranslatedFoodItem => {
    return foodTranslationService.translateFood(food);
  };

  /**
   * Traduce una lista de alimentos al idioma actual
   */
  const translateFoods = (foods: FoodItem[]): TranslatedFoodItem[] => {
    return foodTranslationService.translateFoods(foods);
  };

  /**
   * Busca alimentos por texto en el idioma actual
   */
  const searchFoods = (foods: FoodItem[], query: string, category?: string, subcategory?: string): TranslatedFoodItem[] => {
    return foodTranslationService.searchFoods(foods, query, category, subcategory);
  };

  /**
   * Obtiene alimentos por categoría traducidos
   */
  const getFoodsByCategory = (foods: FoodItem[], category: string): TranslatedFoodItem[] => {
    return foodTranslationService.getFoodsByCategory(foods, category);
  };

  /**
   * Obtiene subcategorías de una categoría
   */
  const getSubcategoriesByCategory = (foods: FoodItem[], category: string): string[] => {
    return foodTranslationService.getSubcategoriesByCategory(foods, category);
  };

  /**
   * Obtiene todas las categorías disponibles
   */
  const getAllCategories = (foods: FoodItem[]): string[] => {
    return foodTranslationService.getAllCategories(foods);
  };

  return {
    translateFood,
    translateFoods,
    searchFoods,
    getFoodsByCategory,
    getSubcategoriesByCategory,
    getAllCategories,
    currentLanguage: currentLanguage as SupportedLanguage
  };
};
