import { FoodItem } from '../../../types/food';
import { nueces } from './nueces';
import { semillas } from './semillas';

// Combinar todas las subcategorías de frutos secos
export const frutosSecos: FoodItem[] = [
  ...nueces,
  ...semillas
];

// Exportar subcategorías individuales
export {
  nueces,
  semillas
};

