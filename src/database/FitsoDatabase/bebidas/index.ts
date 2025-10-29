import { FoodItem } from '../../../types/food';
import { agua } from './agua';
import { cafe } from './cafe';
import { tes } from './tes';
import { zumos } from './zumos';

// Combinar todas las subcategorías de bebidas
export const bebidas: FoodItem[] = [
  ...agua,
  ...cafe,
  ...tes,
  ...zumos
];

// Exportar subcategorías individuales
export {
  agua,
  cafe,
  tes,
  zumos
};






