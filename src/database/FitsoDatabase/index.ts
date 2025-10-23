import { FoodItem } from '../../types/food';
import { frutas } from './frutas';
import { verduras } from './verduras';
import { carnes } from './carnes';
import { pescados } from './pescados';
import { lacteos } from './lacteos';
import { cereales } from './cereales';
import { frutosSecos } from './frutosSecos';
import { legumbres } from './legumbres';
import { aceites } from './aceites';
import { bebidas } from './bebidas';
import { snacks } from './snacks';
import { condimentos } from './condimentos';
import { mariscos } from './mariscos';
import { foodTranslationService, TranslatedFoodItem } from '../../services/foodTranslationService';

// Combinar todas las categorías en una sola base de datos
export const fitsoFoodDatabase: FoodItem[] = [
  ...frutas,
  ...verduras,
  ...carnes,
  ...pescados,
  ...lacteos,
  ...cereales,
  ...frutosSecos,
  ...legumbres,
  ...aceites,
  ...bebidas,
  ...snacks,
  ...condimentos,
  ...mariscos
];

// Función para obtener alimentos por categoría (traducidos)
export const getFoodsByCategory = (category: string): TranslatedFoodItem[] => {
  return foodTranslationService.getFoodsByCategory(fitsoFoodDatabase, category);
};

// Función para obtener subcategorías de una categoría
export const getSubcategoriesByCategory = (category: string): string[] => {
  return foodTranslationService.getSubcategoriesByCategory(fitsoFoodDatabase, category);
};

// Función para buscar alimentos por texto (traducidos)
export const searchFoods = (query: string, category?: string, subcategory?: string): TranslatedFoodItem[] => {
  return foodTranslationService.searchFoods(fitsoFoodDatabase, query, category, subcategory);
};

// Función para obtener todas las categorías disponibles
export const getAllCategories = (): string[] => {
  return foodTranslationService.getAllCategories(fitsoFoodDatabase);
};

// Función para obtener estadísticas de la base de datos
export const getDatabaseStats = () => {
  const totalFoods = fitsoFoodDatabase.length;
  const categories = getAllCategories();
  const categoryStats = categories.map(category => ({
    category,
    count: getFoodsByCategory(category).length,
    subcategories: getSubcategoriesByCategory(category).length
  }));

  return {
    totalFoods,
    totalCategories: categories.length,
    categoryStats
  };
};

// Exportar categorías individuales para uso específico
export {
  frutas,
  verduras,
  carnes,
  pescados,
  lacteos,
  cereales,
  frutosSecos,
  legumbres,
  aceites,
  bebidas,
  snacks,
  condimentos,
  mariscos
};

// Re-exportar tipos para conveniencia
export type { FoodItem } from '../../types/food';
