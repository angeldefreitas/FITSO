import { FoodItem } from '../../../types/food';

export const carnes: FoodItem[] = [
  // Pollo
  {
    id: 'pollo-001',
    name: 'Pechuga de pollo',
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    category: 'carnes',
    subcategory: 'pollo',
    servingSize: '100g',
    description: 'Pechuga de pollo sin piel, cocida',
    tags: ['proteína', 'bajo en grasa']
  },
  {
    id: 'pollo-002',
    name: 'Muslo de pollo',
    calories: 209,
    protein: 26,
    carbs: 0,
    fat: 10.9,
    category: 'carnes',
    subcategory: 'pollo',
    servingSize: '100g',
    description: 'Muslo de pollo con piel, cocido',
    tags: ['proteína']
  },
  {
    id: 'pollo-003',
    name: 'Ala de pollo',
    calories: 203,
    protein: 18.3,
    carbs: 0,
    fat: 14.2,
    category: 'carnes',
    subcategory: 'pollo',
    servingSize: '100g',
    description: 'Ala de pollo con piel, cocida',
    tags: ['proteína']
  },

  // Res
  {
    id: 'res-001',
    name: 'Carne de res magra',
    calories: 250,
    protein: 26,
    carbs: 0,
    fat: 17,
    category: 'carnes',
    subcategory: 'res',
    servingSize: '100g',
    description: 'Carne de res magra, cocida',
    tags: ['proteína', 'hierro']
  },
  {
    id: 'res-002',
    name: 'Solomillo de ternera',
    calories: 142,
    protein: 26,
    carbs: 0,
    fat: 3.5,
    category: 'carnes',
    subcategory: 'res',
    servingSize: '100g',
    description: 'Solomillo de ternera, cocido',
    tags: ['proteína', 'bajo en grasa', 'hierro']
  },
  {
    id: 'res-003',
    name: 'Hamburguesa de res',
    calories: 295,
    protein: 17,
    carbs: 0,
    fat: 25,
    category: 'carnes',
    subcategory: 'res',
    servingSize: '100g',
    description: 'Hamburguesa de carne de res',
    tags: ['proteína']
  },

  // Cerdo
  {
    id: 'cerdo-001',
    name: 'Lomo de cerdo',
    calories: 242,
    protein: 27,
    carbs: 0,
    fat: 14,
    category: 'carnes',
    subcategory: 'cerdo',
    servingSize: '100g',
    description: 'Lomo de cerdo magro, cocido',
    tags: ['proteína']
  },
  {
    id: 'cerdo-002',
    name: 'Chuleta de cerdo',
    calories: 231,
    protein: 25,
    carbs: 0,
    fat: 14,
    category: 'carnes',
    subcategory: 'cerdo',
    servingSize: '100g',
    description: 'Chuleta de cerdo, cocida',
    tags: ['proteína']
  },

  // Pavo
  {
    id: 'pavo-001',
    name: 'Pechuga de pavo',
    calories: 135,
    protein: 30,
    carbs: 0,
    fat: 1.7,
    category: 'carnes',
    subcategory: 'pavo',
    servingSize: '100g',
    description: 'Pechuga de pavo sin piel, cocida',
    tags: ['proteína', 'bajo en grasa']
  },
  {
    id: 'pavo-002',
    name: 'Pavo molido',
    calories: 189,
    protein: 22,
    carbs: 0,
    fat: 10,
    category: 'carnes',
    subcategory: 'pavo',
    servingSize: '100g',
    description: 'Carne de pavo molida, cocida',
    tags: ['proteína']
  },

  // Embutidos
  {
    id: 'embutido-001',
    name: 'Jamón serrano',
    calories: 319,
    protein: 30,
    carbs: 0,
    fat: 20,
    sodium: 2080,
    category: 'carnes',
    subcategory: 'embutidos',
    servingSize: '100g',
    description: 'Jamón serrano curado',
    tags: ['proteína', 'alto en sodio']
  },
  {
    id: 'embutido-002',
    name: 'Chorizo',
    calories: 455,
    protein: 24,
    carbs: 2,
    fat: 38,
    sodium: 1780,
    category: 'carnes',
    subcategory: 'embutidos',
    servingSize: '100g',
    description: 'Chorizo español',
    tags: ['proteína', 'alto en sodio', 'alto en grasa']
  },

  // Huevos - fuente esencial de proteína
  {
    id: 'huevo-001',
    name: 'Huevo entero',
    calories: 155,
    protein: 13,
    carbs: 1.1,
    fat: 11,
    category: 'carnes',
    subcategory: 'pollo',
    servingSize: '100g',
    description: 'Huevo de gallina entero, crudo',
    tags: ['proteína completa', 'colina', 'vitamina B12', 'selenio']
  },
  {
    id: 'huevo-002',
    name: 'Huevo cocido',
    calories: 155,
    protein: 13,
    carbs: 1.1,
    fat: 11,
    category: 'carnes',
    subcategory: 'pollo',
    servingSize: '100g',
    description: 'Huevo de gallina cocido',
    tags: ['proteína completa', 'colina', 'vitamina B12', 'selenio']
  },
  {
    id: 'huevo-003',
    name: 'Clara de huevo',
    calories: 52,
    protein: 11,
    carbs: 0.7,
    fat: 0.2,
    category: 'carnes',
    subcategory: 'pollo',
    servingSize: '100g',
    description: 'Clara de huevo cruda',
    tags: ['proteína', 'bajo en calorías', 'sin grasa']
  },
  {
    id: 'huevo-004',
    name: 'Yema de huevo',
    calories: 322,
    protein: 16,
    carbs: 3.6,
    fat: 27,
    category: 'carnes',
    subcategory: 'pollo',
    servingSize: '100g',
    description: 'Yema de huevo cruda',
    tags: ['colina', 'vitamina A', 'vitamina D', 'grasa']
  },
  {
    id: 'huevo-005',
    name: 'Huevo frito',
    calories: 196,
    protein: 13.6,
    carbs: 0.6,
    fat: 15.3,
    category: 'carnes',
    subcategory: 'pollo',
    servingSize: '100g',
    description: 'Huevo frito en aceite',
    tags: ['proteína completa', 'grasa', 'colina']
  },
  {
    id: 'huevo-006',
    name: 'Huevo revuelto',
    calories: 149,
    protein: 9.9,
    carbs: 1.6,
    fat: 10.6,
    category: 'carnes',
    subcategory: 'pollo',
    servingSize: '100g',
    description: 'Huevo revuelto con mantequilla',
    tags: ['proteína', 'colina', 'vitamina B12']
  }
];
