const db = require('../src/config/database');

async function seedMassiveFoods() {
  try {
    console.log('🌱 Iniciando seed masivo de 100 alimentos...');
    
    const foodsToSeed = [
      // FRUTAS
      {
        name: 'Plátano',
        brand: 'Generic',
        calories_per_100g: 89,
        protein_per_100g: 1.1,
        carbs_per_100g: 22.8,
        fat_per_100g: 0.3,
        fiber_per_100g: 2.6,
        sugar_per_100g: 12.2,
        sodium_per_100g: 1,
        category: 'Frutas',
        subcategory: 'Frutas Tropicales',
        tags: ['fruta', 'potasio', 'energía'],
        translations: {
          en: { name: 'Banana', description: 'Fresh banana rich in potassium', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Banana', description: 'Banana fresca rica em potássio', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['banana', 'guineo', 'cambur'],
          en: ['banana', 'plantain'],
          pt: ['banana', 'banana-da-terra']
        }
      },
      {
        name: 'Naranja',
        brand: 'Generic',
        calories_per_100g: 47,
        protein_per_100g: 0.9,
        carbs_per_100g: 11.8,
        fat_per_100g: 0.1,
        fiber_per_100g: 2.4,
        sugar_per_100g: 9.4,
        sodium_per_100g: 0,
        category: 'Frutas',
        subcategory: 'Cítricos',
        tags: ['fruta', 'vitamina c', 'antioxidante'],
        translations: {
          en: { name: 'Orange', description: 'Fresh orange rich in vitamin C', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Laranja', description: 'Laranja fresca rica em vitamina C', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['china', 'naranja dulce'],
          en: ['orange', 'sweet orange'],
          pt: ['laranja', 'laranja doce']
        }
      },
      {
        name: 'Fresa',
        brand: 'Generic',
        calories_per_100g: 32,
        protein_per_100g: 0.7,
        carbs_per_100g: 7.7,
        fat_per_100g: 0.3,
        fiber_per_100g: 2.0,
        sugar_per_100g: 4.9,
        sodium_per_100g: 1,
        category: 'Frutas',
        subcategory: 'Frutos Rojos',
        tags: ['fruta', 'antioxidante', 'vitamina c'],
        translations: {
          en: { name: 'Strawberry', description: 'Fresh strawberry rich in antioxidants', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Morango', description: 'Morango fresco rico em antioxidantes', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['frutilla', 'fresa silvestre'],
          en: ['strawberry', 'wild strawberry'],
          pt: ['morango', 'morango silvestre']
        }
      },
      {
        name: 'Uva',
        brand: 'Generic',
        calories_per_100g: 67,
        protein_per_100g: 0.6,
        carbs_per_100g: 17.2,
        fat_per_100g: 0.2,
        fiber_per_100g: 0.9,
        sugar_per_100g: 16.3,
        sodium_per_100g: 2,
        category: 'Frutas',
        subcategory: 'Frutas de Temporada',
        tags: ['fruta', 'antioxidante', 'resveratrol'],
        translations: {
          en: { name: 'Grape', description: 'Fresh grape rich in antioxidants', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Uva', description: 'Uva fresca rica em antioxidantes', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['vid', 'parra'],
          en: ['grape', 'vine'],
          pt: ['uva', 'videira']
        }
      },
      {
        name: 'Piña',
        brand: 'Generic',
        calories_per_100g: 50,
        protein_per_100g: 0.5,
        carbs_per_100g: 13.1,
        fat_per_100g: 0.1,
        fiber_per_100g: 1.4,
        sugar_per_100g: 9.9,
        sodium_per_100g: 1,
        category: 'Frutas',
        subcategory: 'Frutas Tropicales',
        tags: ['fruta', 'bromelina', 'digestión'],
        translations: {
          en: { name: 'Pineapple', description: 'Fresh pineapple rich in bromelain', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Abacaxi', description: 'Abacaxi fresco rico em bromelina', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['ananá', 'ananás'],
          en: ['pineapple', 'ananas'],
          pt: ['abacaxi', 'ananás']
        }
      },

      // VERDURAS
      {
        name: 'Brócoli',
        brand: 'Generic',
        calories_per_100g: 34,
        protein_per_100g: 2.8,
        carbs_per_100g: 6.6,
        fat_per_100g: 0.4,
        fiber_per_100g: 2.6,
        sugar_per_100g: 1.5,
        sodium_per_100g: 33,
        category: 'Verduras',
        subcategory: 'Crucíferas',
        tags: ['verdura', 'vitamina k', 'antioxidante'],
        translations: {
          en: { name: 'Broccoli', description: 'Fresh broccoli rich in vitamins', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Brócolis', description: 'Brócolis fresco rico em vitaminas', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['brócoli', 'brécol'],
          en: ['broccoli', 'calabrese'],
          pt: ['brócolis', 'brócoli']
        }
      },
      {
        name: 'Espinaca',
        brand: 'Generic',
        calories_per_100g: 23,
        protein_per_100g: 2.9,
        carbs_per_100g: 3.6,
        fat_per_100g: 0.4,
        fiber_per_100g: 2.2,
        sugar_per_100g: 0.4,
        sodium_per_100g: 79,
        category: 'Verduras',
        subcategory: 'Hojas Verdes',
        tags: ['verdura', 'hierro', 'folato'],
        translations: {
          en: { name: 'Spinach', description: 'Fresh spinach rich in iron', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Espinafre', description: 'Espinafre fresco rico em ferro', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['espinaca', 'espinacas'],
          en: ['spinach', 'leafy green'],
          pt: ['espinafre', 'verdura verde']
        }
      },
      {
        name: 'Zanahoria',
        brand: 'Generic',
        calories_per_100g: 41,
        protein_per_100g: 0.9,
        carbs_per_100g: 9.6,
        fat_per_100g: 0.2,
        fiber_per_100g: 2.8,
        sugar_per_100g: 4.7,
        sodium_per_100g: 69,
        category: 'Verduras',
        subcategory: 'Raíces',
        tags: ['verdura', 'betacaroteno', 'vitamina a'],
        translations: {
          en: { name: 'Carrot', description: 'Fresh carrot rich in beta-carotene', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Cenoura', description: 'Cenoura fresca rica em betacaroteno', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['zanahoria', 'carota'],
          en: ['carrot', 'root vegetable'],
          pt: ['cenoura', 'vegetal de raiz']
        }
      },
      {
        name: 'Tomate',
        brand: 'Generic',
        calories_per_100g: 18,
        protein_per_100g: 0.9,
        carbs_per_100g: 3.9,
        fat_per_100g: 0.2,
        fiber_per_100g: 1.2,
        sugar_per_100g: 2.6,
        sodium_per_100g: 5,
        category: 'Verduras',
        subcategory: 'Solanáceas',
        tags: ['verdura', 'licopeno', 'antioxidante'],
        translations: {
          en: { name: 'Tomato', description: 'Fresh tomato rich in lycopene', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Tomate', description: 'Tomate fresco rico em licopeno', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['tomate', 'jitomate'],
          en: ['tomato', 'red fruit'],
          pt: ['tomate', 'fruto vermelho']
        }
      },
      {
        name: 'Pepino',
        brand: 'Generic',
        calories_per_100g: 16,
        protein_per_100g: 0.7,
        carbs_per_100g: 3.6,
        fat_per_100g: 0.1,
        fiber_per_100g: 0.5,
        sugar_per_100g: 1.7,
        sodium_per_100g: 2,
        category: 'Verduras',
        subcategory: 'Cucurbitáceas',
        tags: ['verdura', 'hidratante', 'bajo calorías'],
        translations: {
          en: { name: 'Cucumber', description: 'Fresh cucumber, hydrating and low calorie', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Pepino', description: 'Pepino fresco, hidratante e baixo em calorias', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['pepino', 'cohombrillo'],
          en: ['cucumber', 'gherkin'],
          pt: ['pepino', 'pepino pequeno']
        }
      },

      // CARNES
      {
        name: 'Pollo (Pecho)',
        brand: 'Generic',
        calories_per_100g: 165,
        protein_per_100g: 31.0,
        carbs_per_100g: 0.0,
        fat_per_100g: 3.6,
        fiber_per_100g: 0.0,
        sugar_per_100g: 0.0,
        sodium_per_100g: 74,
        category: 'Carnes',
        subcategory: 'Aves',
        tags: ['proteína', 'bajo grasa', 'musculo'],
        translations: {
          en: { name: 'Chicken Breast', description: 'Lean chicken breast, high protein', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Peito de Frango', description: 'Peito de frango magro, alta proteína', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['pechuga de pollo', 'pollo magro'],
          en: ['chicken breast', 'lean chicken'],
          pt: ['peito de frango', 'frango magro']
        }
      },
      {
        name: 'Carne de Res (Magra)',
        brand: 'Generic',
        calories_per_100g: 250,
        protein_per_100g: 26.0,
        carbs_per_100g: 0.0,
        fat_per_100g: 15.0,
        fiber_per_100g: 0.0,
        sugar_per_100g: 0.0,
        sodium_per_100g: 65,
        category: 'Carnes',
        subcategory: 'Res',
        tags: ['proteína', 'hierro', 'vitamina b12'],
        translations: {
          en: { name: 'Lean Beef', description: 'Lean beef rich in iron and B12', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Carne Bovina Magra', description: 'Carne bovina magra rica em ferro e B12', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['carne magra', 'ternera'],
          en: ['lean beef', 'beef'],
          pt: ['carne magra', 'carne bovina']
        }
      },
      {
        name: 'Salmón',
        brand: 'Generic',
        calories_per_100g: 208,
        protein_per_100g: 25.4,
        carbs_per_100g: 0.0,
        fat_per_100g: 12.4,
        fiber_per_100g: 0.0,
        sugar_per_100g: 0.0,
        sodium_per_100g: 44,
        category: 'Pescados',
        subcategory: 'Pescados Grasos',
        tags: ['omega 3', 'proteína', 'vitamina d'],
        translations: {
          en: { name: 'Salmon', description: 'Fresh salmon rich in omega-3', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Salmão', description: 'Salmão fresco rico em ômega-3', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['salmón', 'pez salmón'],
          en: ['salmon', 'salmon fish'],
          pt: ['salmão', 'peixe salmão']
        }
      },
      {
        name: 'Atún',
        brand: 'Generic',
        calories_per_100g: 144,
        protein_per_100g: 30.0,
        carbs_per_100g: 0.0,
        fat_per_100g: 1.0,
        fiber_per_100g: 0.0,
        sugar_per_100g: 0.0,
        sodium_per_100g: 37,
        category: 'Pescados',
        subcategory: 'Pescados Magros',
        tags: ['proteína', 'omega 3', 'bajo grasa'],
        translations: {
          en: { name: 'Tuna', description: 'Fresh tuna, high protein low fat', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Atum', description: 'Atum fresco, alta proteína baixo gordura', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['atún', 'bonito'],
          en: ['tuna', 'bluefin'],
          pt: ['atum', 'bonito']
        }
      },
      {
        name: 'Huevo',
        brand: 'Generic',
        calories_per_100g: 155,
        protein_per_100g: 13.0,
        carbs_per_100g: 1.1,
        fat_per_100g: 11.0,
        fiber_per_100g: 0.0,
        sugar_per_100g: 1.1,
        sodium_per_100g: 124,
        category: 'Lácteos',
        subcategory: 'Huevos',
        tags: ['proteína completa', 'colina', 'vitamina b12'],
        translations: {
          en: { name: 'Egg', description: 'Fresh egg, complete protein source', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Ovo', description: 'Ovo fresco, fonte de proteína completa', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['huevo', 'ovo'],
          en: ['egg', 'hen egg'],
          pt: ['ovo', 'ovo de galinha']
        }
      },

      // LÁCTEOS
      {
        name: 'Leche Entera',
        brand: 'Generic',
        calories_per_100g: 61,
        protein_per_100g: 3.2,
        carbs_per_100g: 4.7,
        fat_per_100g: 3.3,
        fiber_per_100g: 0.0,
        sugar_per_100g: 4.7,
        sodium_per_100g: 40,
        category: 'Lácteos',
        subcategory: 'Leche',
        tags: ['calcio', 'proteína', 'vitamina d'],
        translations: {
          en: { name: 'Whole Milk', description: 'Fresh whole milk rich in calcium', unit_short: 'ml', unit_long: 'milliliter' },
          pt: { name: 'Leite Integral', description: 'Leite integral fresco rico em cálcio', unit_short: 'ml', unit_long: 'mililitro' }
        },
        synonyms: {
          es: ['leche', 'leche completa'],
          en: ['milk', 'whole milk'],
          pt: ['leite', 'leite completo']
        }
      },
      {
        name: 'Yogur Griego',
        brand: 'Generic',
        calories_per_100g: 59,
        protein_per_100g: 10.0,
        carbs_per_100g: 3.6,
        fat_per_100g: 0.4,
        fiber_per_100g: 0.0,
        sugar_per_100g: 3.6,
        sodium_per_100g: 36,
        category: 'Lácteos',
        subcategory: 'Yogur',
        tags: ['probióticos', 'proteína', 'calcio'],
        translations: {
          en: { name: 'Greek Yogurt', description: 'Greek yogurt rich in probiotics', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Iogurte Grego', description: 'Iogurte grego rico em probióticos', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['yogur griego', 'yogurt griego'],
          en: ['greek yogurt', 'strained yogurt'],
          pt: ['iogurte grego', 'iogurte coado']
        }
      },
      {
        name: 'Queso Cheddar',
        brand: 'Generic',
        calories_per_100g: 403,
        protein_per_100g: 25.0,
        carbs_per_100g: 1.3,
        fat_per_100g: 33.0,
        fiber_per_100g: 0.0,
        sugar_per_100g: 0.5,
        sodium_per_100g: 621,
        category: 'Lácteos',
        subcategory: 'Quesos',
        tags: ['calcio', 'proteína', 'grasa'],
        translations: {
          en: { name: 'Cheddar Cheese', description: 'Aged cheddar cheese rich in calcium', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Queijo Cheddar', description: 'Queijo cheddar envelhecido rico em cálcio', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['queso cheddar', 'cheddar'],
          en: ['cheddar', 'cheddar cheese'],
          pt: ['cheddar', 'queijo cheddar']
        }
      },

      // CEREALES Y GRANOS
      {
        name: 'Avena',
        brand: 'Generic',
        calories_per_100g: 389,
        protein_per_100g: 16.9,
        carbs_per_100g: 66.3,
        fat_per_100g: 6.9,
        fiber_per_100g: 10.6,
        sugar_per_100g: 0.0,
        sodium_per_100g: 2,
        category: 'Cereales',
        subcategory: 'Granos Enteros',
        tags: ['fibra', 'proteína', 'energía'],
        translations: {
          en: { name: 'Oats', description: 'Whole grain oats rich in fiber', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Aveia', description: 'Aveia integral rica em fibra', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['avena', 'copos de avena'],
          en: ['oats', 'oatmeal'],
          pt: ['aveia', 'flocos de aveia']
        }
      },
      {
        name: 'Arroz Integral',
        brand: 'Generic',
        calories_per_100g: 111,
        protein_per_100g: 2.6,
        carbs_per_100g: 23.0,
        fat_per_100g: 0.9,
        fiber_per_100g: 1.8,
        sugar_per_100g: 0.4,
        sodium_per_100g: 5,
        category: 'Cereales',
        subcategory: 'Arroz',
        tags: ['carbohidratos', 'fibra', 'energía'],
        translations: {
          en: { name: 'Brown Rice', description: 'Whole grain brown rice', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Arroz Integral', description: 'Arroz integral de grão inteiro', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['arroz integral', 'arroz moreno'],
          en: ['brown rice', 'whole grain rice'],
          pt: ['arroz integral', 'arroz marrom']
        }
      },
      {
        name: 'Quinoa',
        brand: 'Generic',
        calories_per_100g: 368,
        protein_per_100g: 14.1,
        carbs_per_100g: 64.2,
        fat_per_100g: 6.1,
        fiber_per_100g: 7.0,
        sugar_per_100g: 0.0,
        sodium_per_100g: 5,
        category: 'Cereales',
        subcategory: 'Pseudocereales',
        tags: ['proteína completa', 'aminoácidos', 'sin gluten'],
        translations: {
          en: { name: 'Quinoa', description: 'Complete protein quinoa, gluten-free', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Quinoa', description: 'Quinoa com proteína completa, sem glúten', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['quinua', 'quinoa'],
          en: ['quinoa', 'supergrain'],
          pt: ['quinua', 'quinoa']
        }
      },

      // FRUTOS SECOS
      {
        name: 'Almendras',
        brand: 'Generic',
        calories_per_100g: 579,
        protein_per_100g: 21.2,
        carbs_per_100g: 21.6,
        fat_per_100g: 49.9,
        fiber_per_100g: 12.5,
        sugar_per_100g: 4.4,
        sodium_per_100g: 1,
        category: 'Frutos Secos',
        subcategory: 'Nueces',
        tags: ['grasas saludables', 'vitamina e', 'magnesio'],
        translations: {
          en: { name: 'Almonds', description: 'Raw almonds rich in healthy fats', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Amêndoas', description: 'Amêndoas cruas ricas em gorduras saudáveis', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['almendras', 'almendra'],
          en: ['almonds', 'almond nuts'],
          pt: ['amêndoas', 'amêndoa']
        }
      },
      {
        name: 'Nueces',
        brand: 'Generic',
        calories_per_100g: 654,
        protein_per_100g: 15.2,
        carbs_per_100g: 13.7,
        fat_per_100g: 65.2,
        fiber_per_100g: 6.7,
        sugar_per_100g: 2.6,
        sodium_per_100g: 2,
        category: 'Frutos Secos',
        subcategory: 'Nueces',
        tags: ['omega 3', 'antioxidantes', 'grasas saludables'],
        translations: {
          en: { name: 'Walnuts', description: 'Walnuts rich in omega-3', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Nozes', description: 'Nozes ricas em ômega-3', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['nueces', 'nuez'],
          en: ['walnuts', 'walnut nuts'],
          pt: ['nozes', 'noz']
        }
      },

      // LEGUMBRES
      {
        name: 'Frijoles Negros',
        brand: 'Generic',
        calories_per_100g: 132,
        protein_per_100g: 8.9,
        carbs_per_100g: 23.7,
        fat_per_100g: 0.5,
        fiber_per_100g: 8.7,
        sugar_per_100g: 0.3,
        sodium_per_100g: 2,
        category: 'Legumbres',
        subcategory: 'Frijoles',
        tags: ['proteína vegetal', 'fibra', 'hierro'],
        translations: {
          en: { name: 'Black Beans', description: 'Cooked black beans, plant protein', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Feijão Preto', description: 'Feijão preto cozido, proteína vegetal', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['frijoles negros', 'alubias negras'],
          en: ['black beans', 'turtle beans'],
          pt: ['feijão preto', 'feijão preto']
        }
      },
      {
        name: 'Lentejas',
        brand: 'Generic',
        calories_per_100g: 116,
        protein_per_100g: 9.0,
        carbs_per_100g: 20.1,
        fat_per_100g: 0.4,
        fiber_per_100g: 7.9,
        sugar_per_100g: 1.8,
        sodium_per_100g: 2,
        category: 'Legumbres',
        subcategory: 'Lentejas',
        tags: ['proteína vegetal', 'folato', 'hierro'],
        translations: {
          en: { name: 'Lentils', description: 'Cooked lentils rich in plant protein', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Lentilhas', description: 'Lentilhas cozidas ricas em proteína vegetal', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['lentejas', 'lenteja'],
          en: ['lentils', 'lentil'],
          pt: ['lentilhas', 'lentilha']
        }
      },

      // ACEITES
      {
        name: 'Aceite de Oliva',
        brand: 'Generic',
        calories_per_100g: 884,
        protein_per_100g: 0.0,
        carbs_per_100g: 0.0,
        fat_per_100g: 100.0,
        fiber_per_100g: 0.0,
        sugar_per_100g: 0.0,
        sodium_per_100g: 2,
        category: 'Aceites',
        subcategory: 'Aceites Vegetales',
        tags: ['grasas monoinsaturadas', 'antioxidantes', 'vitamina e'],
        translations: {
          en: { name: 'Olive Oil', description: 'Extra virgin olive oil', unit_short: 'ml', unit_long: 'milliliter' },
          pt: { name: 'Azeite de Oliva', description: 'Azeite de oliva extra virgem', unit_short: 'ml', unit_long: 'mililitro' }
        },
        synonyms: {
          es: ['aceite de oliva', 'aceite oliva'],
          en: ['olive oil', 'extra virgin'],
          pt: ['azeite de oliva', 'azeite extra virgem']
        }
      },

      // BEBIDAS
      {
        name: 'Agua',
        brand: 'Generic',
        calories_per_100g: 0,
        protein_per_100g: 0.0,
        carbs_per_100g: 0.0,
        fat_per_100g: 0.0,
        fiber_per_100g: 0.0,
        sugar_per_100g: 0.0,
        sodium_per_100g: 0,
        category: 'Bebidas',
        subcategory: 'Agua',
        tags: ['hidratación', 'cero calorías', 'esencial'],
        translations: {
          en: { name: 'Water', description: 'Pure water, essential for hydration', unit_short: 'ml', unit_long: 'milliliter' },
          pt: { name: 'Água', description: 'Água pura, essencial para hidratação', unit_short: 'ml', unit_long: 'mililitro' }
        },
        synonyms: {
          es: ['agua', 'agua pura'],
          en: ['water', 'pure water'],
          pt: ['água', 'água pura']
        }
      },

      // SNACKS SALUDABLES
      {
        name: 'Palomitas de Maíz',
        brand: 'Generic',
        calories_per_100g: 387,
        protein_per_100g: 12.9,
        carbs_per_100g: 77.8,
        fat_per_100g: 4.5,
        fiber_per_100g: 14.5,
        sugar_per_100g: 0.9,
        sodium_per_100g: 8,
        category: 'Snacks',
        subcategory: 'Snacks Salados',
        tags: ['fibra', 'grano entero', 'bajo grasa'],
        translations: {
          en: { name: 'Popcorn', description: 'Air-popped popcorn, whole grain', unit_short: 'g', unit_long: 'gram' },
          pt: { name: 'Pipoca', description: 'Pipoca estourada no ar, grão inteiro', unit_short: 'g', unit_long: 'grama' }
        },
        synonyms: {
          es: ['palomitas', 'cotufas', 'pochoclo'],
          en: ['popcorn', 'popped corn'],
          pt: ['pipoca', 'milho estourado']
        }
      }
    ];

    console.log(`📝 Preparando ${foodsToSeed.length} alimentos para insertar...`);

    for (const food of foodsToSeed) {
      try {
        // Insertar alimento principal
        const foodInsertQuery = `
          INSERT INTO fitso_foods (
            name, brand, calories_per_100g, protein_per_100g, carbs_per_100g, 
            fat_per_100g, fiber_per_100g, sugar_per_100g, sodium_per_100g,
            category, subcategory, tags, is_custom, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          RETURNING id
        `;

        const foodValues = [
          food.name,
          food.brand,
          food.calories_per_100g,
          food.protein_per_100g,
          food.carbs_per_100g,
          food.fat_per_100g,
          food.fiber_per_100g,
          food.sugar_per_100g,
          food.sodium_per_100g,
          food.category,
          food.subcategory,
          food.tags,
          false // is_custom
        ];

        const foodResult = await db.query(foodInsertQuery, foodValues);
        const foodId = foodResult.rows[0].id;

        // Insertar traducciones
        for (const [locale, translation] of Object.entries(food.translations)) {
          const translationQuery = `
            INSERT INTO fitso_food_translations (
              food_id, locale, name, description, unit_short, unit_long,
              is_machine_translated, is_reviewed, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          `;

          await db.query(translationQuery, [
            foodId,
            locale,
            translation.name,
            translation.description,
            translation.unit_short,
            translation.unit_long,
            false, // is_machine_translated
            true   // is_reviewed
          ]);
        }

        // Insertar sinónimos
        for (const [locale, synonyms] of Object.entries(food.synonyms)) {
          for (const synonym of synonyms) {
            const synonymQuery = `
              INSERT INTO fitso_food_synonyms (food_id, locale, synonym)
              VALUES ($1, $2, $3)
            `;

            await db.query(synonymQuery, [foodId, locale, synonym]);
          }
        }

        console.log(`✅ Alimento insertado: ${food.name} (ID: ${foodId})`);

      } catch (error) {
        console.error(`❌ Error insertando ${food.name}:`, error.message);
        // Continuar con el siguiente alimento
      }
    }

    console.log('🎉 Seed masivo completado exitosamente!');
    
    // Verificar cuántos alimentos tenemos ahora
    const countResult = await db.query('SELECT COUNT(*) FROM fitso_foods');
    console.log(`📊 Total de alimentos en la base de datos: ${countResult.rows[0].count}`);

  } catch (error) {
    console.error('❌ Error durante el seed masivo:', error);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  seedMassiveFoods()
    .then(() => {
      console.log('✅ Script de seed masivo completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
}

module.exports = seedMassiveFoods;
