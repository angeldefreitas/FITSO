import { FoodItem, FoodCategory, FoodSubcategory, FoodSearchFilters, FoodDatabaseStats } from '../types/food';

// Importar todas las categorías
import { carnes } from '../data/foods/carnes';
import { lacteos } from '../data/foods/lacteos';
import { frutosSecos } from '../data/foods/frutos-secos';
import { frutas } from '../data/foods/frutas';
import { verduras } from '../data/foods/verduras';
import { cereales } from '../data/foods/cereales';
import { legumbres } from '../data/foods/legumbres';
import { pescados } from '../data/foods/pescados';
import { mariscos } from '../data/foods/mariscos';
import { bebidas } from '../data/foods/bebidas';
import { snacks } from '../data/foods/snacks';
import { condimentos } from '../data/foods/condimentos';
import { aceites } from '../data/foods/aceites';

// Base de datos consolidada
const FOOD_DATABASE: FoodItem[] = [
  ...carnes,
  ...lacteos,
  ...frutosSecos,
  ...frutas,
  ...verduras,
  ...cereales,
  ...legumbres,
  ...pescados,
  ...mariscos,
  ...bebidas,
  ...snacks,
  ...condimentos,
  ...aceites,
];

class FoodService {
  private foods: FoodItem[] = FOOD_DATABASE;

  /**
   * Obtener todos los alimentos
   */
  getAllFoods(): FoodItem[] {
    return [...this.foods];
  }

  /**
   * Buscar alimentos por filtros
   */
  searchFoods(filters: FoodSearchFilters = {}): FoodItem[] {
    let results = [...this.foods];

    // Filtrar por categoría
    if (filters.category) {
      results = results.filter(food => food.category === filters.category);
    }

    // Filtrar por subcategoría
    if (filters.subcategory) {
      results = results.filter(food => food.subcategory === filters.subcategory);
    }

    // Filtrar por búsqueda de texto
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      results = results.filter(food => 
        food.name.toLowerCase().includes(query) ||
        food.description?.toLowerCase().includes(query) ||
        food.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Filtrar por tags
    if (filters.tags && filters.tags.length > 0) {
      results = results.filter(food => 
        food.tags?.some(tag => filters.tags!.includes(tag))
      );
    }

    // Filtrar por calorías máximas
    if (filters.maxCalories) {
      results = results.filter(food => food.calories <= filters.maxCalories!);
    }

    // Filtrar por proteína mínima
    if (filters.minProtein) {
      results = results.filter(food => food.protein >= filters.minProtein!);
    }

    return results;
  }

  /**
   * Obtener alimento por ID
   */
  getFoodById(id: string): FoodItem | undefined {
    return this.foods.find(food => food.id === id);
  }

  /**
   * Obtener alimentos por categoría
   */
  getFoodsByCategory(category: FoodCategory): FoodItem[] {
    return this.foods.filter(food => food.category === category);
  }

  /**
   * Obtener alimentos por subcategoría
   */
  getFoodsBySubcategory(subcategory: FoodSubcategory): FoodItem[] {
    return this.foods.filter(food => food.subcategory === subcategory);
  }

  /**
   * Obtener todas las categorías disponibles
   */
  getCategories(): FoodCategory[] {
    const categories = new Set(this.foods.map(food => food.category));
    return Array.from(categories).sort();
  }

  /**
   * Obtener todas las subcategorías disponibles
   */
  getSubcategories(): FoodSubcategory[] {
    const subcategories = new Set(this.foods.map(food => food.subcategory));
    return Array.from(subcategories).sort();
  }

  /**
   * Obtener subcategorías por categoría
   */
  getSubcategoriesByCategory(category: FoodCategory): FoodSubcategory[] {
    const subcategories = new Set(
      this.foods
        .filter(food => food.category === category)
        .map(food => food.subcategory)
    );
    return Array.from(subcategories).sort();
  }

  /**
   * Obtener estadísticas de la base de datos
   */
  getDatabaseStats(): FoodDatabaseStats {
    const categories: Record<FoodCategory, number> = {} as Record<FoodCategory, number>;
    const subcategories: Record<FoodSubcategory, number> = {} as Record<FoodSubcategory, number>;

    // Contar por categorías
    this.foods.forEach(food => {
      categories[food.category] = (categories[food.category] || 0) + 1;
      subcategories[food.subcategory] = (subcategories[food.subcategory] || 0) + 1;
    });

    return {
      totalFoods: this.foods.length,
      categories,
      subcategories
    };
  }

  /**
   * Obtener alimentos sugeridos basados en búsqueda
   */
  getSuggestedFoods(query: string, limit: number = 5): FoodItem[] {
    if (!query.trim()) return [];

    const results = this.searchFoods({ searchQuery: query });
    return results.slice(0, limit);
  }

  /**
   * Obtener alimentos populares (más buscados)
   * Por ahora devuelve los primeros alimentos, pero se podría implementar
   * un sistema de tracking de búsquedas
   */
  getPopularFoods(limit: number = 10): FoodItem[] {
    return this.foods.slice(0, limit);
  }

  /**
   * Obtener alimentos por rango de calorías
   */
  getFoodsByCalorieRange(minCalories: number, maxCalories: number): FoodItem[] {
    return this.foods.filter(food => 
      food.calories >= minCalories && food.calories <= maxCalories
    );
  }

  /**
   * Obtener alimentos altos en proteína
   */
  getHighProteinFoods(minProtein: number = 20): FoodItem[] {
    return this.foods
      .filter(food => food.protein >= minProtein)
      .sort((a, b) => b.protein - a.protein);
  }

  /**
   * Obtener alimentos bajos en calorías
   */
  getLowCalorieFoods(maxCalories: number = 100): FoodItem[] {
    return this.foods
      .filter(food => food.calories <= maxCalories)
      .sort((a, b) => a.calories - b.calories);
  }
}

// Exportar instancia singleton
export const foodService = new FoodService();
export default foodService;
