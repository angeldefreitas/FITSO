import { FoodItem } from '../../../types/food';
import { granosEnteros } from './granosEnteros';
import { pseudocereales } from './pseudocereales';
import { arroz } from './arroz';
import { pasta } from './pasta';
import { pan } from './pan';

// Combinar todas las subcategorías de cereales
export const cereales: FoodItem[] = [
  ...granosEnteros,
  ...pseudocereales,
  ...arroz,
  ...pasta,
  ...pan
];

// Exportar subcategorías individuales
export {
  granosEnteros,
  pseudocereales,
  arroz,
  pasta,
  pan
};






