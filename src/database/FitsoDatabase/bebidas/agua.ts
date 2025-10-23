import { FoodItem } from '../../../types/food';

export const agua: FoodItem[] = [
  {
    id: 'agua_001',
    name: 'Agua',
    nameTranslations: {
      es: 'Agua',
      en: 'Water',
      pt: 'Água'
    },
    description: 'Agua pura sin calorías',
    descriptionTranslations: {
      es: 'Agua pura sin calorías',
      en: 'Pure water with no calories',
      pt: 'Água pura sem calorias'
    },
    brand: 'Generic',
    calories: 0,
    protein: 0.0,
    carbs: 0.0,
    fat: 0.0,
    fiber: 0.0,
    sugar: 0.0,
    sodium: 0,
    servingSize: '100ml',
    category: 'bebidas',
    subcategory: 'agua',
    tags: ['hidratación', 'sin calorías', 'agua'],
    tagsTranslations: {
      es: ['hidratación', 'sin calorías', 'agua'],
      en: ['hydration', 'no calories', 'water'],
      pt: ['hidratação', 'sem calorias', 'água']
    },
    isCustom: false
  },
  {
    id: 'agua_002',
    name: 'Agua con Gas',
    nameTranslations: {
      es: 'Agua con Gas',
      en: 'Sparkling Water',
      pt: 'Água com Gás'
    },
    description: 'Agua con gas sin calorías',
    descriptionTranslations: {
      es: 'Agua con gas sin calorías',
      en: 'Sparkling water with no calories',
      pt: 'Água com gás sem calorias'
    },
    brand: 'Generic',
    calories: 0,
    protein: 0.0,
    carbs: 0.0,
    fat: 0.0,
    fiber: 0.0,
    sugar: 0.0,
    sodium: 0,
    servingSize: '100ml',
    category: 'bebidas',
    subcategory: 'agua',
    tags: ['hidratación', 'sin calorías', 'gas', 'agua'],
    tagsTranslations: {
      es: ['hidratación', 'sin calorías', 'gas', 'agua'],
      en: ['hydration', 'no calories', 'sparkling', 'water'],
      pt: ['hidratação', 'sem calorias', 'gás', 'água']
    },
    isCustom: false
  },
  {
    id: 'agua_003',
    name: 'Agua de Coco',
    nameTranslations: {
      es: 'Agua de Coco',
      en: 'Coconut Water',
      pt: 'Água de Coco'
    },
    description: 'Agua de coco natural rica en electrolitos',
    descriptionTranslations: {
      es: 'Agua de coco natural rica en electrolitos',
      en: 'Natural coconut water rich in electrolytes',
      pt: 'Água de coco natural rica em eletrólitos'
    },
    brand: 'Generic',
    calories: 19,
    protein: 0.7,
    carbs: 3.7,
    fat: 0.2,
    fiber: 1.1,
    sugar: 2.6,
    sodium: 105,
    servingSize: '100ml',
    category: 'bebidas',
    subcategory: 'agua',
    tags: ['electrolitos', 'hidratación', 'coco', 'agua'],
    tagsTranslations: {
      es: ['electrolitos', 'hidratación', 'coco', 'agua'],
      en: ['electrolytes', 'hydration', 'coconut', 'water'],
      pt: ['eletrólitos', 'hidratação', 'coco', 'água']
    },
    isCustom: false
  }
];

