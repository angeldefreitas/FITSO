import { useTranslation } from 'react-i18next';
import { FoodCategory, FoodSubcategory } from '../types/food';

/**
 * Hook personalizado para traducir categorías y subcategorías de alimentos
 */
export const useCategoryTranslations = () => {
  const { t } = useTranslation();

  /**
   * Traduce una categoría de alimento
   */
  const translateCategory = (category: FoodCategory | string): string => {
    if (category === 'Todos' || category === 'Creado') {
      return category === 'Todos' ? t('food.all') : t('food.addCustom');
    }
    
    const translationKey = `food.categories.${category}`;
    const translated = t(translationKey);
    
    // Si no hay traducción específica, devolver el nombre formateado
    if (translated === translationKey) {
      return category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    
    return translated;
  };

  /**
   * Traduce una subcategoría de alimento
   */
  const translateSubcategory = (subcategory: FoodSubcategory | string): string => {
    const translationKey = `food.subcategories.${subcategory}`;
    const translated = t(translationKey);
    
    // Si no hay traducción específica, devolver el nombre formateado
    if (translated === translationKey) {
      return subcategory.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    
    return translated;
  };

  /**
   * Traduce tanto categoría como subcategoría
   */
  const translateCategoryAndSubcategory = (category: FoodCategory | string, subcategory: FoodSubcategory | string): string => {
    const translatedCategory = translateCategory(category);
    const translatedSubcategory = translateSubcategory(subcategory);
    return `${translatedCategory} • ${translatedSubcategory}`;
  };

  return {
    translateCategory,
    translateSubcategory,
    translateCategoryAndSubcategory
  };
};

/**
 * Función utilitaria para traducir categorías sin hook (para usar en servicios)
 */
export const translateCategoryStatic = (category: FoodCategory | string, t: (key: string) => string): string => {
  if (category === 'Todos' || category === 'Creado') {
    return category === 'Todos' ? t('food.all') : t('food.addCustom');
  }
  
  const translationKey = `food.categories.${category}`;
  const translated = t(translationKey);
  
  // Si no hay traducción específica, devolver el nombre formateado
  if (translated === translationKey) {
    return category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
  
  return translated;
};

/**
 * Función utilitaria para traducir subcategorías sin hook (para usar en servicios)
 */
export const translateSubcategoryStatic = (subcategory: FoodSubcategory | string, t: (key: string) => string): string => {
  const translationKey = `food.subcategories.${subcategory}`;
  const translated = t(translationKey);
  
  // Si no hay traducción específica, devolver el nombre formateado
  if (translated === translationKey) {
    return subcategory.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
  
  return translated;
};
