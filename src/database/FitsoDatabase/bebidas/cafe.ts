import { FoodItem } from '../../../types/food';

export const cafe: FoodItem[] = [
  {
    id: 'cafe_001',
    name: 'Café Negro',
    nameTranslations: {
      es: 'Café Negro',
      en: 'Black Coffee',
      pt: 'Café Preto'
    },
    description: 'Café negro sin azúcar ni leche',
    descriptionTranslations: {
      es: 'Café negro sin azúcar ni leche',
      en: 'Black coffee without sugar or milk',
      pt: 'Café preto sem açúcar nem leite'
    },
    brand: 'Generic',
    calories: 2,
    protein: 0.3,
    carbs: 0.0,
    fat: 0.0,
    fiber: 0.0,
    sugar: 0.0,
    sodium: 5,
    servingSize: '100ml',
    category: 'bebidas',
    subcategory: 'cafe',
    tags: ['cafeína', 'antioxidantes', 'negro', 'café'],
    tagsTranslations: {
      es: ['cafeína', 'antioxidantes', 'negro', 'café'],
      en: ['caffeine', 'antioxidants', 'black', 'coffee'],
      pt: ['cafeína', 'antioxidantes', 'preto', 'café']
    },
    isCustom: false
  },
  {
    id: 'cafe_002',
    name: 'Café con Leche',
    nameTranslations: {
      es: 'Café con Leche',
      en: 'Coffee with Milk',
      pt: 'Café com Leite'
    },
    description: 'Café con leche entera',
    descriptionTranslations: {
      es: 'Café con leche entera',
      en: 'Coffee with whole milk',
      pt: 'Café com leite integral'
    },
    brand: 'Generic',
    calories: 37,
    protein: 1.5,
    carbs: 2.8,
    fat: 2.0,
    fiber: 0.0,
    sugar: 2.8,
    sodium: 20,
    servingSize: '100ml',
    category: 'bebidas',
    subcategory: 'cafe',
    tags: ['cafeína', 'leche', 'café'],
    tagsTranslations: {
      es: ['cafeína', 'leche', 'café'],
      en: ['caffeine', 'milk', 'coffee'],
      pt: ['cafeína', 'leite', 'café']
    },
    isCustom: false
  },
  {
    id: 'cafe_003',
    name: 'Café Descafeinado',
    nameTranslations: {
      es: 'Café Descafeinado',
      en: 'Decaffeinated Coffee',
      pt: 'Café Descafeinado'
    },
    description: 'Café descafeinado sin cafeína',
    descriptionTranslations: {
      es: 'Café descafeinado sin cafeína',
      en: 'Decaffeinated coffee without caffeine',
      pt: 'Café descafeinado sem cafeína'
    },
    brand: 'Generic',
    calories: 2,
    protein: 0.3,
    carbs: 0.0,
    fat: 0.0,
    fiber: 0.0,
    sugar: 0.0,
    sodium: 5,
    servingSize: '100ml',
    category: 'bebidas',
    subcategory: 'cafe',
    tags: ['sin cafeína', 'antioxidantes', 'descafeinado', 'café'],
    tagsTranslations: {
      es: ['sin cafeína', 'antioxidantes', 'descafeinado', 'café'],
      en: ['caffeine-free', 'antioxidants', 'decaffeinated', 'coffee'],
      pt: ['sem cafeína', 'antioxidantes', 'descafeinado', 'café']
    },
    isCustom: false
  },
  {
    id: 'cafe_004',
    name: 'Espresso',
    nameTranslations: {
      es: 'Espresso',
      en: 'Espresso',
      pt: 'Espresso'
    },
    description: 'Espresso concentrado',
    descriptionTranslations: {
      es: 'Espresso concentrado',
      en: 'Concentrated espresso',
      pt: 'Espresso concentrado'
    },
    brand: 'Generic',
    calories: 2,
    protein: 0.3,
    carbs: 0.0,
    fat: 0.0,
    fiber: 0.0,
    sugar: 0.0,
    sodium: 5,
    servingSize: '100ml',
    category: 'bebidas',
    subcategory: 'cafe',
    tags: ['cafeína', 'concentrado', 'espresso', 'café'],
    tagsTranslations: {
      es: ['cafeína', 'concentrado', 'espresso', 'café'],
      en: ['caffeine', 'concentrated', 'espresso', 'coffee'],
      pt: ['cafeína', 'concentrado', 'espresso', 'café']
    },
    isCustom: false
  }
];

