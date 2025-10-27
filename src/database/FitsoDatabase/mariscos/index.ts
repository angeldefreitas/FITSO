import { FoodItem } from '../../../types/food';
import { crustaceos } from './crustaceos';
import { moluscos } from './moluscos';

// Combinar todas las subcategorías de mariscos
export const mariscos: FoodItem[] = [
  ...crustaceos,
  ...moluscos
];

// Exportar subcategorías individuales
export {
  crustaceos,
  moluscos
};




