import { FoodItem } from '../../../types/food';

export const leche: FoodItem[] = [
  {
    id: 'leche_001',
    name: 'Leche Entera',
    nameTranslations: {
      es: 'Leche Entera',
      en: 'Whole Milk',
      pt: 'Leite Integral'
    },
    description: 'Leche de vaca entera rica en calcio y proteína',
    descriptionTranslations: {
      es: 'Leche de vaca entera rica en calcio y proteína',
      en: 'Whole cow milk rich in calcium and protein',
      pt: 'Leite de vaca integral rico em cálcio e proteína'
    },
    brand: 'Generic',
    calories: 61,
    protein: 3.2,
    carbs: 4.8,
    fat: 3.3,
    fiber: 0.0,
    sugar: 4.8,
    sodium: 40,
    servingSize: '100ml',
    category: 'lacteos',
    subcategory: 'leche',
    tags: ['calcio', 'proteína', 'entera', 'leche'],
    tagsTranslations: {
      es: ['calcio', 'proteína', 'entera', 'leche'],
      en: ['calcium', 'protein', 'whole', 'milk'],
      pt: ['cálcio', 'proteína', 'integral', 'leite']
    },
    isCustom: false
  },
  {
    id: 'leche_002',
    name: 'Leche Semidesnatada',
    nameTranslations: {
      es: 'Leche Semidesnatada',
      en: 'Semi-skimmed Milk',
      pt: 'Leite Semi-desnatado'
    },
    description: 'Leche de vaca semidesnatada con menos grasa',
    descriptionTranslations: {
      es: 'Leche de vaca semidesnatada con menos grasa',
      en: 'Semi-skimmed cow milk with less fat',
      pt: 'Leite de vaca semi-desnatado com menos gordura'
    },
    brand: 'Generic',
    calories: 46,
    protein: 3.4,
    carbs: 4.8,
    fat: 1.6,
    fiber: 0.0,
    sugar: 4.8,
    sodium: 40,
    servingSize: '100ml',
    category: 'lacteos',
    subcategory: 'leche',
    tags: ['calcio', 'proteína', 'semidesnatada', 'leche'],
    tagsTranslations: {
      es: ['calcio', 'proteína', 'semidesnatada', 'leche'],
      en: ['calcium', 'protein', 'semi-skimmed', 'milk'],
      pt: ['cálcio', 'proteína', 'semi-desnatado', 'leite']
    },
    isCustom: false
  },
  {
    id: 'leche_003',
    name: 'Leche Desnatada',
    nameTranslations: {
      es: 'Leche Desnatada',
      en: 'Skimmed Milk',
      pt: 'Leite Desnatado'
    },
    description: 'Leche de vaca desnatada sin grasa',
    descriptionTranslations: {
      es: 'Leche de vaca desnatada sin grasa',
      en: 'Skimmed cow milk without fat',
      pt: 'Leite de vaca desnatado sem gordura'
    },
    brand: 'Generic',
    calories: 34,
    protein: 3.4,
    carbs: 4.8,
    fat: 0.1,
    fiber: 0.0,
    sugar: 4.8,
    sodium: 40,
    servingSize: '100ml',
    category: 'lacteos',
    subcategory: 'leche',
    tags: ['calcio', 'proteína', 'desnatada', 'leche'],
    tagsTranslations: {
      es: ['calcio', 'proteína', 'desnatada', 'leche'],
      en: ['calcium', 'protein', 'skimmed', 'milk'],
      pt: ['cálcio', 'proteína', 'desnatado', 'leite']
    },
    isCustom: false
  },
  {
    id: 'leche_004',
    name: 'Leche de Cabra',
    nameTranslations: {
      es: 'Leche de Cabra',
      en: 'Goat Milk',
      pt: 'Leite de Cabra'
    },
    description: 'Leche de cabra rica en calcio y proteína',
    descriptionTranslations: {
      es: 'Leche de cabra rica en calcio y proteína',
      en: 'Goat milk rich in calcium and protein',
      pt: 'Leite de cabra rico em cálcio e proteína'
    },
    brand: 'Generic',
    calories: 69,
    protein: 3.6,
    carbs: 4.5,
    fat: 4.1,
    fiber: 0.0,
    sugar: 4.5,
    sodium: 50,
    servingSize: '100ml',
    category: 'lacteos',
    subcategory: 'leche',
    tags: ['calcio', 'proteína', 'cabra', 'leche'],
    tagsTranslations: {
      es: ['calcio', 'proteína', 'cabra', 'leche'],
      en: ['calcium', 'protein', 'goat', 'milk'],
      pt: ['cálcio', 'proteína', 'cabra', 'leite']
    },
    isCustom: false
  },
  {
    id: 'leche_005',
    name: 'Leche de Oveja',
    nameTranslations: {
      es: 'Leche de Oveja',
      en: 'Sheep Milk',
      pt: 'Leite de Ovelha'
    },
    description: 'Leche de oveja rica en calcio y grasa',
    descriptionTranslations: {
      es: 'Leche de oveja rica en calcio y grasa',
      en: 'Sheep milk rich in calcium and fat',
      pt: 'Leite de ovelha rico em cálcio e gordura'
    },
    brand: 'Generic',
    calories: 108,
    protein: 5.4,
    carbs: 4.5,
    fat: 7.0,
    fiber: 0.0,
    sugar: 4.5,
    sodium: 50,
    servingSize: '100ml',
    category: 'lacteos',
    subcategory: 'leche',
    tags: ['calcio', 'proteína', 'oveja', 'grasa'],
    tagsTranslations: {
      es: ['calcio', 'proteína', 'oveja', 'grasa'],
      en: ['calcium', 'protein', 'sheep', 'fat'],
      pt: ['cálcio', 'proteína', 'ovelha', 'gordura']
    },
    isCustom: false
  },
  {
    id: 'leche_006',
    name: 'Leche de Almendras',
    nameTranslations: {
      es: 'Leche de Almendras',
      en: 'Almond Milk',
      pt: 'Leite de Amêndoas'
    },
    description: 'Leche vegetal de almendras',
    descriptionTranslations: {
      es: 'Leche vegetal de almendras',
      en: 'Plant-based almond milk',
      pt: 'Leite vegetal de amêndoas'
    },
    brand: 'Generic',
    calories: 17,
    protein: 0.6,
    carbs: 0.6,
    fat: 1.1,
    fiber: 0.4,
    sugar: 0.0,
    sodium: 63,
    servingSize: '100ml',
    category: 'lacteos',
    subcategory: 'leche',
    tags: ['vegetal', 'almendras', 'sin lactosa', 'leche'],
    tagsTranslations: {
      es: ['vegetal', 'almendras', 'sin lactosa', 'leche'],
      en: ['plant-based', 'almonds', 'lactose-free', 'milk'],
      pt: ['vegetal', 'amêndoas', 'sem lactose', 'leite']
    },
    isCustom: false
  },
  {
    id: 'leche_007',
    name: 'Leche de Avena',
    nameTranslations: {
      es: 'Leche de Avena',
      en: 'Oat Milk',
      pt: 'Leite de Aveia'
    },
    description: 'Leche vegetal de avena',
    descriptionTranslations: {
      es: 'Leche vegetal de avena',
      en: 'Plant-based oat milk',
      pt: 'Leite vegetal de aveia'
    },
    brand: 'Generic',
    calories: 43,
    protein: 1.0,
    carbs: 6.7,
    fat: 1.3,
    fiber: 0.8,
    sugar: 2.1,
    sodium: 50,
    servingSize: '100ml',
    category: 'lacteos',
    subcategory: 'leche',
    tags: ['vegetal', 'avena', 'sin lactosa', 'leche'],
    tagsTranslations: {
      es: ['vegetal', 'avena', 'sin lactosa', 'leche'],
      en: ['plant-based', 'oats', 'lactose-free', 'milk'],
      pt: ['vegetal', 'aveia', 'sem lactose', 'leite']
    },
    isCustom: false
  },
  {
    id: 'leche_008',
    name: 'Leche de Soja',
    nameTranslations: {
      es: 'Leche de Soja',
      en: 'Soy Milk',
      pt: 'Leite de Soja'
    },
    description: 'Leche vegetal de soja',
    descriptionTranslations: {
      es: 'Leche vegetal de soja',
      en: 'Plant-based soy milk',
      pt: 'Leite vegetal de soja'
    },
    brand: 'Generic',
    calories: 33,
    protein: 2.9,
    carbs: 1.8,
    fat: 1.8,
    fiber: 0.6,
    sugar: 0.0,
    sodium: 51,
    servingSize: '100ml',
    category: 'lacteos',
    subcategory: 'leche',
    tags: ['vegetal', 'soja', 'sin lactosa', 'leche'],
    tagsTranslations: {
      es: ['vegetal', 'soja', 'sin lactosa', 'leche'],
      en: ['plant-based', 'soy', 'lactose-free', 'milk'],
      pt: ['vegetal', 'soja', 'sem lactose', 'leite']
    },
    isCustom: false
  },
  {
    id: 'leche_009',
    name: 'Leche de Arroz',
    nameTranslations: {
      es: 'Leche de Arroz',
      en: 'Rice Milk',
      pt: 'Leite de Arroz'
    },
    description: 'Leche vegetal de arroz',
    descriptionTranslations: {
      es: 'Leche vegetal de arroz',
      en: 'Plant-based rice milk',
      pt: 'Leite vegetal de arroz'
    },
    brand: 'Generic',
    calories: 47,
    protein: 0.3,
    carbs: 9.0,
    fat: 1.0,
    fiber: 0.3,
    sugar: 5.3,
    sodium: 39,
    servingSize: '100ml',
    category: 'lacteos',
    subcategory: 'leche',
    tags: ['vegetal', 'arroz', 'sin lactosa', 'leche'],
    tagsTranslations: {
      es: ['vegetal', 'arroz', 'sin lactosa', 'leche'],
      en: ['plant-based', 'rice', 'lactose-free', 'milk'],
      pt: ['vegetal', 'arroz', 'sem lactose', 'leite']
    },
    isCustom: false
  },
  {
    id: 'leche_010',
    name: 'Leche de Cáñamo',
    nameTranslations: {
      es: 'Leche de Cáñamo',
      en: 'Hemp Milk',
      pt: 'Leite de Cânhamo'
    },
    description: 'Leche vegetal de cáñamo',
    descriptionTranslations: {
      es: 'Leche vegetal de cáñamo',
      en: 'Plant-based hemp milk',
      pt: 'Leite vegetal de cânhamo'
    },
    brand: 'Generic',
    calories: 24,
    protein: 0.6,
    carbs: 0.5,
    fat: 2.0,
    fiber: 0.0,
    sugar: 0.0,
    sodium: 39,
    servingSize: '100ml',
    category: 'lacteos',
    subcategory: 'leche',
    tags: ['vegetal', 'cáñamo', 'sin lactosa', 'leche'],
    tagsTranslations: {
      es: ['vegetal', 'cáñamo', 'sin lactosa', 'leche'],
      en: ['plant-based', 'hemp', 'lactose-free', 'milk'],
      pt: ['vegetal', 'cânhamo', 'sem lactose', 'leite']
    },
    isCustom: false
  },
  {
    id: 'leche_011',
    name: 'Leche de Avena Sin Azúcar',
    nameTranslations: {
      es: 'Leche de Avena Sin Azúcar',
      en: 'Unsweetened Oat Milk',
      pt: 'Leite de Aveia Sem Açúcar'
    },
    description: 'Leche vegetal de avena sin azúcar añadido',
    descriptionTranslations: {
      es: 'Leche vegetal de avena sin azúcar añadido',
      en: 'Plant-based oat milk without added sugar',
      pt: 'Leite vegetal de aveia sem açúcar adicionado'
    },
    brand: 'Generic',
    calories: 43,
    protein: 1.0,
    carbs: 6.7,
    fat: 1.3,
    fiber: 0.8,
    sugar: 2.1,
    sodium: 50,
    servingSize: '100ml',
    category: 'lacteos',
    subcategory: 'leche',
    tags: ['vegetal', 'avena', 'sin azúcar', 'leche'],
    tagsTranslations: {
      es: ['vegetal', 'avena', 'sin azúcar', 'leche'],
      en: ['plant-based', 'oats', 'unsweetened', 'milk'],
      pt: ['vegetal', 'aveia', 'sem açúcar', 'leite']
    },
    isCustom: false
  },
  {
    id: 'leche_012',
    name: 'Leche de Coco Sin Azúcar',
    nameTranslations: {
      es: 'Leche de Coco Sin Azúcar',
      en: 'Unsweetened Coconut Milk',
      pt: 'Leite de Coco Sem Açúcar'
    },
    description: 'Leche vegetal de coco sin azúcar',
    descriptionTranslations: {
      es: 'Leche vegetal de coco sin azúcar',
      en: 'Plant-based coconut milk without sugar',
      pt: 'Leite vegetal de coco sem açúcar'
    },
    brand: 'Generic',
    calories: 17,
    protein: 0.6,
    carbs: 0.6,
    fat: 1.1,
    fiber: 0.4,
    sugar: 0.0,
    sodium: 63,
    servingSize: '100ml',
    category: 'lacteos',
    subcategory: 'leche',
    tags: ['vegetal', 'coco', 'sin azúcar', 'leche'],
    tagsTranslations: {
      es: ['vegetal', 'coco', 'sin azúcar', 'leche'],
      en: ['plant-based', 'coconut', 'unsweetened', 'milk'],
      pt: ['vegetal', 'coco', 'sem açúcar', 'leite']
    },
    isCustom: false
  },
  {
    id: 'leche_013',
    name: 'Leche de Anacardos',
    nameTranslations: {
      es: 'Leche de Anacardos',
      en: 'Cashew Milk',
      pt: 'Leite de Castanha de Caju'
    },
    description: 'Leche vegetal de anacardos',
    descriptionTranslations: {
      es: 'Leche vegetal de anacardos',
      en: 'Plant-based cashew milk',
      pt: 'Leite vegetal de castanha de caju'
    },
    brand: 'Generic',
    calories: 25,
    protein: 0.8,
    carbs: 1.0,
    fat: 2.0,
    fiber: 0.0,
    sugar: 0.0,
    sodium: 39,
    servingSize: '100ml',
    category: 'lacteos',
    subcategory: 'leche',
    tags: ['vegetal', 'anacardos', 'sin lactosa', 'leche'],
    tagsTranslations: {
      es: ['vegetal', 'anacardos', 'sin lactosa', 'leche'],
      en: ['plant-based', 'cashews', 'lactose-free', 'milk'],
      pt: ['vegetal', 'castanha de caju', 'sem lactose', 'leite']
    },
    isCustom: false
  },
  {
    id: 'leche_014',
    name: 'Leche de Macadamia',
    nameTranslations: {
      es: 'Leche de Macadamia',
      en: 'Macadamia Milk',
      pt: 'Leite de Macadâmia'
    },
    description: 'Leche vegetal de macadamia',
    descriptionTranslations: {
      es: 'Leche vegetal de macadamia',
      en: 'Plant-based macadamia milk',
      pt: 'Leite vegetal de macadâmia'
    },
    brand: 'Generic',
    calories: 25,
    protein: 0.8,
    carbs: 1.0,
    fat: 2.0,
    fiber: 0.0,
    sugar: 0.0,
    sodium: 39,
    servingSize: '100ml',
    category: 'lacteos',
    subcategory: 'leche',
    tags: ['vegetal', 'macadamia', 'sin lactosa', 'leche'],
    tagsTranslations: {
      es: ['vegetal', 'macadamia', 'sin lactosa', 'leche'],
      en: ['plant-based', 'macadamia', 'lactose-free', 'milk'],
      pt: ['vegetal', 'macadâmia', 'sem lactose', 'leite']
    },
    isCustom: false
  },
  {
    id: 'leche_015',
    name: 'Leche de Avellanas',
    nameTranslations: {
      es: 'Leche de Avellanas',
      en: 'Hazelnut Milk',
      pt: 'Leite de Avelãs'
    },
    description: 'Leche vegetal de avellanas',
    descriptionTranslations: {
      es: 'Leche vegetal de avellanas',
      en: 'Plant-based hazelnut milk',
      pt: 'Leite vegetal de avelãs'
    },
    brand: 'Generic',
    calories: 25,
    protein: 0.8,
    carbs: 1.0,
    fat: 2.0,
    fiber: 0.0,
    sugar: 0.0,
    sodium: 39,
    servingSize: '100ml',
    category: 'lacteos',
    subcategory: 'leche',
    tags: ['vegetal', 'avellanas', 'sin lactosa', 'leche'],
    tagsTranslations: {
      es: ['vegetal', 'avellanas', 'sin lactosa', 'leche'],
      en: ['plant-based', 'hazelnuts', 'lactose-free', 'milk'],
      pt: ['vegetal', 'avelãs', 'sem lactose', 'leite']
    },
    isCustom: false
  }
];
