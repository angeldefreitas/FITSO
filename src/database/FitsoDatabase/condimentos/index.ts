import { FoodItem } from '../../../types/food';
import { sales } from './sales';
import { especias } from './especias';

// Combinar todas las subcategorías de condimentos
export const condimentos: FoodItem[] = [
  ...sales,
  ...especias
];

// Exportar subcategorías individuales
export {
  sales,
  especias
};



