import { FoodItem } from '../../../types/food';
import { lentejas } from './lentejas';
import { garbanzos } from './garbanzos';
import { frijoles } from './frijoles';
import { soja } from './soja';

// Combinar todas las subcategorías de legumbres
export const legumbres: FoodItem[] = [
  ...lentejas,
  ...garbanzos,
  ...frijoles,
  ...soja
];

// Exportar subcategorías individuales
export {
  lentejas,
  garbanzos,
  frijoles,
  soja
};




