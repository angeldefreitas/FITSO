import { FoodItem } from '../../../types/food';
import { aves } from './aves';
import { carnesRojas } from './carnesRojas';
import { embutidos } from './embutidos';

// Combinar todas las subcategorías de carnes
export const carnes: FoodItem[] = [
  ...aves,
  ...carnesRojas,
  ...embutidos
];

// Exportar subcategorías individuales
export {
  aves,
  carnesRojas,
  embutidos
};







