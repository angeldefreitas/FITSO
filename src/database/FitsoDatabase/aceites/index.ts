import { FoodItem } from '../../../types/food';
import { aceitesVegetales } from './aceitesVegetales';
import { grasasAnimales } from './grasasAnimales';

// Combinar todas las subcategorías de aceites
export const aceites: FoodItem[] = [
  ...aceitesVegetales,
  ...grasasAnimales
];

// Exportar subcategorías individuales
export {
  aceitesVegetales,
  grasasAnimales
};






