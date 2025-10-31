import { FoodItem } from '../../../types/food';
import { frutasFrescas } from './frutasFrescas';
import { frutasTropicales } from './frutasTropicales';
import { citricos } from './citricos';
import { frutosRojos } from './frutosRojos';

// Combinar todas las subcategorías de frutas
export const frutas: FoodItem[] = [
  ...frutasFrescas,
  ...frutasTropicales,
  ...citricos,
  ...frutosRojos
];

// Exportar subcategorías individuales
export {
  frutasFrescas,
  frutasTropicales,
  citricos,
  frutosRojos
};







