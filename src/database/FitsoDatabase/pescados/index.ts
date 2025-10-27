import { FoodItem } from '../../../types/food';
import { pescadosGrasos } from './pescadosGrasos';
import { pescadosMagros } from './pescadosMagros';
import { pescadosPlanos } from './pescadosPlanos';

// Combinar todas las subcategorías de pescados
export const pescados: FoodItem[] = [
  ...pescadosGrasos,
  ...pescadosMagros,
  ...pescadosPlanos
];

// Exportar subcategorías individuales
export {
  pescadosGrasos,
  pescadosMagros,
  pescadosPlanos
};




