const db = require('../src/config/database');

// Base de datos completa de alimentos con datos nutricionales precisos
const comprehensiveFoods = [
  // FRUTAS
  {
    name: 'Manzana',
    calories_per_100g: 52,
    protein_per_100g: 0.3,
    carbs_per_100g: 14,
    fat_per_100g: 0.2,
    fiber_per_100g: 2.4,
    sugar_per_100g: 10.4,
    sodium_per_100g: 1,
    category: 'Fruits',
    subcategory: 'Fresh Fruits',
    tags: ['fruta', 'dulce', 'fibra', 'vitamina'],
    translations: {
      es: { name: 'Manzana', description: 'Fruta dulce rica en fibra y vitamina C' },
      en: { name: 'Apple', description: 'Sweet fruit rich in fiber and vitamin C' },
      pt: { name: 'Maçã', description: 'Fruta doce rica em fibras e vitamina C' }
    },
    synonyms: {
      es: ['manzana', 'fruta', 'poma'],
      en: ['apple', 'fruit', 'pome'],
      pt: ['maçã', 'fruta', 'poma']
    }
  },
  {
    name: 'Plátano',
    calories_per_100g: 89,
    protein_per_100g: 1.1,
    carbs_per_100g: 23,
    fat_per_100g: 0.3,
    fiber_per_100g: 2.6,
    sugar_per_100g: 12.2,
    sodium_per_100g: 1,
    category: 'Fruits',
    subcategory: 'Fresh Fruits',
    tags: ['fruta', 'potasio', 'energía', 'carbohidrato'],
    translations: {
      es: { name: 'Plátano', description: 'Fruta rica en potasio y carbohidratos' },
      en: { name: 'Banana', description: 'Fruit rich in potassium and carbohydrates' },
      pt: { name: 'Banana', description: 'Fruta rica em potássio e carboidratos' }
    },
    synonyms: {
      es: ['plátano', 'banana', 'guineo'],
      en: ['banana', 'plantain', 'fruit'],
      pt: ['banana', 'plátano', 'fruta']
    }
  },
  {
    name: 'Naranja',
    calories_per_100g: 47,
    protein_per_100g: 0.9,
    carbs_per_100g: 12,
    fat_per_100g: 0.1,
    fiber_per_100g: 2.4,
    sugar_per_100g: 9.4,
    sodium_per_100g: 0,
    category: 'Fruits',
    subcategory: 'Citrus Fruits',
    tags: ['cítrico', 'vitamina c', 'fibra', 'antioxidante'],
    translations: {
      es: { name: 'Naranja', description: 'Cítrico rico en vitamina C y antioxidantes' },
      en: { name: 'Orange', description: 'Citrus fruit rich in vitamin C and antioxidants' },
      pt: { name: 'Laranja', description: 'Cítrico rico em vitamina C e antioxidantes' }
    },
    synonyms: {
      es: ['naranja', 'cítrico', 'china'],
      en: ['orange', 'citrus', 'fruit'],
      pt: ['laranja', 'cítrico', 'fruta']
    }
  },
  {
    name: 'Uva',
    calories_per_100g: 67,
    protein_per_100g: 0.6,
    carbs_per_100g: 17,
    fat_per_100g: 0.4,
    fiber_per_100g: 0.9,
    sugar_per_100g: 16,
    sodium_per_100g: 2,
    category: 'Fruits',
    subcategory: 'Fresh Fruits',
    tags: ['fruta', 'antioxidante', 'resveratrol', 'dulce'],
    translations: {
      es: { name: 'Uva', description: 'Fruta rica en antioxidantes y resveratrol' },
      en: { name: 'Grape', description: 'Fruit rich in antioxidants and resveratrol' },
      pt: { name: 'Uva', description: 'Fruta rica em antioxidantes e resveratrol' }
    },
    synonyms: {
      es: ['uva', 'fruta', 'vid'],
      en: ['grape', 'fruit', 'vine'],
      pt: ['uva', 'fruta', 'videira']
    }
  },
  {
    name: 'Fresa',
    calories_per_100g: 32,
    protein_per_100g: 0.7,
    carbs_per_100g: 8,
    fat_per_100g: 0.3,
    fiber_per_100g: 2,
    sugar_per_100g: 4.9,
    sodium_per_100g: 1,
    category: 'Fruits',
    subcategory: 'Berries',
    tags: ['fruta', 'antioxidante', 'vitamina c', 'fibra'],
    translations: {
      es: { name: 'Fresa', description: 'Fruta rica en antioxidantes y vitamina C' },
      en: { name: 'Strawberry', description: 'Fruit rich in antioxidants and vitamin C' },
      pt: { name: 'Morango', description: 'Fruta rica em antioxidantes e vitamina C' }
    },
    synonyms: {
      es: ['fresa', 'frutilla', 'fruta'],
      en: ['strawberry', 'berry', 'fruit'],
      pt: ['morango', 'fruta', 'baga']
    }
  },

  // VERDURAS
  {
    name: 'Tomate',
    calories_per_100g: 18,
    protein_per_100g: 0.9,
    carbs_per_100g: 4,
    fat_per_100g: 0.2,
    fiber_per_100g: 1.2,
    sugar_per_100g: 2.6,
    sodium_per_100g: 5,
    category: 'Vegetables',
    subcategory: 'Nightshades',
    tags: ['verdura', 'licopeno', 'vitamina c', 'antioxidante'],
    translations: {
      es: { name: 'Tomate', description: 'Verdura rica en licopeno y vitamina C' },
      en: { name: 'Tomato', description: 'Vegetable rich in lycopene and vitamin C' },
      pt: { name: 'Tomate', description: 'Vegetal rico em licopeno e vitamina C' }
    },
    synonyms: {
      es: ['tomate', 'jitomate', 'verdura'],
      en: ['tomato', 'vegetable', 'fruit'],
      pt: ['tomate', 'vegetal', 'fruta']
    }
  },
  {
    name: 'Lechuga',
    calories_per_100g: 15,
    protein_per_100g: 1.4,
    carbs_per_100g: 3,
    fat_per_100g: 0.2,
    fiber_per_100g: 1.3,
    sugar_per_100g: 0.8,
    sodium_per_100g: 28,
    category: 'Vegetables',
    subcategory: 'Leafy Greens',
    tags: ['verdura', 'hoja', 'fibra', 'vitamina k'],
    translations: {
      es: { name: 'Lechuga', description: 'Verdura de hoja rica en vitamina K' },
      en: { name: 'Lettuce', description: 'Leafy vegetable rich in vitamin K' },
      pt: { name: 'Alface', description: 'Vegetal folhoso rico em vitamina K' }
    },
    synonyms: {
      es: ['lechuga', 'ensalada', 'verdura'],
      en: ['lettuce', 'salad', 'leafy green'],
      pt: ['alface', 'salada', 'vegetal']
    }
  },
  {
    name: 'Zanahoria',
    calories_per_100g: 41,
    protein_per_100g: 0.9,
    carbs_per_100g: 10,
    fat_per_100g: 0.2,
    fiber_per_100g: 2.8,
    sugar_per_100g: 4.7,
    sodium_per_100g: 69,
    category: 'Vegetables',
    subcategory: 'Root Vegetables',
    tags: ['verdura', 'betacaroteno', 'vitamina a', 'fibra'],
    translations: {
      es: { name: 'Zanahoria', description: 'Verdura rica en betacaroteno y vitamina A' },
      en: { name: 'Carrot', description: 'Vegetable rich in beta-carotene and vitamin A' },
      pt: { name: 'Cenoura', description: 'Vegetal rico em betacaroteno e vitamina A' }
    },
    synonyms: {
      es: ['zanahoria', 'verdura', 'raíz'],
      en: ['carrot', 'vegetable', 'root'],
      pt: ['cenoura', 'vegetal', 'raiz']
    }
  },
  {
    name: 'Brócoli',
    calories_per_100g: 34,
    protein_per_100g: 2.8,
    carbs_per_100g: 7,
    fat_per_100g: 0.4,
    fiber_per_100g: 2.6,
    sugar_per_100g: 1.5,
    sodium_per_100g: 33,
    category: 'Vegetables',
    subcategory: 'Cruciferous',
    tags: ['verdura', 'vitamina c', 'fibra', 'antioxidante'],
    translations: {
      es: { name: 'Brócoli', description: 'Verdura rica en vitamina C y antioxidantes' },
      en: { name: 'Broccoli', description: 'Vegetable rich in vitamin C and antioxidants' },
      pt: { name: 'Brócolis', description: 'Vegetal rico em vitamina C e antioxidantes' }
    },
    synonyms: {
      es: ['brócoli', 'verdura', 'crucífera'],
      en: ['broccoli', 'vegetable', 'cruciferous'],
      pt: ['brócolis', 'vegetal', 'crucífera']
    }
  },
  {
    name: 'Pimiento',
    calories_per_100g: 31,
    protein_per_100g: 1,
    carbs_per_100g: 7,
    fat_per_100g: 0.3,
    fiber_per_100g: 2.5,
    sugar_per_100g: 4.2,
    sodium_per_100g: 4,
    category: 'Vegetables',
    subcategory: 'Nightshades',
    tags: ['verdura', 'vitamina c', 'antioxidante', 'color'],
    translations: {
      es: { name: 'Pimiento', description: 'Verdura rica en vitamina C y antioxidantes' },
      en: { name: 'Bell Pepper', description: 'Vegetable rich in vitamin C and antioxidants' },
      pt: { name: 'Pimentão', description: 'Vegetal rico em vitamina C e antioxidantes' }
    },
    synonyms: {
      es: ['pimiento', 'pimentón', 'verdura'],
      en: ['bell pepper', 'pepper', 'vegetable'],
      pt: ['pimentão', 'pimenta', 'vegetal']
    }
  },

  // CARNES Y PROTEÍNAS
  {
    name: 'Pollo',
    calories_per_100g: 165,
    protein_per_100g: 31,
    carbs_per_100g: 0,
    fat_per_100g: 3.6,
    fiber_per_100g: 0,
    sugar_per_100g: 0,
    sodium_per_100g: 74,
    category: 'Proteins',
    subcategory: 'Poultry',
    tags: ['carne', 'proteína', 'ave', 'magro'],
    translations: {
      es: { name: 'Pollo', description: 'Carne de ave magra rica en proteínas' },
      en: { name: 'Chicken', description: 'Lean poultry meat rich in protein' },
      pt: { name: 'Frango', description: 'Carne de ave magra rica em proteínas' }
    },
    synonyms: {
      es: ['pollo', 'ave', 'carne', 'proteína'],
      en: ['chicken', 'poultry', 'meat', 'protein'],
      pt: ['frango', 'ave', 'carne', 'proteína']
    }
  },
  {
    name: 'Pechuga de Pollo',
    calories_per_100g: 165,
    protein_per_100g: 31,
    carbs_per_100g: 0,
    fat_per_100g: 3.6,
    fiber_per_100g: 0,
    sugar_per_100g: 0,
    sodium_per_100g: 74,
    category: 'Proteins',
    subcategory: 'Poultry',
    tags: ['carne', 'proteína', 'magro', 'pechuga'],
    translations: {
      es: { name: 'Pechuga de Pollo', description: 'Carne de ave magra rica en proteínas' },
      en: { name: 'Chicken Breast', description: 'Lean poultry meat rich in protein' },
      pt: { name: 'Peito de Frango', description: 'Carne de ave magra rica em proteínas' }
    },
    synonyms: {
      es: ['pechuga', 'pollo', 'ave', 'carne'],
      en: ['breast', 'chicken', 'poultry', 'meat'],
      pt: ['peito', 'frango', 'ave', 'carne']
    }
  },
  {
    name: 'Salmón',
    calories_per_100g: 208,
    protein_per_100g: 25,
    carbs_per_100g: 0,
    fat_per_100g: 12,
    fiber_per_100g: 0,
    sugar_per_100g: 0,
    sodium_per_100g: 44,
    category: 'Proteins',
    subcategory: 'Fish',
    tags: ['pescado', 'omega 3', 'proteína', 'grasa saludable'],
    translations: {
      es: { name: 'Salmón', description: 'Pescado rico en omega-3 y proteínas' },
      en: { name: 'Salmon', description: 'Fish rich in omega-3 and protein' },
      pt: { name: 'Salmão', description: 'Peixe rico em ômega-3 e proteínas' }
    },
    synonyms: {
      es: ['salmón', 'pescado', 'pez', 'omega 3'],
      en: ['salmon', 'fish', 'omega 3', 'protein'],
      pt: ['salmão', 'peixe', 'omega 3', 'proteína']
    }
  },
  {
    name: 'Atún',
    calories_per_100g: 144,
    protein_per_100g: 30,
    carbs_per_100g: 0,
    fat_per_100g: 1,
    fiber_per_100g: 0,
    sugar_per_100g: 0,
    sodium_per_100g: 37,
    category: 'Proteins',
    subcategory: 'Fish',
    tags: ['pescado', 'proteína', 'magro', 'omega 3'],
    translations: {
      es: { name: 'Atún', description: 'Pescado magro rico en proteínas' },
      en: { name: 'Tuna', description: 'Lean fish rich in protein' },
      pt: { name: 'Atum', description: 'Peixe magro rico em proteínas' }
    },
    synonyms: {
      es: ['atún', 'pescado', 'pez', 'proteína'],
      en: ['tuna', 'fish', 'protein', 'lean'],
      pt: ['atum', 'peixe', 'proteína', 'magro']
    }
  },
  {
    name: 'Huevo',
    calories_per_100g: 155,
    protein_per_100g: 13,
    carbs_per_100g: 1.1,
    fat_per_100g: 11,
    fiber_per_100g: 0,
    sugar_per_100g: 1.1,
    sodium_per_100g: 124,
    category: 'Proteins',
    subcategory: 'Eggs',
    tags: ['proteína', 'huevo', 'completa', 'vitamina'],
    translations: {
      es: { name: 'Huevo', description: 'Proteína completa rica en vitaminas' },
      en: { name: 'Egg', description: 'Complete protein rich in vitamins' },
      pt: { name: 'Ovo', description: 'Proteína completa rica em vitaminas' }
    },
    synonyms: {
      es: ['huevo', 'proteína', 'completa'],
      en: ['egg', 'protein', 'complete'],
      pt: ['ovo', 'proteína', 'completa']
    }
  },

  // LÁCTEOS
  {
    name: 'Leche',
    calories_per_100g: 42,
    protein_per_100g: 3.4,
    carbs_per_100g: 5,
    fat_per_100g: 1,
    fiber_per_100g: 0,
    sugar_per_100g: 5,
    sodium_per_100g: 44,
    category: 'Dairy',
    subcategory: 'Milk',
    tags: ['lácteo', 'calcio', 'proteína', 'vitamina d'],
    translations: {
      es: { name: 'Leche', description: 'Lácteo rico en calcio y proteínas' },
      en: { name: 'Milk', description: 'Dairy rich in calcium and protein' },
      pt: { name: 'Leite', description: 'Lácteo rico em cálcio e proteínas' }
    },
    synonyms: {
      es: ['leche', 'lácteo', 'calcio'],
      en: ['milk', 'dairy', 'calcium'],
      pt: ['leite', 'lácteo', 'cálcio']
    }
  },
  {
    name: 'Yogur Griego',
    calories_per_100g: 59,
    protein_per_100g: 10,
    carbs_per_100g: 3.6,
    fat_per_100g: 0.4,
    fiber_per_100g: 0,
    sugar_per_100g: 3.6,
    sodium_per_100g: 36,
    category: 'Dairy',
    subcategory: 'Yogurt',
    tags: ['lácteo', 'proteína', 'probiótico', 'calcio'],
    translations: {
      es: { name: 'Yogur Griego', description: 'Lácteo rico en proteínas y probióticos' },
      en: { name: 'Greek Yogurt', description: 'Dairy rich in protein and probiotics' },
      pt: { name: 'Iogurte Grego', description: 'Lácteo rico em proteínas e probióticos' }
    },
    synonyms: {
      es: ['yogur', 'griego', 'lácteo', 'probiótico'],
      en: ['yogurt', 'greek', 'dairy', 'probiotic'],
      pt: ['iogurte', 'grego', 'lácteo', 'probiótico']
    }
  },
  {
    name: 'Queso',
    calories_per_100g: 113,
    protein_per_100g: 7,
    carbs_per_100g: 1,
    fat_per_100g: 9,
    fiber_per_100g: 0,
    sugar_per_100g: 1,
    sodium_per_100g: 621,
    category: 'Dairy',
    subcategory: 'Cheese',
    tags: ['lácteo', 'calcio', 'proteína', 'grasa'],
    translations: {
      es: { name: 'Queso', description: 'Lácteo rico en calcio y proteínas' },
      en: { name: 'Cheese', description: 'Dairy rich in calcium and protein' },
      pt: { name: 'Queijo', description: 'Lácteo rico em cálcio e proteínas' }
    },
    synonyms: {
      es: ['queso', 'lácteo', 'calcio'],
      en: ['cheese', 'dairy', 'calcium'],
      pt: ['queijo', 'lácteo', 'cálcio']
    }
  },

  // CEREALES Y GRANOS
  {
    name: 'Arroz',
    calories_per_100g: 130,
    protein_per_100g: 2.7,
    carbs_per_100g: 28,
    fat_per_100g: 0.3,
    fiber_per_100g: 0.4,
    sugar_per_100g: 0.1,
    sodium_per_100g: 1,
    category: 'Grains',
    subcategory: 'Rice',
    tags: ['cereal', 'carbohidrato', 'energía', 'grano'],
    translations: {
      es: { name: 'Arroz', description: 'Cereal rico en carbohidratos y energía' },
      en: { name: 'Rice', description: 'Grain rich in carbohydrates and energy' },
      pt: { name: 'Arroz', description: 'Cereal rico em carboidratos e energia' }
    },
    synonyms: {
      es: ['arroz', 'cereal', 'grano', 'carbohidrato'],
      en: ['rice', 'grain', 'cereal', 'carbohydrate'],
      pt: ['arroz', 'cereal', 'grão', 'carboidrato']
    }
  },
  {
    name: 'Arroz Integral',
    calories_per_100g: 111,
    protein_per_100g: 2.6,
    carbs_per_100g: 23,
    fat_per_100g: 0.9,
    fiber_per_100g: 1.8,
    sugar_per_100g: 0.4,
    sodium_per_100g: 5,
    category: 'Grains',
    subcategory: 'Rice',
    tags: ['cereal', 'integral', 'fibra', 'grano'],
    translations: {
      es: { name: 'Arroz Integral', description: 'Cereal integral rico en fibra' },
      en: { name: 'Brown Rice', description: 'Whole grain rich in fiber' },
      pt: { name: 'Arroz Integral', description: 'Cereal integral rico em fibras' }
    },
    synonyms: {
      es: ['arroz integral', 'integral', 'fibra', 'grano'],
      en: ['brown rice', 'whole grain', 'fiber', 'grain'],
      pt: ['arroz integral', 'integral', 'fibra', 'grão']
    }
  },
  {
    name: 'Avena',
    calories_per_100g: 389,
    protein_per_100g: 17,
    carbs_per_100g: 66,
    fat_per_100g: 7,
    fiber_per_100g: 11,
    sugar_per_100g: 1,
    sodium_per_100g: 2,
    category: 'Grains',
    subcategory: 'Oats',
    tags: ['cereal', 'fibra', 'proteína', 'energía'],
    translations: {
      es: { name: 'Avena', description: 'Cereal rico en fibra y proteínas' },
      en: { name: 'Oats', description: 'Grain rich in fiber and protein' },
      pt: { name: 'Aveia', description: 'Cereal rico em fibras e proteínas' }
    },
    synonyms: {
      es: ['avena', 'cereal', 'fibra', 'energía'],
      en: ['oats', 'oatmeal', 'grain', 'fiber'],
      pt: ['aveia', 'cereal', 'fibra', 'energia']
    }
  },
  {
    name: 'Pan Integral',
    calories_per_100g: 247,
    protein_per_100g: 13,
    carbs_per_100g: 41,
    fat_per_100g: 4.2,
    fiber_per_100g: 7,
    sugar_per_100g: 4.3,
    sodium_per_100g: 681,
    category: 'Grains',
    subcategory: 'Bread',
    tags: ['pan', 'integral', 'fibra', 'carbohidrato'],
    translations: {
      es: { name: 'Pan Integral', description: 'Pan rico en fibra y nutrientes' },
      en: { name: 'Whole Wheat Bread', description: 'Bread rich in fiber and nutrients' },
      pt: { name: 'Pão Integral', description: 'Pão rico em fibras e nutrientes' }
    },
    synonyms: {
      es: ['pan integral', 'pan', 'integral', 'fibra'],
      en: ['whole wheat bread', 'bread', 'whole grain', 'fiber'],
      pt: ['pão integral', 'pão', 'integral', 'fibra']
    }
  },

  // LEGUMBRES
  {
    name: 'Frijoles',
    calories_per_100g: 127,
    protein_per_100g: 8.7,
    carbs_per_100g: 23,
    fat_per_100g: 0.5,
    fiber_per_100g: 7.4,
    sugar_per_100g: 0.3,
    sodium_per_100g: 2,
    category: 'Legumes',
    subcategory: 'Beans',
    tags: ['legumbre', 'proteína', 'fibra', 'hierro'],
    translations: {
      es: { name: 'Frijoles', description: 'Legumbre rica en proteínas y fibra' },
      en: { name: 'Beans', description: 'Legume rich in protein and fiber' },
      pt: { name: 'Feijão', description: 'Leguminosa rica em proteínas e fibras' }
    },
    synonyms: {
      es: ['frijoles', 'alubias', 'legumbre', 'proteína'],
      en: ['beans', 'legume', 'protein', 'fiber'],
      pt: ['feijão', 'leguminosa', 'proteína', 'fibra']
    }
  },
  {
    name: 'Lentejas',
    calories_per_100g: 116,
    protein_per_100g: 9,
    carbs_per_100g: 20,
    fat_per_100g: 0.4,
    fiber_per_100g: 7.9,
    sugar_per_100g: 1.8,
    sodium_per_100g: 2,
    category: 'Legumes',
    subcategory: 'Lentils',
    tags: ['legumbre', 'proteína', 'fibra', 'hierro'],
    translations: {
      es: { name: 'Lentejas', description: 'Legumbre rica en proteínas y hierro' },
      en: { name: 'Lentils', description: 'Legume rich in protein and iron' },
      pt: { name: 'Lentilhas', description: 'Leguminosa rica em proteínas e ferro' }
    },
    synonyms: {
      es: ['lentejas', 'legumbre', 'proteína', 'hierro'],
      en: ['lentils', 'legume', 'protein', 'iron'],
      pt: ['lentilhas', 'leguminosa', 'proteína', 'ferro']
    }
  },
  {
    name: 'Garbanzos',
    calories_per_100g: 164,
    protein_per_100g: 8.9,
    carbs_per_100g: 27,
    fat_per_100g: 2.6,
    fiber_per_100g: 7.6,
    sugar_per_100g: 4.8,
    sodium_per_100g: 7,
    category: 'Legumes',
    subcategory: 'Chickpeas',
    tags: ['legumbre', 'proteína', 'fibra', 'hierro'],
    translations: {
      es: { name: 'Garbanzos', description: 'Legumbre rica en proteínas y fibra' },
      en: { name: 'Chickpeas', description: 'Legume rich in protein and fiber' },
      pt: { name: 'Grão-de-bico', description: 'Leguminosa rica em proteínas e fibras' }
    },
    synonyms: {
      es: ['garbanzos', 'legumbre', 'proteína', 'fibra'],
      en: ['chickpeas', 'garbanzo', 'legume', 'protein'],
      pt: ['grão-de-bico', 'leguminosa', 'proteína', 'fibra']
    }
  },

  // FRUTOS SECOS
  {
    name: 'Almendras',
    calories_per_100g: 579,
    protein_per_100g: 21,
    carbs_per_100g: 22,
    fat_per_100g: 50,
    fiber_per_100g: 12,
    sugar_per_100g: 4.4,
    sodium_per_100g: 1,
    category: 'Nuts',
    subcategory: 'Tree Nuts',
    tags: ['fruto seco', 'grasa saludable', 'proteína', 'magnesio'],
    translations: {
      es: { name: 'Almendras', description: 'Fruto seco rico en grasas saludables' },
      en: { name: 'Almonds', description: 'Nut rich in healthy fats' },
      pt: { name: 'Amêndoas', description: 'Fruto seco rico em gorduras saudáveis' }
    },
    synonyms: {
      es: ['almendras', 'fruto seco', 'grasa saludable'],
      en: ['almonds', 'nuts', 'healthy fats'],
      pt: ['amêndoas', 'fruto seco', 'gordura saudável']
    }
  },
  {
    name: 'Nueces',
    calories_per_100g: 654,
    protein_per_100g: 15,
    carbs_per_100g: 14,
    fat_per_100g: 65,
    fiber_per_100g: 6.7,
    sugar_per_100g: 2.6,
    sodium_per_100g: 2,
    category: 'Nuts',
    subcategory: 'Tree Nuts',
    tags: ['fruto seco', 'omega 3', 'grasa saludable', 'antioxidante'],
    translations: {
      es: { name: 'Nueces', description: 'Fruto seco rico en omega-3' },
      en: { name: 'Walnuts', description: 'Nut rich in omega-3' },
      pt: { name: 'Nozes', description: 'Fruto seco rico em ômega-3' }
    },
    synonyms: {
      es: ['nueces', 'fruto seco', 'omega 3'],
      en: ['walnuts', 'nuts', 'omega 3'],
      pt: ['nozes', 'fruto seco', 'omega 3']
    }
  },
  {
    name: 'Maní',
    calories_per_100g: 567,
    protein_per_100g: 26,
    carbs_per_100g: 16,
    fat_per_100g: 49,
    fiber_per_100g: 8.5,
    sugar_per_100g: 4.7,
    sodium_per_100g: 18,
    category: 'Nuts',
    subcategory: 'Peanuts',
    tags: ['fruto seco', 'proteína', 'grasa saludable', 'fibra'],
    translations: {
      es: { name: 'Maní', description: 'Fruto seco rico en proteínas y grasas saludables' },
      en: { name: 'Peanuts', description: 'Nut rich in protein and healthy fats' },
      pt: { name: 'Amendoim', description: 'Fruto seco rico em proteínas e gorduras saudáveis' }
    },
    synonyms: {
      es: ['maní', 'cacahuete', 'fruto seco', 'proteína'],
      en: ['peanuts', 'nuts', 'protein', 'healthy fats'],
      pt: ['amendoim', 'fruto seco', 'proteína', 'gordura saudável']
    }
  },

  // BEBIDAS
  {
    name: 'Agua',
    calories_per_100g: 0,
    protein_per_100g: 0,
    carbs_per_100g: 0,
    fat_per_100g: 0,
    fiber_per_100g: 0,
    sugar_per_100g: 0,
    sodium_per_100g: 0,
    category: 'Beverages',
    subcategory: 'Water',
    tags: ['agua', 'hidratación', 'sin calorías', 'esencial'],
    translations: {
      es: { name: 'Agua', description: 'Bebida esencial para la hidratación' },
      en: { name: 'Water', description: 'Essential drink for hydration' },
      pt: { name: 'Água', description: 'Bebida essencial para hidratação' }
    },
    synonyms: {
      es: ['agua', 'hidratación', 'líquido'],
      en: ['water', 'hydration', 'liquid'],
      pt: ['água', 'hidratação', 'líquido']
    }
  },
  {
    name: 'Café',
    calories_per_100g: 2,
    protein_per_100g: 0.3,
    carbs_per_100g: 0,
    fat_per_100g: 0,
    fiber_per_100g: 0,
    sugar_per_100g: 0,
    sodium_per_100g: 5,
    category: 'Beverages',
    subcategory: 'Coffee',
    tags: ['café', 'cafeína', 'energía', 'antioxidante'],
    translations: {
      es: { name: 'Café', description: 'Bebida rica en cafeína y antioxidantes' },
      en: { name: 'Coffee', description: 'Drink rich in caffeine and antioxidants' },
      pt: { name: 'Café', description: 'Bebida rica em cafeína e antioxidantes' }
    },
    synonyms: {
      es: ['café', 'cafeína', 'energía'],
      en: ['coffee', 'caffeine', 'energy'],
      pt: ['café', 'cafeína', 'energia']
    }
  }
];

