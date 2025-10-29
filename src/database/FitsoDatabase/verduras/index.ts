import { FoodItem } from '../../../types/food';
import { hojasVerdes } from './hojasVerdes';
import { raices } from './raices';
import { cruciferas } from './cruciferas';

// Combinar todas las subcategorías de verduras
export const verduras: FoodItem[] = [
  ...hojasVerdes,
  ...raices,
  ...cruciferas
];

// Exportar subcategorías individuales
export {
  hojasVerdes,
  raices,
  cruciferas
};






