import { FoodItem } from '../../../types/food';
import { leche } from './leche';
import { yogur } from './yogur';
import { quesos } from './quesos';
import { huevos } from './huevos';

// Combinar todas las subcategorías de lácteos
export const lacteos: FoodItem[] = [
  ...leche,
  ...yogur,
  ...quesos,
  ...huevos
];

// Exportar subcategorías individuales
export {
  leche,
  yogur,
  quesos,
  huevos
};

