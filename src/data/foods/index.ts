// Exportar todas las categorías de alimentos
export { carnes } from './carnes';
export { lacteos } from './lacteos';
export { frutosSecos } from './frutos-secos';
export { frutas } from './frutas';
export { verduras } from './verduras';
export { cereales } from './cereales';
export { legumbres } from './legumbres';
export { pescados } from './pescados';
export { mariscos } from './mariscos';
export { bebidas } from './bebidas';
export { snacks } from './snacks';
export { condimentos } from './condimentos';
export { aceites } from './aceites';

// Re-exportar tipos
export type { 
  FoodItem, 
  FoodCategory, 
  FoodSubcategory, 
  FoodSearchFilters, 
  FoodDatabaseStats 
} from '../../types/food';
