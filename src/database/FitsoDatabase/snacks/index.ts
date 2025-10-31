import { FoodItem } from '../../../types/food';
import { snacksSalados } from './snacksSalados';
import { dulces } from './dulces';

// Combinar todas las subcategorías de snacks
export const snacks: FoodItem[] = [
  ...snacksSalados,
  ...dulces
];

// Exportar subcategorías individuales
export {
  snacksSalados,
  dulces
};