async function seedComprehensiveFoods() {
  try {
    console.log('🌱 Iniciando siembra de base de datos completa...');
    
    let insertedCount = 0;
    let skippedCount = 0;
    
    for (const foodData of comprehensiveFoods) {
      const { translations, synonyms, ...baseFoodData } = foodData;
      
      // Verificar si el alimento ya existe
      const existingFood = await db.query(
        'SELECT id FROM fitso_foods WHERE name = $1',
        [baseFoodData.name]
      );
      
      if (existingFood.rows.length > 0) {
        console.log(`⏭️  Saltando ${baseFoodData.name} (ya existe)`);
        skippedCount++;
        continue;
      }
      
      // Insertar alimento base
      const foodInsertQuery = `
        INSERT INTO fitso_foods (
          name, brand, barcode, calories_per_100g, protein_per_100g, 
          carbs_per_100g, fat_per_100g, fiber_per_100g, sugar_per_100g, 
          sodium_per_100g, category, subcategory, tags, is_custom
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING id
      `;
      
      const foodParams = [
        baseFoodData.name,
        baseFoodData.brand || null,
        baseFoodData.barcode || null,
        baseFoodData.calories_per_100g,
        baseFoodData.protein_per_100g,
        baseFoodData.carbs_per_100g,
        baseFoodData.fat_per_100g,
        baseFoodData.fiber_per_100g,
        baseFoodData.sugar_per_100g,
        baseFoodData.sodium_per_100g,
        baseFoodData.category,
        baseFoodData.subcategory,
        baseFoodData.tags,
        false
      ];
      
      const foodResult = await db.query(foodInsertQuery, foodParams);
      const foodId = foodResult.rows[0].id;
      
      // Insertar traducciones
      for (const [locale, translation] of Object.entries(translations)) {
        const translationQuery = `
          INSERT INTO fitso_food_translations (
            food_id, locale, name, description, unit_short, unit_long,
            is_machine_translated, is_reviewed, source_lang
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `;
        
        const translationParams = [
          foodId,
          locale,
          translation.name,
          translation.description,
          'g',
          'gramos',
          false,
          true,
          'es'
        ];
        
        await db.query(translationQuery, translationParams);
      }
      
      // Insertar sinónimos
      for (const [locale, localeSynonyms] of Object.entries(synonyms)) {
        for (const synonym of localeSynonyms) {
          const synonymQuery = `
            INSERT INTO fitso_food_synonyms (food_id, locale, synonym)
            VALUES ($1, $2, $3)
          `;
          
          await db.query(synonymQuery, [foodId, locale, synonym]);
        }
      }
      
      console.log(`✅ ${baseFoodData.name} insertado correctamente`);
      insertedCount++;
    }
    
    console.log(`\n🎉 Siembra completada!`);
    console.log(`📊 Alimentos insertados: ${insertedCount}`);
    console.log(`⏭️  Alimentos saltados: ${skippedCount}`);
    console.log(`📈 Total en base de datos: ${insertedCount + skippedCount}`);
    
    // Mostrar estadísticas finales
    const statsQuery = `
      SELECT 
        COUNT(*) as total_foods,
        COUNT(DISTINCT ft.locale) as locales_count,
        COUNT(fs.id) as synonyms_count
      FROM fitso_foods f
      LEFT JOIN fitso_food_translations ft ON ft.food_id = f.id
      LEFT JOIN fitso_food_synonyms fs ON fs.food_id = f.id
    `;
    
    const stats = await db.query(statsQuery);
    console.log('\n📊 Estadísticas finales:', stats.rows[0]);
    
  } catch (error) {
    console.error('❌ Error en la siembra:', error);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  seedComprehensiveFoods()
    .then(() => {
      console.log('✅ Script de siembra completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
}

module.exports = seedComprehensiveFoods;
